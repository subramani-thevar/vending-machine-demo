import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { ProductService } from './product.service.js';
import { QRService } from './qr.service.js';
import { TimerService } from './timer.service.js';
import { ClientType, StateSync } from '../types/index.js';

const pickProductSchema = z.object({
  productId: z.string().regex(/^(fruit|choc|snack|drink)-\d{3}$/),
});

export class WebSocketService {
  private io: Server;
  private productService: ProductService;
  private qrService: QRService;
  private timerService: TimerService;
  private pickCounts: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(
    httpServer: HttpServer,
    productService: ProductService,
    qrService: QRService,
    timerService: TimerService
  ) {
    this.productService = productService;
    this.qrService = qrService;
    this.timerService = timerService;

    this.io = new Server(httpServer, {
      cors: {
        origin: config.nodeEnv === 'production' && config.serverHost !== 'localhost'
          ? `https://${config.serverHost}`
          : '*',
        methods: ['GET', 'POST'],
      },
      maxHttpBufferSize: 1024, // 1KB
      connectionStateRecovery: {},
    });

    this.setupEventListeners();
    this.setupConnectionHandler();

    logger.info('WebSocket service initialized');
  }

  private setupEventListeners(): void {
    // Listen for product picks
    this.productService.on('product:picked', async ({ product, version }) => {
      this.io.emit('product_updated', {
        productId: product.id,
        status: product.status,
        timestamp: new Date().toISOString(),
      });

      // Send updated QR to laptop clients
      const qr = this.qrService.getCurrentQR();
      if (qr) {
        this.io.to('laptop').emit('qr_updated', qr);
      }
    });

    // Listen for resets
    this.productService.on('products:reset', async ({ products }) => {
      const qr = this.qrService.getCurrentQR();
      this.io.emit('reset_complete', {
        products,
        qrCode: qr,
        timestamp: new Date().toISOString(),
      });
    });

    // Listen for timer ticks
    this.timerService.on('timer:tick', ({ resetIn }) => {
      this.io.to('laptop').emit('countdown_tick', { resetIn });
    });
  }

  private setupConnectionHandler(): void {
    this.io.on('connection', (socket: Socket) => {
      const clientType = (socket.handshake.query.type as ClientType) || 'mobile';
      const room = clientType === 'laptop' ? 'laptop' : 'mobile';

      // Check connection limit
      if (this.io.engine.clientsCount > config.maxConnections) {
        logger.warn('Connection rejected: max connections reached');
        socket.disconnect(true);
        return;
      }

      socket.join(room);
      logger.info('Client connected', { socketId: socket.id, clientType, room });

      // Send full state sync
      this.sendStateSync(socket);

      // Handle pick_product event
      socket.on('pick_product', (data: unknown) => {
        this.handlePickProduct(socket, data);
      });

      socket.on('disconnect', (reason) => {
        logger.info('Client disconnected', { socketId: socket.id, reason });
        this.pickCounts.delete(socket.id);
      });

      socket.on('error', (error) => {
        logger.error('Socket error', { socketId: socket.id, error: String(error) });
      });
    });
  }

  private sendStateSync(socket: Socket): void {
    const stateSync: StateSync = {
      products: this.productService.getProducts(),
      qrCode: this.qrService.getCurrentQR() || { qrCode: '', url: '', version: 0 },
      resetIn: this.timerService.getRemainingTime(),
    };
    socket.emit('state_sync', stateSync);
  }

  private handlePickProduct(socket: Socket, data: unknown): void {
    // Rate limit check (10 picks/min per socket)
    if (!this.checkPickRateLimit(socket.id)) {
      socket.emit('pick_result', {
        success: false,
        error: 'Too many pick attempts. Please wait.',
        code: 'RATE_LIMITED',
      });
      return;
    }

    // Validate payload
    const parsed = pickProductSchema.safeParse(data);
    if (!parsed.success) {
      socket.emit('pick_result', {
        success: false,
        error: 'Invalid product ID',
        code: 'INVALID_ID',
      });
      return;
    }

    const { productId } = parsed.data;
    const result = this.productService.pickProduct(productId);

    socket.emit('pick_result', {
      success: result.success,
      productId,
      error: result.error,
    });

    // Start or reset timer on successful pick
    if (result.success) {
      if (!this.timerService.isRunning()) {
        this.timerService.start();
      } else {
        this.timerService.reset();
      }
    }
  }

  private checkPickRateLimit(socketId: string): boolean {
    const now = Date.now();
    const entry = this.pickCounts.get(socketId);

    if (!entry || now > entry.resetAt) {
      this.pickCounts.set(socketId, { count: 1, resetAt: now + 60000 });
      return true;
    }

    if (entry.count >= 10) {
      return false;
    }

    entry.count++;
    return true;
  }

  getConnectionCount(): number {
    return this.io.engine.clientsCount;
  }

  close(): void {
    this.io.close();
  }
}

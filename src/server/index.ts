import { createServer } from 'http';
import { config } from './config.js';
import { logger } from './logger.js';
import { createApp } from './app.js';
import { ProductService } from './services/product.service.js';
import { QRService } from './services/qr.service.js';
import { TimerService } from './services/timer.service.js';
import { WebSocketService } from './services/websocket.service.js';

async function main() {
  // Initialize services
  const productService = new ProductService();
  const qrService = new QRService(productService);
  const timerService = new TimerService();

  // Timer resets products when it expires
  timerService.on('timer:expired', () => {
    productService.resetAll();
  });

  // Initialize QR code
  await qrService.initialize();

  // Create Express app
  const app = createApp(productService, qrService, timerService);

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize WebSocket service
  const wsService = new WebSocketService(httpServer, productService, qrService, timerService);

  // Start server
  httpServer.listen(config.port, '0.0.0.0', () => {
    logger.info('Server started', {
      port: config.port,
      env: config.nodeEnv,
      host: config.serverHost,
      resetInterval: config.resetIntervalMs,
    });
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down gracefully...');
    wsService.close();
    httpServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    // Force exit after 10 seconds
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason: String(reason) });
  });
}

main().catch((error) => {
  logger.error('Failed to start server', { error: String(error) });
  process.exit(1);
});

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { generalLimiter } from './middleware/rate-limiter.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.js';
import { createProductsRouter } from './routes/products.js';
import { createQRRouter } from './routes/qr.js';
import { createStatusRouter } from './routes/status.js';
import { ProductService } from './services/product.service.js';
import { QRService } from './services/qr.service.js';
import { TimerService } from './services/timer.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(
  productService: ProductService,
  qrService: QRService,
  timerService: TimerService
) {
  const app = express();

  // Middleware pipeline
  app.use(requestIdMiddleware);
  app.use(morgan('combined'));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", 'wss:', 'ws:'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: config.nodeEnv === 'production' && config.serverHost !== 'localhost' ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(
    cors({
      origin: config.nodeEnv === 'production' && config.serverHost !== 'localhost'
        ? `https://${config.serverHost}`
        : '*',
      methods: ['GET', 'POST'],
    })
  );
  app.use(generalLimiter);
  app.use(express.json({ limit: '1kb' }));

  // Routes
  app.use(healthRouter);
  app.use(createProductsRouter(productService));
  app.use(createQRRouter(qrService));
  app.use(createStatusRouter(productService, timerService));

  // Serve static React build in production
  const clientPath = path.resolve(__dirname, 'client');
  app.use(express.static(clientPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
      res.sendFile(path.join(clientPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    }
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

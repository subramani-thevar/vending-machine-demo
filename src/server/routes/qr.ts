import { Router, Request, Response } from 'express';
import { QRService } from '../services/qr.service.js';

export function createQRRouter(qrService: QRService): Router {
  const router = Router();

  router.get('/api/qr', (_req: Request, res: Response) => {
    const qr = qrService.getCurrentQR();
    if (!qr) {
      res.status(503).json({
        error: 'QR code not ready',
        code: 'NOT_READY',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    res.json(qr);
  });

  return router;
}

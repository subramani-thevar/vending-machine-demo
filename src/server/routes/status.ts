import { Router, Request, Response } from 'express';
import { ProductService } from '../services/product.service.js';
import { TimerService } from '../services/timer.service.js';

export function createStatusRouter(
  productService: ProductService,
  timerService: TimerService
): Router {
  const router = Router();

  router.get('/api/status', (_req: Request, res: Response) => {
    const status = productService.getStatus();
    res.json({
      ...status,
      resetIn: timerService.getRemainingTime(),
      resetIntervalMs: timerService.getIntervalMs(),
    });
  });

  return router;
}

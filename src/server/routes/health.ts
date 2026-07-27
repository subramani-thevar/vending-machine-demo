import { Router, Request, Response } from 'express';

const router = Router();
const startTime = Date.now();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRouter };

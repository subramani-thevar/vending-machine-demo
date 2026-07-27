import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const productIdSchema = z.object({
  id: z.string().regex(/^(fruit|choc|snack|drink)-\d{3}$/, 'Invalid product ID format'),
});

export function validateParams(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        code: 'INVALID_ID',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    next();
  };
}

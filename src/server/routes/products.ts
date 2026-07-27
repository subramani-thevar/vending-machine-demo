import { Router, Request, Response } from 'express';
import { ProductService } from '../services/product.service.js';
import { pickLimiter } from '../middleware/rate-limiter.js';
import { validateParams, productIdSchema } from '../middleware/validation.js';

export function createProductsRouter(productService: ProductService): Router {
  const router = Router();

  router.get('/api/products', (_req: Request, res: Response) => {
    const products = productService.getProducts();
    res.json({
      products,
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/api/products/available', (_req: Request, res: Response) => {
    const products = productService.getAvailableProducts();
    res.json({
      products,
      count: products.length,
      timestamp: new Date().toISOString(),
    });
  });

  router.post(
    '/api/products/:id/pick',
    pickLimiter,
    validateParams(productIdSchema),
    (req: Request, res: Response) => {
      const result = productService.pickProduct(req.params.id);

      if (!result.success) {
        const statusCode = result.errorCode === 'PRODUCT_NOT_FOUND' ? 404 : 409;
        res.status(statusCode).json({
          error: result.error,
          code: result.errorCode,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        product: result.product,
        remainingCount: productService.getAvailableProducts().length,
      });
    }
  );

  return router;
}

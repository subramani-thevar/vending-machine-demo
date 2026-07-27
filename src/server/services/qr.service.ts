import QRCode from 'qrcode';
import { QRData } from '../types/index.js';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { ProductService } from './product.service.js';

export class QRService {
  private currentQR: QRData | null = null;
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;

    // Listen for state changes to regenerate QR
    productService.on('product:picked', () => this.regenerate());
    productService.on('products:reset', () => this.regenerate());
  }

  async initialize(): Promise<QRData> {
    return this.regenerate();
  }

  async regenerate(): Promise<QRData> {
    const version = this.productService.getVersion();
    const protocol = config.nodeEnv === 'production' ? 'https' : 'http';
    const url = `${protocol}://${config.serverHost}/mobile?v=${version}`;

    try {
      const qrCode = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      this.currentQR = { qrCode, url, version };
      logger.info('QR code regenerated', { version, url });

      return this.currentQR;
    } catch (error) {
      logger.error('QR generation failed', { error });
      throw error;
    }
  }

  getCurrentQR(): QRData | null {
    return this.currentQR;
  }
}

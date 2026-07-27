import { EventEmitter } from 'events';
import { Product, PickResult, VendingStatus, MachineStatus } from '../types/index.js';
import { PRODUCT_SEED } from '../data/products.js';
import { logger } from '../logger.js';

export class ProductService extends EventEmitter {
  private products: Map<string, Product> = new Map();
  private version = 0;
  private lastPickAt: Date | null = null;

  constructor() {
    super();
    this.initialize();
  }

  initialize(): void {
    this.products.clear();
    for (const seed of PRODUCT_SEED) {
      this.products.set(seed.id, {
        ...seed,
        status: 'available',
        pickedAt: null,
      });
    }
    this.version = 1;
    this.lastPickAt = null;
    logger.info('ProductService initialized', { productCount: this.products.size });
  }

  getProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getAvailableProducts(): Product[] {
    return this.getProducts().filter((p) => p.status === 'available');
  }

  getProduct(id: string): Product | undefined {
    return this.products.get(id);
  }

  pickProduct(productId: string): PickResult {
    const product = this.products.get(productId);

    if (!product) {
      return { success: false, error: 'Product not found', errorCode: 'PRODUCT_NOT_FOUND' };
    }

    if (product.status === 'sold_out') {
      return { success: false, error: 'Product already picked', errorCode: 'ALREADY_PICKED' };
    }

    // Atomic state mutation
    product.status = 'sold_out';
    product.pickedAt = new Date().toISOString();
    this.version++;
    this.lastPickAt = new Date();

    logger.info('Product picked', { productId, version: this.version });

    this.emit('product:picked', { product, version: this.version });

    return { success: true, product };
  }

  resetAll(): void {
    for (const product of this.products.values()) {
      product.status = 'available';
      product.pickedAt = null;
    }
    this.version++;
    this.lastPickAt = null;

    logger.info('All products reset', { version: this.version });

    this.emit('products:reset', { products: this.getProducts(), version: this.version });
  }

  getStatus(): VendingStatus {
    const products = this.getProducts();
    const availableCount = products.filter((p) => p.status === 'available').length;
    return {
      totalProducts: products.length,
      availableCount,
      soldOutCount: products.length - availableCount,
      resetIn: 0, // Will be set by timer service
      resetIntervalMs: 0, // Will be set by timer service
    };
  }

  getMachineStatus(): MachineStatus {
    const available = this.getAvailableProducts().length;
    if (available === 0) return 'empty';
    return 'ready';
  }

  getVersion(): number {
    return this.version;
  }

  getLastPickAt(): Date | null {
    return this.lastPickAt;
  }

  toJSON(): { products: Product[]; version: number } {
    return {
      products: this.getProducts(),
      version: this.version,
    };
  }

  static fromJSON(data: { products: Product[]; version: number }): ProductService {
    const service = new ProductService();
    service.products.clear();
    for (const p of data.products) {
      service.products.set(p.id, { ...p });
    }
    service.version = data.version;
    return service;
  }
}

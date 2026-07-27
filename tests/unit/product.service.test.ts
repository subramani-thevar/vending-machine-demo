import { describe, it, expect, beforeEach } from 'vitest';
import { ProductService } from '../../src/server/services/product.service.js';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    service = new ProductService();
  });

  describe('initialization', () => {
    it('should initialize with 24 products', () => {
      expect(service.getProducts()).toHaveLength(24);
    });

    it('should have all products available initially', () => {
      const available = service.getAvailableProducts();
      expect(available).toHaveLength(24);
    });

    it('should have 6 products per category', () => {
      const products = service.getProducts();
      const fruits = products.filter((p) => p.category === 'fruits');
      const chocolates = products.filter((p) => p.category === 'chocolates');
      const snacks = products.filter((p) => p.category === 'snacks');
      const drinks = products.filter((p) => p.category === 'drinks');

      expect(fruits).toHaveLength(6);
      expect(chocolates).toHaveLength(6);
      expect(snacks).toHaveLength(6);
      expect(drinks).toHaveLength(6);
    });

    it('should start with version 1', () => {
      expect(service.getVersion()).toBe(1);
    });
  });

  describe('pickProduct', () => {
    it('should successfully pick an available product', () => {
      const result = service.pickProduct('fruit-001');
      expect(result.success).toBe(true);
      expect(result.product?.status).toBe('sold_out');
      expect(result.product?.pickedAt).toBeTruthy();
    });

    it('should fail for non-existent product', () => {
      const result = service.pickProduct('invalid-999');
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('PRODUCT_NOT_FOUND');
    });

    it('should fail for already picked product', () => {
      service.pickProduct('fruit-001');
      const result = service.pickProduct('fruit-001');
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('ALREADY_PICKED');
    });

    it('should increment version on successful pick', () => {
      const vBefore = service.getVersion();
      service.pickProduct('fruit-001');
      expect(service.getVersion()).toBe(vBefore + 1);
    });

    it('should not increment version on failed pick', () => {
      service.pickProduct('fruit-001');
      const vBefore = service.getVersion();
      service.pickProduct('fruit-001'); // Already picked
      expect(service.getVersion()).toBe(vBefore);
    });

    it('should emit product:picked event on success', () => {
      let emitted = false;
      service.on('product:picked', () => { emitted = true; });
      service.pickProduct('fruit-001');
      expect(emitted).toBe(true);
    });
  });

  describe('resetAll', () => {
    it('should restore all products to available', () => {
      service.pickProduct('fruit-001');
      service.pickProduct('choc-001');
      service.resetAll();

      const available = service.getAvailableProducts();
      expect(available).toHaveLength(24);
    });

    it('should clear all pickedAt timestamps', () => {
      service.pickProduct('fruit-001');
      service.resetAll();

      const product = service.getProduct('fruit-001');
      expect(product?.pickedAt).toBeNull();
    });

    it('should increment version', () => {
      const vBefore = service.getVersion();
      service.resetAll();
      expect(service.getVersion()).toBe(vBefore + 1);
    });

    it('should emit products:reset event', () => {
      let emitted = false;
      service.on('products:reset', () => { emitted = true; });
      service.resetAll();
      expect(emitted).toBe(true);
    });
  });

  describe('getMachineStatus', () => {
    it('should return ready when products are available', () => {
      expect(service.getMachineStatus()).toBe('ready');
    });

    it('should return empty when all products sold out', () => {
      const products = service.getProducts();
      for (const p of products) {
        service.pickProduct(p.id);
      }
      expect(service.getMachineStatus()).toBe('empty');
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      service.pickProduct('fruit-001');
      service.pickProduct('choc-003');

      const json = service.toJSON();
      const restored = ProductService.fromJSON(json);

      expect(restored.getProducts()).toHaveLength(24);
      expect(restored.getProduct('fruit-001')?.status).toBe('sold_out');
      expect(restored.getProduct('choc-003')?.status).toBe('sold_out');
      expect(restored.getProduct('fruit-002')?.status).toBe('available');
      expect(restored.getVersion()).toBe(service.getVersion());
    });
  });
});

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ProductService } from '../../src/server/services/product.service.js';
import { pickSequenceArb } from './generators.js';

describe('Round-Trip Properties (PBT)', () => {
  it('P6: serialize/deserialize round-trip preserves state', () => {
    fc.assert(
      fc.property(pickSequenceArb, (picks) => {
        const service = new ProductService();

        // Apply some picks
        for (const id of picks) {
          service.pickProduct(id);
        }

        // Serialize
        const serialized = JSON.stringify(service.toJSON());

        // Deserialize
        const parsed = JSON.parse(serialized);
        const restored = ProductService.fromJSON(parsed);

        // Compare
        const originalProducts = service.getProducts();
        const restoredProducts = restored.getProducts();

        expect(restoredProducts.length).toBe(originalProducts.length);

        for (let i = 0; i < originalProducts.length; i++) {
          expect(restoredProducts[i].id).toBe(originalProducts[i].id);
          expect(restoredProducts[i].status).toBe(originalProducts[i].status);
          expect(restoredProducts[i].name).toBe(originalProducts[i].name);
          expect(restoredProducts[i].category).toBe(originalProducts[i].category);
        }

        expect(restored.getVersion()).toBe(service.getVersion());
      }),
      { numRuns: 100 }
    );
  });
});

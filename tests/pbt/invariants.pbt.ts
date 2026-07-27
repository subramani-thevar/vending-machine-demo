import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ProductService } from '../../src/server/services/product.service.js';
import { pickSequenceArb, productIdArb } from './generators.js';

describe('Product Invariants (PBT)', () => {
  it('P1: product count is always 24 (available + sold_out = 24)', () => {
    fc.assert(
      fc.property(pickSequenceArb, (picks) => {
        const service = new ProductService();

        for (const id of picks) {
          service.pickProduct(id);
        }

        const products = service.getProducts();
        const available = products.filter((p) => p.status === 'available').length;
        const soldOut = products.filter((p) => p.status === 'sold_out').length;

        expect(available + soldOut).toBe(24);
        expect(products.length).toBe(24);
      }),
      { numRuns: 100 }
    );
  });

  it('P2: picking a sold-out product never changes state', () => {
    fc.assert(
      fc.property(pickSequenceArb, productIdArb, (picks, extraPick) => {
        const service = new ProductService();

        // Pick some products
        for (const id of picks) {
          service.pickProduct(id);
        }

        const stateBefore = JSON.stringify(service.getProducts());
        const versionBefore = service.getVersion();

        // Try to pick an already-picked product (if any were picked)
        if (picks.length > 0) {
          const result = service.pickProduct(picks[0]);
          expect(result.success).toBe(false);
          expect(result.errorCode).toBe('ALREADY_PICKED');
        }

        // State should be unchanged
        const stateAfter = JSON.stringify(service.getProducts());
        expect(stateAfter).toBe(stateBefore);
      }),
      { numRuns: 100 }
    );
  });

  it('P3: reset is idempotent (reset(reset(state)) === reset(state))', () => {
    fc.assert(
      fc.property(pickSequenceArb, (picks) => {
        const service = new ProductService();

        for (const id of picks) {
          service.pickProduct(id);
        }

        service.resetAll();
        const stateAfterFirstReset = service.getProducts().map((p) => ({ id: p.id, status: p.status }));

        service.resetAll();
        const stateAfterSecondReset = service.getProducts().map((p) => ({ id: p.id, status: p.status }));

        expect(stateAfterSecondReset).toEqual(stateAfterFirstReset);

        // All should be available after reset
        for (const p of service.getProducts()) {
          expect(p.status).toBe('available');
          expect(p.pickedAt).toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('P4: version is strictly monotonically increasing', () => {
    fc.assert(
      fc.property(pickSequenceArb, (picks) => {
        const service = new ProductService();
        let lastVersion = service.getVersion();

        for (const id of picks) {
          const result = service.pickProduct(id);
          if (result.success) {
            const newVersion = service.getVersion();
            expect(newVersion).toBeGreaterThan(lastVersion);
            lastVersion = newVersion;
          }
        }

        // Reset also increments version
        const beforeReset = service.getVersion();
        service.resetAll();
        expect(service.getVersion()).toBeGreaterThan(beforeReset);
      }),
      { numRuns: 100 }
    );
  });

  it('P5: pick order does not affect final inventory state', () => {
    fc.assert(
      fc.property(
        pickSequenceArb,
        (picks) => {
          // Forward order
          const service1 = new ProductService();
          for (const id of picks) {
            service1.pickProduct(id);
          }

          // Reverse order
          const service2 = new ProductService();
          for (const id of [...picks].reverse()) {
            service2.pickProduct(id);
          }

          // Final states should match (ignoring pickedAt timestamps and version)
          const state1 = service1.getProducts().map((p) => ({ id: p.id, status: p.status }));
          const state2 = service2.getProducts().map((p) => ({ id: p.id, status: p.status }));

          expect(state1).toEqual(state2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

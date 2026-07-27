import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ProductService } from '../../src/server/services/product.service.js';
import { commandSequenceArb, VendingCommand } from './generators.js';

// Simplified model for stateful testing
class VendingModel {
  private soldOut: Set<string> = new Set();
  private readonly validIds: Set<string>;

  constructor() {
    this.validIds = new Set([
      'fruit-001', 'fruit-002', 'fruit-003', 'fruit-004', 'fruit-005', 'fruit-006',
      'choc-001', 'choc-002', 'choc-003', 'choc-004', 'choc-005', 'choc-006',
      'snack-001', 'snack-002', 'snack-003', 'snack-004', 'snack-005', 'snack-006',
      'drink-001', 'drink-002', 'drink-003', 'drink-004', 'drink-005', 'drink-006',
    ]);
  }

  pick(productId: string): boolean {
    if (!this.validIds.has(productId)) return false;
    if (this.soldOut.has(productId)) return false;
    this.soldOut.add(productId);
    return true;
  }

  reset(): void {
    this.soldOut.clear();
  }

  getAvailableCount(): number {
    return 24 - this.soldOut.size;
  }

  getSoldOutCount(): number {
    return this.soldOut.size;
  }

  isAvailable(productId: string): boolean {
    return this.validIds.has(productId) && !this.soldOut.has(productId);
  }
}

describe('Stateful Property Testing (PBT)', () => {
  it('P7: random command sequences match simplified model', () => {
    fc.assert(
      fc.property(commandSequenceArb, (commands) => {
        const service = new ProductService();
        const model = new VendingModel();

        for (const cmd of commands) {
          if (cmd.type === 'pick') {
            const realResult = service.pickProduct(cmd.productId);
            const modelResult = model.pick(cmd.productId);

            // Results should match
            expect(realResult.success).toBe(modelResult);
          } else if (cmd.type === 'reset') {
            service.resetAll();
            model.reset();
          }

          // After each command, verify state consistency
          const realAvailable = service.getAvailableProducts().length;
          const modelAvailable = model.getAvailableCount();
          expect(realAvailable).toBe(modelAvailable);
        }
      }),
      { numRuns: 200 }
    );
  });
});

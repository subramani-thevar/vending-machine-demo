import * as fc from 'fast-check';
import { Product, Category, ProductStatus } from '../../src/server/types/index.js';

const categories: Category[] = ['fruits', 'chocolates', 'snacks', 'drinks'];

export const categoryArb: fc.Arbitrary<Category> = fc.constantFrom(...categories);

export const productIdArb: fc.Arbitrary<string> = fc.oneof(
  fc.integer({ min: 1, max: 6 }).map((n) => `fruit-${n.toString().padStart(3, '0')}`),
  fc.integer({ min: 1, max: 6 }).map((n) => `choc-${n.toString().padStart(3, '0')}`),
  fc.integer({ min: 1, max: 6 }).map((n) => `snack-${n.toString().padStart(3, '0')}`),
  fc.integer({ min: 1, max: 6 }).map((n) => `drink-${n.toString().padStart(3, '0')}`)
);

export const invalidProductIdArb: fc.Arbitrary<string> = fc.oneof(
  fc.string({ minLength: 1, maxLength: 20 }).filter(
    (s) => !/^(fruit|choc|snack|drink)-\d{3}$/.test(s)
  ),
  fc.constant(''),
  fc.constant('invalid-999'),
  fc.constant('fruit-999')
);

export const productStatusArb: fc.Arbitrary<ProductStatus> = fc.constantFrom('available', 'sold_out');

export const productArb: fc.Arbitrary<Product> = fc.record({
  id: productIdArb,
  name: fc.string({ minLength: 1, maxLength: 50 }),
  category: categoryArb,
  imageUrl: fc.constant('/images/fruits/apple.svg'),
  status: productStatusArb,
  pickedAt: fc.option(fc.date().map((d) => d.toISOString()), { nil: null }),
});

// Generate a valid set of pick operations (subset of valid product IDs)
export const pickSequenceArb: fc.Arbitrary<string[]> = fc
  .subarray(
    [
      'fruit-001', 'fruit-002', 'fruit-003', 'fruit-004', 'fruit-005', 'fruit-006',
      'choc-001', 'choc-002', 'choc-003', 'choc-004', 'choc-005', 'choc-006',
      'snack-001', 'snack-002', 'snack-003', 'snack-004', 'snack-005', 'snack-006',
      'drink-001', 'drink-002', 'drink-003', 'drink-004', 'drink-005', 'drink-006',
    ],
    { minLength: 0, maxLength: 24 }
  )
  .chain((ids) => fc.shuffledSubarray(ids, { minLength: ids.length, maxLength: ids.length }));

// Commands for stateful testing
export type VendingCommand =
  | { type: 'pick'; productId: string }
  | { type: 'reset' };

export const vendingCommandArb: fc.Arbitrary<VendingCommand> = fc.oneof(
  productIdArb.map((productId) => ({ type: 'pick' as const, productId })),
  fc.constant({ type: 'reset' as const })
);

export const commandSequenceArb: fc.Arbitrary<VendingCommand[]> = fc.array(vendingCommandArb, {
  minLength: 0,
  maxLength: 50,
});

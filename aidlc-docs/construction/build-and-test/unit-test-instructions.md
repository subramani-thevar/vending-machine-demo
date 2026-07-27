# Unit Test Instructions — Vending Machine Demo

## Test Runner

| Tool | Version | Purpose |
|---|---|---|
| Vitest | 1.x | Test runner (Vite-native, fast) |
| fast-check | 3.x | Property-based testing framework |

## Running Unit Tests

```bash
# Run all tests (unit + PBT)
npm test

# Run with verbose output
npx vitest run --reporter=verbose

# Run specific test file
npx vitest run tests/unit/product.service.test.ts

# Run only PBT tests
npx vitest run tests/pbt/

# Run with specific seed (for reproducibility)
VITEST_SEED=12345 npm test

# Run in watch mode (development)
npm run test:watch
```

## Test Coverage

```bash
# Generate coverage report
npx vitest run --coverage

# Coverage output: coverage/lcov-report/index.html
```

## Unit Test Files

| File | Tests | Coverage |
|---|---|---|
| `tests/unit/product.service.test.ts` | ProductService CRUD, events, serialization | Product state management |
| `tests/pbt/invariants.pbt.ts` | P1-P5: Count, idempotency, version, commutativity | Business rule invariants |
| `tests/pbt/round-trip.pbt.ts` | P6: Serialization round-trip | Data integrity |
| `tests/pbt/product-state.pbt.ts` | P7: Stateful model comparison | Full state machine |

## PBT Configuration

| Setting | Value | Rationale |
|---|---|---|
| numRuns (invariants) | 100 | Sufficient for simple state space |
| numRuns (stateful) | 200 | More runs for complex sequences |
| Shrinking | Enabled (default) | PBT-08 compliance |
| Seed logging | Enabled via VITEST_SEED | PBT-08 reproducibility |

## Expected Results

```
✓ ProductService > initialization > should initialize with 24 products
✓ ProductService > initialization > should have all products available initially
✓ ProductService > initialization > should have 6 products per category
✓ ProductService > initialization > should start with version 1
✓ ProductService > pickProduct > should successfully pick an available product
✓ ProductService > pickProduct > should fail for non-existent product
✓ ProductService > pickProduct > should fail for already picked product
✓ ProductService > pickProduct > should increment version on successful pick
✓ ProductService > pickProduct > should not increment version on failed pick
✓ ProductService > pickProduct > should emit product:picked event on success
✓ ProductService > resetAll > should restore all products to available
✓ ProductService > resetAll > should clear all pickedAt timestamps
✓ ProductService > resetAll > should increment version
✓ ProductService > resetAll > should emit products:reset event
✓ ProductService > getMachineStatus > should return ready when products available
✓ ProductService > getMachineStatus > should return empty when all sold out
✓ ProductService > serialization > should serialize and deserialize correctly
✓ Product Invariants (PBT) > P1: product count is always 24
✓ Product Invariants (PBT) > P2: picking sold-out never changes state
✓ Product Invariants (PBT) > P3: reset is idempotent
✓ Product Invariants (PBT) > P4: version is strictly monotonically increasing
✓ Product Invariants (PBT) > P5: pick order does not affect final state
✓ Round-Trip Properties (PBT) > P6: serialize/deserialize round-trip
✓ Stateful Property Testing (PBT) > P7: random commands match model
```

## Troubleshooting

| Issue | Solution |
|---|---|
| PBT flaky failure | Record seed, reproduce with `VITEST_SEED=<seed> npm test` |
| Import errors | Ensure `tsconfig.json` has correct paths |
| Timeout in stateful tests | Reduce `numRuns` or increase test timeout |

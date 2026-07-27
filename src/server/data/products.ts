import { Product } from '../types/index.js';

export const PRODUCT_SEED: Omit<Product, 'status' | 'pickedAt'>[] = [
  // Fruits
  { id: 'fruit-001', name: 'Apple', category: 'fruits', imageUrl: '/images/fruits/apple.svg' },
  { id: 'fruit-002', name: 'Banana', category: 'fruits', imageUrl: '/images/fruits/banana.svg' },
  { id: 'fruit-003', name: 'Orange', category: 'fruits', imageUrl: '/images/fruits/orange.svg' },
  { id: 'fruit-004', name: 'Grapes', category: 'fruits', imageUrl: '/images/fruits/grapes.svg' },
  { id: 'fruit-005', name: 'Watermelon', category: 'fruits', imageUrl: '/images/fruits/watermelon.svg' },
  { id: 'fruit-006', name: 'Mango', category: 'fruits', imageUrl: '/images/fruits/mango.svg' },

  // Chocolates
  { id: 'choc-001', name: 'Milk Chocolate', category: 'chocolates', imageUrl: '/images/chocolates/milk.svg' },
  { id: 'choc-002', name: 'Dark Chocolate', category: 'chocolates', imageUrl: '/images/chocolates/dark.svg' },
  { id: 'choc-003', name: 'White Chocolate', category: 'chocolates', imageUrl: '/images/chocolates/white.svg' },
  { id: 'choc-004', name: 'Hazelnut Bar', category: 'chocolates', imageUrl: '/images/chocolates/hazelnut.svg' },
  { id: 'choc-005', name: 'Caramel Bar', category: 'chocolates', imageUrl: '/images/chocolates/caramel.svg' },
  { id: 'choc-006', name: 'Mint Chocolate', category: 'chocolates', imageUrl: '/images/chocolates/mint.svg' },

  // Snacks
  { id: 'snack-001', name: 'Potato Chips', category: 'snacks', imageUrl: '/images/snacks/chips.svg' },
  { id: 'snack-002', name: 'Cookies', category: 'snacks', imageUrl: '/images/snacks/cookies.svg' },
  { id: 'snack-003', name: 'Popcorn', category: 'snacks', imageUrl: '/images/snacks/popcorn.svg' },
  { id: 'snack-004', name: 'Pretzels', category: 'snacks', imageUrl: '/images/snacks/pretzels.svg' },
  { id: 'snack-005', name: 'Granola Bar', category: 'snacks', imageUrl: '/images/snacks/granola.svg' },
  { id: 'snack-006', name: 'Trail Mix', category: 'snacks', imageUrl: '/images/snacks/trailmix.svg' },

  // Drinks
  { id: 'drink-001', name: 'Water', category: 'drinks', imageUrl: '/images/drinks/water.svg' },
  { id: 'drink-002', name: 'Orange Juice', category: 'drinks', imageUrl: '/images/drinks/oj.svg' },
  { id: 'drink-003', name: 'Cola', category: 'drinks', imageUrl: '/images/drinks/cola.svg' },
  { id: 'drink-004', name: 'Lemonade', category: 'drinks', imageUrl: '/images/drinks/lemonade.svg' },
  { id: 'drink-005', name: 'Iced Tea', category: 'drinks', imageUrl: '/images/drinks/icedtea.svg' },
  { id: 'drink-006', name: 'Milk', category: 'drinks', imageUrl: '/images/drinks/milk.svg' },
];

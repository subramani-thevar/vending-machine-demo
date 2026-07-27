import { Product } from '../types/index.js';

export const PRODUCT_SEED: Omit<Product, 'status' | 'pickedAt'>[] = [
  // Fruits
  { id: 'fruit-001', name: 'Apple', category: 'fruits', imageUrl: '/images/fruits/apple.svg', price: 35 },
  { id: 'fruit-002', name: 'Banana', category: 'fruits', imageUrl: '/images/fruits/banana.svg', price: 30 },
  { id: 'fruit-003', name: 'Orange', category: 'fruits', imageUrl: '/images/fruits/orange.svg', price: 40 },
  { id: 'fruit-004', name: 'Grapes', category: 'fruits', imageUrl: '/images/fruits/grapes.svg', price: 55 },
  { id: 'fruit-005', name: 'Watermelon', category: 'fruits', imageUrl: '/images/fruits/watermelon.svg', price: 60 },
  { id: 'fruit-006', name: 'Mango', category: 'fruits', imageUrl: '/images/fruits/mango.svg', price: 50 },

  // Chocolates
  { id: 'choc-001', name: 'Milk Chocolate', category: 'chocolates', imageUrl: '/images/chocolates/milk.svg', price: 45 },
  { id: 'choc-002', name: 'Dark Chocolate', category: 'chocolates', imageUrl: '/images/chocolates/dark.svg', price: 55 },
  { id: 'choc-003', name: 'White Chocolate', category: 'chocolates', imageUrl: '/images/chocolates/white.svg', price: 50 },
  { id: 'choc-004', name: 'Hazelnut Bar', category: 'chocolates', imageUrl: '/images/chocolates/hazelnut.svg', price: 65 },
  { id: 'choc-005', name: 'Caramel Bar', category: 'chocolates', imageUrl: '/images/chocolates/caramel.svg', price: 60 },
  { id: 'choc-006', name: 'Mint Chocolate', category: 'chocolates', imageUrl: '/images/chocolates/mint.svg', price: 50 },

  // Snacks
  { id: 'snack-001', name: 'Potato Chips', category: 'snacks', imageUrl: '/images/snacks/chips.svg', price: 35 },
  { id: 'snack-002', name: 'Cookies', category: 'snacks', imageUrl: '/images/snacks/cookies.svg', price: 40 },
  { id: 'snack-003', name: 'Popcorn', category: 'snacks', imageUrl: '/images/snacks/popcorn.svg', price: 45 },
  { id: 'snack-004', name: 'Pretzels', category: 'snacks', imageUrl: '/images/snacks/pretzels.svg', price: 35 },
  { id: 'snack-005', name: 'Granola Bar', category: 'snacks', imageUrl: '/images/snacks/granola.svg', price: 50 },
  { id: 'snack-006', name: 'Trail Mix', category: 'snacks', imageUrl: '/images/snacks/trailmix.svg', price: 55 },

  // Drinks
  { id: 'drink-001', name: 'Water', category: 'drinks', imageUrl: '/images/drinks/water.svg', price: 30 },
  { id: 'drink-002', name: 'Orange Juice', category: 'drinks', imageUrl: '/images/drinks/oj.svg', price: 45 },
  { id: 'drink-003', name: 'Cola', category: 'drinks', imageUrl: '/images/drinks/cola.svg', price: 40 },
  { id: 'drink-004', name: 'Lemonade', category: 'drinks', imageUrl: '/images/drinks/lemonade.svg', price: 40 },
  { id: 'drink-005', name: 'Iced Tea', category: 'drinks', imageUrl: '/images/drinks/icedtea.svg', price: 45 },
  { id: 'drink-006', name: 'Milk', category: 'drinks', imageUrl: '/images/drinks/milk.svg', price: 35 },
];

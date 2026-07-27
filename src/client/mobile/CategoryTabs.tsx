import React from 'react';
import { Category, Product, CATEGORY_COLORS } from '../types';

interface Props {
  selected: Category | 'all';
  onSelect: (category: Category | 'all') => void;
  products: Product[];
}

const categories: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fruits', label: '🍎 Fruits' },
  { key: 'chocolates', label: '🍫 Chocolates' },
  { key: 'snacks', label: '🍿 Snacks' },
  { key: 'drinks', label: '🥤 Drinks' },
];

export function CategoryTabs({ selected, onSelect, products }: Props) {
  const getCount = (cat: Category | 'all'): number => {
    if (cat === 'all') return products.filter((p) => p.status === 'available').length;
    return products.filter((p) => p.category === cat && p.status === 'available').length;
  };

  return (
    <div className="flex overflow-x-auto px-2 pb-2 gap-1 scrollbar-hide">
      {categories.map(({ key, label }) => {
        const count = getCount(key);
        const isActive = selected === key;
        const color = key !== 'all' ? CATEGORY_COLORS[key as Category] : undefined;

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={isActive && color ? { backgroundColor: color } : undefined}
            aria-pressed={isActive}
          >
            {label}
            <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

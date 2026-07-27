import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
  onPick: (productId: string) => void;
}

export function ProductGrid({ products, onPick }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onPick={onPick}
        />
      ))}
    </div>
  );
}

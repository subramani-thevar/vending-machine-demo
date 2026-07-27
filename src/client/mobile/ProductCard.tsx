import React, { useState } from 'react';
import { Product, CATEGORY_COLORS } from '../types';

interface Props {
  product: Product;
  onPick: (productId: string) => void;
}

export function ProductCard({ product, onPick }: Props) {
  const [picking, setPicking] = useState(false);
  const isSoldOut = product.status === 'sold_out';
  const disabled = isSoldOut || picking;

  const handlePick = () => {
    if (disabled) return;
    setPicking(true);
    onPick(product.id);
    setTimeout(() => setPicking(false), 1000);
  };

  const categoryColor = CATEGORY_COLORS[product.category];

  return (
    <button
      onClick={handlePick}
      disabled={disabled}
      className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 min-h-[140px] ${
        isSoldOut
          ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
          : picking
          ? 'bg-green-50 border-green-400 scale-95'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md active:scale-95'
      }`}
      aria-disabled={disabled}
      aria-label={`${product.name}${isSoldOut ? ' - Sold Out' : ''}`}
    >
      {/* Category indicator */}
      <div
        className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: categoryColor }}
      />

      {/* Product image */}
      <div className="w-16 h-16 flex items-center justify-center mb-2">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-contain ${isSoldOut ? 'grayscale' : ''}`}
          loading="lazy"
        />
      </div>

      {/* Product name */}
      <span className={`text-xs font-medium text-center leading-tight ${
        isSoldOut ? 'text-gray-400' : 'text-gray-700'
      }`}>
        {product.name}
      </span>

      {/* Sold out overlay */}
      {isSoldOut && (
        <span className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
          <span className="text-xs font-bold text-red-400 bg-white px-2 py-0.5 rounded">
            Sold Out
          </span>
        </span>
      )}

      {/* Picking animation */}
      {picking && (
        <span className="absolute inset-0 flex items-center justify-center bg-green-50/80 rounded-xl">
          <span className="text-2xl">✓</span>
        </span>
      )}
    </button>
  );
}

import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Category } from '../types';
import { CategoryTabs } from './CategoryTabs';
import { ProductGrid } from './ProductGrid';
import { PickConfirmation } from './PickConfirmation';

export function MobileApp() {
  const { connected, products, pickProduct, lastPickResult } = useSocket('mobile');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [pickedProductName, setPickedProductName] = useState<string | null>(null);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handlePick = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setPickedProductName(product.name);
      pickProduct(productId);
    }
  };

  const availableCount = products.filter((p) => p.status === 'available').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">🏪 Vending Machine</h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}
              aria-label={connected ? 'Connected' : 'Disconnected'}
            />
            <span className="text-xs text-gray-500">
              {availableCount}/{products.length}
            </span>
          </div>
        </div>
        <CategoryTabs
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          products={products}
        />
      </header>

      {/* Product grid */}
      <main className="p-4">
        {availableCount === 0 && products.length > 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-gray-600 font-medium">All products have been picked!</p>
            <p className="text-gray-400 text-sm mt-1">Restocking soon...</p>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} onPick={handlePick} />
        )}
      </main>

      {/* Pick confirmation toast */}
      <PickConfirmation
        productName={pickedProductName}
        success={lastPickResult?.success ?? false}
        onDismiss={() => setPickedProductName(null)}
      />
    </div>
  );
}

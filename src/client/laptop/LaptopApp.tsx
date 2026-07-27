import React from 'react';
import { useSocket } from '../hooks/useSocket';
import { QRCodePanel } from './QRCodePanel';
import { StatusBar } from './StatusBar';
import { Product, CATEGORY_COLORS } from '../types';

export function LaptopApp() {
  const { connected, products, qrCode, resetIn } = useSocket('laptop');

  const available = products.filter((p) => p.status === 'available').length;

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col overflow-hidden">
      <StatusBar connected={connected} products={products} resetIn={resetIn} />

      <div className="flex-1 flex items-center justify-center p-6 gap-6">
        {/* Vending Machine */}
        <div className="relative bg-gray-700 rounded-2xl border-4 border-gray-600 shadow-2xl p-4 max-w-2xl w-full"
             style={{ maxHeight: '80vh' }}>
          {/* Machine header */}
          <div className="bg-green-600 rounded-lg px-4 py-2 mb-4 text-center">
            <h2 className="text-white font-bold text-lg tracking-wide">🏪 VENDING MACHINE</h2>
            <p className="text-green-100 text-xs">{available}/24 products available</p>
          </div>

          {/* Glass panel with products */}
          <div className="bg-gray-900/50 rounded-xl p-3 border-2 border-gray-500/30 backdrop-blur-sm"
               style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)' }}>
            <div className="grid grid-cols-4 gap-2">
              {products.map((product) => (
                <ProductSlot key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Machine bottom */}
          <div className="mt-3 bg-gray-800 rounded-lg p-2 flex items-center justify-center">
            <div className="w-16 h-6 bg-gray-900 rounded border border-gray-600" />
          </div>
        </div>

        {/* QR Code Panel */}
        <div className="flex-shrink-0">
          <QRCodePanel qrCode={qrCode} />
        </div>
      </div>
    </div>
  );
}

function ProductSlot({ product }: { product: Product }) {
  const isSoldOut = product.status === 'sold_out';
  const color = CATEGORY_COLORS[product.category];

  return (
    <div
      className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
        isSoldOut ? 'opacity-40 grayscale' : 'hover:scale-105'
      }`}
      style={{ backgroundColor: isSoldOut ? '#333' : `${color}22`, border: `2px solid ${isSoldOut ? '#555' : color}` }}
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-10 h-10 object-contain mb-1"
        loading="lazy"
      />
      <span className="text-[10px] text-white text-center leading-tight truncate w-full">
        {product.name}
      </span>
      <span className="text-[9px] text-yellow-300 font-bold mt-0.5">₹{product.price}</span>
      {isSoldOut && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
          <span className="text-[9px] font-bold text-red-400 bg-black/70 px-1 rounded">SOLD</span>
        </div>
      )}
    </div>
  );
}

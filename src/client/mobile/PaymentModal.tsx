import React, { useMemo } from 'react';
import { Product } from '../types';

interface Props {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}

const UPI_ID = 'submani-2@okhdfcbank';

export function PaymentModal({ product, onConfirm, onCancel }: Props) {
  // Generate UPI deep link for QR code
  const upiUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: 'Vending Machine',
      am: product.price.toString(),
      cu: 'INR',
      tn: `Payment for ${product.name}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [product]);

  // Use a QR code API to render the UPI QR (no extra dependency needed)
  const qrImageUrl = useMemo(() => {
    const encoded = encodeURIComponent(upiUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
  }, [upiUrl]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4 text-white">
          <h2 id="payment-title" className="text-lg font-bold">Pay with UPI</h2>
          <p className="text-sm text-purple-100 mt-0.5">Scan QR code or use UPI ID</p>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col items-center">
          {/* Product info */}
          <div className="flex items-center gap-3 w-full mb-4 p-3 bg-gray-50 rounded-lg">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-12 object-contain"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-800">{product.name}</p>
              <p className="text-xs text-gray-500 capitalize">{product.category}</p>
            </div>
            <p className="text-xl font-bold text-green-600">₹{product.price}</p>
          </div>

          {/* QR Code */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 mb-3">
            <img
              src={qrImageUrl}
              alt="UPI Payment QR Code"
              className="w-48 h-48"
              loading="eager"
            />
          </div>

          {/* UPI ID display */}
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 mb-1">Or pay to UPI ID</p>
            <p className="font-mono text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg select-all">
              {UPI_ID}
            </p>
          </div>

          {/* Amount */}
          <div className="text-center mb-5">
            <p className="text-xs text-gray-400">Amount to pay</p>
            <p className="text-2xl font-bold text-gray-900">₹{product.price}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 active:scale-95 transition-all shadow-md"
            >
              ✓ Payment Done
            </button>
          </div>
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 bg-gray-50 border-t">
          <p className="text-xs text-gray-400 text-center">
            Demo only — tap "Payment Done" after completing your UPI payment
          </p>
        </div>
      </div>
    </div>
  );
}

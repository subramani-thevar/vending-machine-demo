import React, { useState, useEffect } from 'react';
import { QRData } from '../types';

interface Props {
  qrCode: QRData | null;
}

export function QRCodePanel({ qrCode }: Props) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (qrCode) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [qrCode?.version]);

  if (!qrCode) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl">
        <div className="w-48 h-48 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-4 rounded-xl shadow-2xl transition-transform duration-200 ${
        pulse ? 'scale-105' : 'scale-100'
      }`}
    >
      <img
        src={qrCode.qrCode}
        alt="QR code to scan with phone camera"
        className="w-48 h-48"
        width={200}
        height={200}
      />
      <p className="text-center text-sm font-semibold text-gray-700 mt-2">
        📱 Scan me to pick a product!
      </p>
    </div>
  );
}

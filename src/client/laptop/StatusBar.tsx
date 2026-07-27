import React from 'react';
import { Product } from '../types';

interface Props {
  connected: boolean;
  products: Product[];
  resetIn: number;
}

export function StatusBar({ connected, products, resetIn }: Props) {
  const available = products.filter((p) => p.status === 'available').length;
  const total = products.length;

  const formatTime = (ms: number): string => {
    if (ms <= 0) return '';
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = resetIn > 0 && resetIn <= 30000;

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-black/30 backdrop-blur-sm">
      {/* Connection indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}
          aria-label={connected ? 'Connected' : 'Disconnected'}
        />
        <span className="text-white/70 text-sm">
          {connected ? 'Live' : 'Reconnecting...'}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-white text-xl font-bold tracking-wide">
        🏪 Vending Machine Demo
      </h1>

      {/* Product counter + timer */}
      <div className="flex items-center gap-4">
        <span className="text-white/80 text-sm">
          {available}/{total} available
        </span>
        {resetIn > 0 && (
          <span
            className={`text-sm font-mono ${
              isUrgent ? 'text-orange-400 animate-pulse' : 'text-white/60'
            }`}
            aria-live="polite"
          >
            Restocking in {formatTime(resetIn)}
          </span>
        )}
      </div>
    </div>
  );
}

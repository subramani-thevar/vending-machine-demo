import React, { useEffect, useState } from 'react';

interface Props {
  productName: string | null;
  success: boolean;
  onDismiss: () => void;
}

export function PickConfirmation({ productName, success, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (productName && success) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [productName, success, onDismiss]);

  if (!visible || !productName) return null;

  return (
    <div
      className="fixed bottom-6 left-4 right-4 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-up z-50"
      role="alert"
      aria-live="polite"
    >
      <span className="text-xl">🎉</span>
      <span className="font-medium">You picked {productName}!</span>
    </div>
  );
}

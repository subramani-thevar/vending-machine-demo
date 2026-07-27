import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Product, QRData, PickResult } from '../types';

interface UseSocketReturn {
  connected: boolean;
  products: Product[];
  qrCode: QRData | null;
  resetIn: number;
  pickProduct: (productId: string) => void;
  lastPickResult: PickResult | null;
}

export function useSocket(clientType: 'laptop' | 'mobile'): UseSocketReturn {
  const [connected, setConnected] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [qrCode, setQrCode] = useState<QRData | null>(null);
  const [resetIn, setResetIn] = useState(0);
  const [lastPickResult, setLastPickResult] = useState<PickResult | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      query: { type: clientType },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('state_sync', (data: { products: Product[]; qrCode: QRData; resetIn: number }) => {
      setProducts(data.products);
      setQrCode(data.qrCode);
      setResetIn(data.resetIn);
    });

    socket.on('product_updated', (data: { productId: string; status: string }) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === data.productId ? { ...p, status: 'sold_out' as const, pickedAt: new Date().toISOString() } : p
        )
      );
    });

    socket.on('qr_updated', (data: QRData) => {
      setQrCode(data);
    });

    socket.on('countdown_tick', (data: { resetIn: number }) => {
      setResetIn(data.resetIn);
    });

    socket.on('reset_complete', (data: { products: Product[]; qrCode: QRData }) => {
      setProducts(data.products);
      setQrCode(data.qrCode);
      setResetIn(0);
    });

    socket.on('pick_result', (data: PickResult) => {
      setLastPickResult(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [clientType]);

  const pickProduct = useCallback((productId: string) => {
    socketRef.current?.emit('pick_product', { productId });
  }, []);

  return { connected, products, qrCode, resetIn, pickProduct, lastPickResult };
}

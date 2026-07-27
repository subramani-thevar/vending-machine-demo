export type Category = 'fruits' | 'chocolates' | 'snacks' | 'drinks';

export type ProductStatus = 'available' | 'sold_out';

export interface Product {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  status: ProductStatus;
  pickedAt: string | null;
}

export interface QRData {
  qrCode: string;
  url: string;
  version: number;
}

export interface VendingStatus {
  totalProducts: number;
  availableCount: number;
  soldOutCount: number;
  resetIn: number;
  resetIntervalMs: number;
}

export interface PickResult {
  success: boolean;
  productId?: string;
  error?: string;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  fruits: '#4CAF50',
  chocolates: '#795548',
  snacks: '#FF9800',
  drinks: '#2196F3',
};

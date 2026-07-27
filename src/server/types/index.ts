export type Category = 'fruits' | 'chocolates' | 'snacks' | 'drinks';

export type ProductStatus = 'available' | 'sold_out';

export type MachineStatus = 'ready' | 'empty' | 'restocking';

export interface Product {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  status: ProductStatus;
  pickedAt: string | null;
}

export interface PickResult {
  success: boolean;
  product?: Product;
  error?: string;
  errorCode?: 'PRODUCT_NOT_FOUND' | 'ALREADY_PICKED' | 'INVALID_ID';
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

export interface StateSync {
  products: Product[];
  qrCode: QRData;
  resetIn: number;
}

export interface ProductUpdatedEvent {
  productId: string;
  status: ProductStatus;
  timestamp: string;
}

export interface ResetCompleteEvent {
  products: Product[];
  qrCode: QRData;
  timestamp: string;
}

export type ClientType = 'laptop' | 'mobile';

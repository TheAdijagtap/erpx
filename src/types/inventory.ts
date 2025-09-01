export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  unit: string; // kg, pieces, liters, etc.
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unitPrice?: number;
  totalValue: number;
  reason: string; // 'Purchase', 'Sale', 'Adjustment', 'Damage', etc.
  reference?: string; // PO number, GR number, etc.
  date: Date;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  createdAt: Date;
}

export interface BusinessInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber?: string;
  logo?: string;
  signature?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  subtotal: number;
  sgst: number;
  cgst: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';
  date: Date;
  expectedDelivery?: Date;
  paymentTerms?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  item: InventoryItem;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface GoodsReceipt {
  id: string;
  grNumber: string;
  poId?: string;
  supplierId: string;
  supplier: Supplier;
  items: GoodsReceiptItem[];
  subtotal: number;
  sgst: number;
  cgst: number;
  total: number;
  status: 'RECEIVED' | 'QUALITY_CHECK' | 'ACCEPTED' | 'REJECTED';
  date: Date;
  notes?: string;
}

export interface GoodsReceiptItem {
  id: string;
  itemId: string;
  item: InventoryItem;
  orderedQuantity?: number;
  receivedQuantity: number;
  unitPrice: number;
  total: number;
}

export interface GSTSettings {
  enabled: boolean;
  sgstRate: number;
  cgstRate: number;
}
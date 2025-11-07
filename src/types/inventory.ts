export interface InventoryItem {
  id: string;
  name: string;
  sku: string; // Auto-generated or legacy field
  description: string;
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

export interface AdditionalCharge {
  id: string;
  name: string;
  amount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  additionalCharges: AdditionalCharge[];
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
  additionalCharges: AdditionalCharge[];
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

export interface ProformaInvoice {
  id: string;
  proformaNumber: string;
  buyerInfo: BuyerInfo;
  items: ProformaInvoiceItem[];
  additionalCharges: AdditionalCharge[];
  subtotal: number;
  sgst: number;
  cgst: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'CANCELLED';
  date: Date;
  validUntil?: Date;
  paymentTerms?: string;
  notes?: string;
}

export interface ProformaInvoiceItem {
  id: string;
  itemId: string;
  item: InventoryItem;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ProformaProduct {
  id: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  createdAt: Date;
}

export interface BuyerInfo {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LEAD';
  source: 'PROFORMA_INVOICE' | 'MANUAL';
  totalProformas: number;
  totalValue: number;
  lastContact?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerActivity {
  id: string;
  customerId: string;
  type: 'PROFORMA_CREATED' | 'PROFORMA_SENT' | 'PROFORMA_ACCEPTED' | 'NOTE_ADDED' | 'STATUS_CHANGED' | 'CONTACT_MADE';
  description: string;
  reference?: string;
  date: Date;
  createdBy?: string;
}

export interface ScrapNote {
  id: string;
  noteNumber: string;
  title: string;
  description: string;
  items: ScrapNoteItem[];
  status: 'DRAFT' | 'FINALIZED' | 'ARCHIVED';
  totalValue: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrapNoteItem {
  id: string;
  itemId?: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
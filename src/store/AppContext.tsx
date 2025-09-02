import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  InventoryItem,
  Supplier,
  PurchaseOrder,
  GoodsReceipt,
  Transaction,
  BusinessInfo,
  GSTSettings,
  PurchaseOrderItem,
  GoodsReceiptItem,
} from "@/types/inventory";

const STORAGE_KEY = "stockflow_app_state_v1";

interface AppState {
  items: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  transactions: Transaction[];
  businessInfo: BusinessInfo;
  gstSettings: GSTSettings;
}

interface AppContextValue extends AppState {
  // Inventory
  addItem: (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => string;
  updateItem: (id: string, patch: Partial<InventoryItem>) => void;
  transactItem: (
    itemId: string,
    type: "IN" | "OUT",
    quantity: number,
    reason: string,
    reference?: string,
    unitPriceOverride?: number
  ) => void;
  removeItem: (id: string) => void;

  // Suppliers
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt">) => string;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  removeSupplier: (id: string) => void;

  // Purchase Orders
  addPurchaseOrder: (
    po: Omit<PurchaseOrder, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean }
  ) => string;
  updatePurchaseOrder: (id: string, patch: Partial<PurchaseOrder>) => void;
  removePurchaseOrder: (id: string) => void;

  // Goods Receipts
  addGoodsReceipt: (
    gr: Omit<GoodsReceipt, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean }
  ) => string;
  updateGoodsReceipt: (id: string, patch: Partial<GoodsReceipt>) => void;
  removeGoodsReceipt: (id: string) => void;

  // Business
  setBusinessInfo: (info: BusinessInfo) => void;
  setGstSettings: (settings: GSTSettings) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState = (): AppState => {
  const now = new Date();
  const items: InventoryItem[] = [
    {
      id: "i1",
      name: "Office Paper A4",
      sku: "PPR-A4-001",
      description: "Premium quality A4 printing paper",
      category: "Office Supplies",
      currentStock: 150,
      minStock: 50,
      maxStock: 500,
      unitPrice: 250,
      unit: "pack",
      supplier: "s1",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "i2",
      name: "Wireless Mouse",
      sku: "TECH-MS-002",
      description: "Ergonomic wireless optical mouse",
      category: "Technology",
      currentStock: 25,
      minStock: 15,
      maxStock: 100,
      unitPrice: 1200,
      unit: "piece",
      supplier: "s2",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const suppliers: Supplier[] = [
    {
      id: "s1",
      name: "ABC Stationery Supplies",
      contactPerson: "Rajesh Kumar",
      email: "rajesh@abcstationery.com",
      phone: "+91 98765 43210",
      address: "123 Business Park, Andheri East, Mumbai, Maharashtra 400069",
      gstNumber: "27ABCDE1234F1Z5",
      createdAt: now,
    },
    {
      id: "s2",
      name: "Tech Solutions India",
      contactPerson: "Priya Sharma",
      email: "priya@techsolutions.in",
      phone: "+91 87654 32109",
      address: "456 Tech Hub, Electronic City, Bangalore, Karnataka 560100",
      gstNumber: "29XYZAB5678G2H3",
      createdAt: now,
    },
  ];

  const transactions: Transaction[] = [];

  const businessInfo: BusinessInfo = {
    id: "b1",
    name: "Your Business Name",
    address: "Your Business Address",
    phone: "+91 00000 00000",
    email: "your-email@company.com",
    gstNumber: "",
  };

  const gstSettings: GSTSettings = { enabled: true, sgstRate: 9, cgstRate: 9 };

  const purchaseOrders: PurchaseOrder[] = [];
  const goodsReceipts: GoodsReceipt[] = [];

  return { items, suppliers, purchaseOrders, goodsReceipts, transactions, businessInfo, gstSettings };
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Convert date strings back to Date objects for known fields
        const reviveDates = (obj: any) => {
          if (!obj) return obj;
          const dateFields = ["createdAt", "updatedAt", "date", "expectedDelivery"];
          for (const k of dateFields) {
            if (obj[k]) obj[k] = new Date(obj[k]);
          }
          return obj;
        };
        parsed.items = parsed.items?.map((i: any) => reviveDates(i)) ?? [];
        parsed.suppliers = parsed.suppliers?.map((s: any) => reviveDates(s)) ?? [];
        parsed.purchaseOrders = parsed.purchaseOrders?.map((p: any) => {
          reviveDates(p);
          p.items = p.items?.map((it: any) => reviveDates(it)) ?? [];
          return p;
        }) ?? [];
        parsed.goodsReceipts = parsed.goodsReceipts?.map((g: any) => {
          reviveDates(g);
          g.items = g.items?.map((it: any) => reviveDates(it)) ?? [];
          return g;
        }) ?? [];
        parsed.transactions = parsed.transactions?.map((t: any) => reviveDates(t)) ?? [];
        return parsed as AppState;
      } catch (e) {
        console.warn("Failed to parse stored app state, using defaults", e);
      }
    }
    return initialState();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Helpers
  const calcTotals = (items: Array<{ quantity: number; unitPrice: number }>, applyGST: boolean) => {
    const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const sgst = applyGST && state.gstSettings.enabled ? Math.round((subtotal * state.gstSettings.sgstRate) / 100) : 0;
    const cgst = applyGST && state.gstSettings.enabled ? Math.round((subtotal * state.gstSettings.cgstRate) / 100) : 0;
    const total = subtotal + sgst + cgst;
    return { subtotal, sgst, cgst, total };
  };

  const value: AppContextValue = useMemo(() => ({
    ...state,

    // Inventory
    addItem: (item) => {
      const id = crypto.randomUUID();
      const now = new Date();
      setState((s) => ({
        ...s,
        items: [...s.items, { ...item, id, createdAt: now, updatedAt: now }],
      }));
      return id;
    },
    updateItem: (id, patch) => {
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? { ...it, ...patch, updatedAt: new Date() } : it)),
      }));
    },
    transactItem: (itemId, type, quantity, reason, reference, unitPriceOverride) => {
      setState((s) => {
        const item = s.items.find((i) => i.id === itemId);
        if (!item) return s;
        const newQty = type === "IN" ? item.currentStock + quantity : Math.max(0, item.currentStock - quantity);
        const unitPrice = unitPriceOverride ?? item.unitPrice;
        const transaction: Transaction = {
          id: crypto.randomUUID(),
          itemId,
          type,
          quantity,
          unitPrice,
          totalValue: unitPrice * quantity,
          reason,
          reference,
          date: new Date(),
        };
        return {
          ...s,
          items: s.items.map((it) => (it.id === itemId ? { ...it, currentStock: newQty, updatedAt: new Date() } : it)),
          transactions: [transaction, ...s.transactions],
        };
      });
    },
    removeItem: (id) => {
      setState((s) => ({
        ...s,
        items: s.items.filter((it) => it.id !== id),
        transactions: s.transactions.filter((t) => t.itemId !== id),
      }));
    },

    // Suppliers
    addSupplier: (supplier) => {
      const id = crypto.randomUUID();
      setState((s) => ({
        ...s,
        suppliers: [...s.suppliers, { ...supplier, id, createdAt: new Date() }],
      }));
      return id;
    },
    updateSupplier: (id, patch) => {
      setState((s) => ({
        ...s,
        suppliers: s.suppliers.map((sp) => (sp.id === id ? { ...sp, ...patch } : sp)),
      }));
    },
    removeSupplier: (id) => {
      setState((s) => ({
        ...s,
        suppliers: s.suppliers.filter((sp) => sp.id !== id),
      }));
    },

    // POs
    addPurchaseOrder: (po) => {
      const id = crypto.randomUUID();
      const supplier = state.suppliers.find((s) => s.id === po.supplierId)!;
      const totals = calcTotals(po.items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice })), po.applyGST ?? true);
      setState((s) => ({
        ...s,
        purchaseOrders: [
          {
            ...po,
            id,
            supplier,
            subtotal: totals.subtotal,
            sgst: totals.sgst,
            cgst: totals.cgst,
            total: totals.total,
          },
          ...s.purchaseOrders,
        ],
      }));
      return id;
    },
    updatePurchaseOrder: (id, patch) => {
      setState((s) => ({
        ...s,
        purchaseOrders: s.purchaseOrders.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },
    removePurchaseOrder: (id) => {
      setState((s) => ({
        ...s,
        purchaseOrders: s.purchaseOrders.filter((p) => p.id !== id),
      }));
    },

    // GRs
    addGoodsReceipt: (gr) => {
      const id = crypto.randomUUID();
      const supplier = state.suppliers.find((s) => s.id === gr.supplierId)!;
      const totals = calcTotals(gr.items.map((i) => ({ quantity: i.receivedQuantity, unitPrice: i.unitPrice })), gr.applyGST ?? true);
      
      setState((s) => {
        // Update inventory items with received quantities
        const updatedItems = s.items.map(item => {
          const grItem = gr.items.find(gi => gi.itemId === item.id);
          if (grItem) {
            return {
              ...item,
              currentStock: item.currentStock + grItem.receivedQuantity,
              updatedAt: new Date()
            };
          }
          return item;
        });

        // Create transaction records for received items
        const newTransactions = gr.items.map(grItem => ({
          id: crypto.randomUUID(),
          itemId: grItem.itemId,
          type: 'IN' as const,
          quantity: grItem.receivedQuantity,
          unitPrice: grItem.unitPrice,
          totalValue: grItem.receivedQuantity * grItem.unitPrice,
          reason: `Goods Receipt: ${gr.grNumber}`,
          reference: gr.grNumber,
          date: gr.date
        }));

        return {
          ...s,
          items: updatedItems,
          transactions: [...newTransactions, ...s.transactions],
          goodsReceipts: [
            {
              ...gr,
              id,
              supplier,
              subtotal: totals.subtotal,
              sgst: totals.sgst,
              cgst: totals.cgst,
              total: totals.total,
            },
            ...s.goodsReceipts,
          ],
        };
      });
      return id;
    },
    updateGoodsReceipt: (id, patch) => {
      setState((s) => ({
        ...s,
        goodsReceipts: s.goodsReceipts.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      }));
    },
    removeGoodsReceipt: (id) => {
      setState((s) => ({
        ...s,
        goodsReceipts: s.goodsReceipts.filter((g) => g.id !== id),
      }));
    },

    // Business
    setBusinessInfo: (info) => setState((s) => ({ ...s, businessInfo: info })),
    setGstSettings: (settings) => setState((s) => ({ ...s, gstSettings: settings })),
  }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

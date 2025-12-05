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
  ProformaInvoice,
  Customer,
  CustomerActivity,
} from "@/types/inventory";

const STORAGE_KEY = "stockflow_app_state_v1";

interface AppState {
  items: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  proformaInvoices: ProformaInvoice[];
  transactions: Transaction[];
  customers: Customer[];
  customerActivities: CustomerActivity[];
  businessInfo: BusinessInfo;
  gstSettings: GSTSettings;
}

interface AppContextValue extends AppState {
  // Inventory
  inventoryItems: InventoryItem[];
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
    po: Omit<PurchaseOrder, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean; gstRate?: number }
  ) => string;
  updatePurchaseOrder: (id: string, patch: Partial<PurchaseOrder>) => void;
  removePurchaseOrder: (id: string) => void;

  // Goods Receipts
  addGoodsReceipt: (
    gr: Omit<GoodsReceipt, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean; gstRate?: number }
  ) => string;
  updateGoodsReceipt: (id: string, patch: Partial<GoodsReceipt>) => void;
  removeGoodsReceipt: (id: string) => void;

  // Proforma Invoices
  addProformaInvoice: (
    pi: Omit<ProformaInvoice, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean; gstRate?: number }
  ) => string;
  updateProformaInvoice: (id: string, patch: Partial<ProformaInvoice>) => void;
  removeProformaInvoice: (id: string) => void;

  // CRM / Customers
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "updatedAt" | "totalProformas" | "totalValue">) => string;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;
  addCustomerActivity: (activity: Omit<CustomerActivity, "id" | "date">) => void;
  syncCustomerFromPI: (proformaInvoice: ProformaInvoice) => void;

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
  const proformaInvoices: ProformaInvoice[] = [];
  const customers: Customer[] = [];
  const customerActivities: CustomerActivity[] = [];

  return { items, suppliers, purchaseOrders, goodsReceipts, proformaInvoices, transactions, customers, customerActivities, businessInfo, gstSettings };
};

const derivePurchaseOrderStatusFromReceipts = (po: PurchaseOrder, receipts: GoodsReceipt[]): PurchaseOrder['status'] | null => {
  if (po.status === 'CANCELLED') {
    return 'CANCELLED';
  }

  const relevantReceipts = receipts.filter((receipt) => receipt.poId === po.id && receipt.status === 'ACCEPTED');
  if (relevantReceipts.length === 0) {
    return null;
  }

  const orderedByItem = new Map<string, number>();
  po.items.forEach((item) => {
    orderedByItem.set(item.itemId, (orderedByItem.get(item.itemId) ?? 0) + item.quantity);
  });

  const receivedByItem = new Map<string, number>();
  relevantReceipts.forEach((receipt) => {
    receipt.items.forEach((item) => {
      receivedByItem.set(item.itemId, (receivedByItem.get(item.itemId) ?? 0) + item.receivedQuantity);
    });
  });

  const allItemsFulfilled = Array.from(orderedByItem.entries()).every(([itemId, orderedQty]) => {
    const received = receivedByItem.get(itemId) ?? 0;
    return received >= orderedQty;
  });

  const anyReceived = Array.from(receivedByItem.values()).some((qty) => qty > 0);
  if (!anyReceived) {
    return null;
  }

  return allItemsFulfilled ? 'RECEIVED' : 'PARTIAL';
};

const reconcilePurchaseOrdersWithReceipts = (purchaseOrders: PurchaseOrder[], receipts: GoodsReceipt[], affectedPoId?: string): PurchaseOrder[] =>
  purchaseOrders.map((po) => {
    if (po.status === 'CANCELLED') {
      return po;
    }

    // Only reconcile the affected PO when deleting a GR, or all POs when adding/updating
    const hasAnyLinkedReceipts = receipts.some((r) => r.poId === po.id);
    const shouldReconcile = affectedPoId ? po.id === affectedPoId : true;
    
    if (!shouldReconcile) {
      return po;
    }

    const derivedStatus = derivePurchaseOrderStatusFromReceipts(po, receipts);
    if (derivedStatus && derivedStatus !== po.status) {
      return { ...po, status: derivedStatus };
    }

    // Only revert to SENT if this PO had linked receipts that were deleted
    if (!derivedStatus && (po.status === 'RECEIVED' || po.status === 'PARTIAL') && !hasAnyLinkedReceipts && affectedPoId === po.id) {
      return { ...po, status: 'SENT' };
    }

    return po;
  });

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
        parsed.items = parsed.items?.map((i: any) => {
          reviveDates(i);
          // Backward compatibility: ensure description exists
          if (!i.description) {
            i.description = i.sku || "No description";
          }
          return i;
        }) ?? [];
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
        parsed.proformaInvoices = parsed.proformaInvoices?.map((p: any) => {
          reviveDates(p);
          if (p.validUntil) p.validUntil = new Date(p.validUntil);
          p.items = p.items?.map((it: any) => reviveDates(it)) ?? [];
          return p;
        }) ?? [];
        parsed.transactions = parsed.transactions?.map((t: any) => reviveDates(t)) ?? [];
        parsed.customers = parsed.customers?.map((c: any) => {
          reviveDates(c);
          if (c.lastContact) c.lastContact = new Date(c.lastContact);
          return c;
        }) ?? [];
        parsed.customerActivities = parsed.customerActivities?.map((a: any) => reviveDates(a)) ?? [];
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
  const calcTotals = (items: Array<{ quantity: number; unitPrice: number }>, applyGST: boolean, additionalCharges: Array<{ amount: number }> = [], customGstRate?: number) => {
    const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const chargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);

    let sgst = 0;
    let cgst = 0;

    if (applyGST) {
      if (customGstRate !== undefined) {
        // Use custom GST rate (divide by 200 to get half for SGST and CGST)
        sgst = parseFloat((((subtotal + chargesTotal) * customGstRate) / 200).toFixed(2));
        cgst = parseFloat((((subtotal + chargesTotal) * customGstRate) / 200).toFixed(2));
      } else if (state.gstSettings.enabled) {
        // Use global GST settings
        sgst = parseFloat((((subtotal + chargesTotal) * state.gstSettings.sgstRate) / 100).toFixed(2));
        cgst = parseFloat((((subtotal + chargesTotal) * state.gstSettings.cgstRate) / 100).toFixed(2));
      }
    }

    const total = subtotal + chargesTotal + sgst + cgst;
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      cgst: parseFloat(cgst.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  };

  const value: AppContextValue = useMemo(() => ({
    ...state,
    inventoryItems: state.items,

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
      const totals = calcTotals(po.items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice })), po.applyGST ?? true, po.additionalCharges, po.gstRate);
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
      const totals = calcTotals(gr.items.map((i) => ({ quantity: i.receivedQuantity, unitPrice: i.unitPrice })), gr.applyGST ?? true, gr.additionalCharges, gr.gstRate);

      setState((s) => {
        const supplierFromState = s.suppliers.find((sup) => sup.id === gr.supplierId) ?? state.suppliers.find((sup) => sup.id === gr.supplierId)!;

        const updatedItems = s.items.map((item) => {
          const grItem = gr.items.find((gi) => gi.itemId === item.id);
          if (grItem) {
            return {
              ...item,
              currentStock: item.currentStock + grItem.receivedQuantity,
              updatedAt: new Date(),
            };
          }
          return item;
        });

        const newTransactions = gr.items.map((grItem) => ({
          id: crypto.randomUUID(),
          itemId: grItem.itemId,
          type: 'IN' as const,
          quantity: grItem.receivedQuantity,
          unitPrice: grItem.unitPrice,
          totalValue: grItem.receivedQuantity * grItem.unitPrice,
          reason: `Goods Receipt: ${gr.grNumber}`,
          reference: gr.grNumber,
          date: gr.date,
        }));

        const { applyGST: _applyGST, ...incoming } = gr;
        const nextReceipt: GoodsReceipt = {
          ...incoming,
          id,
          supplier: supplierFromState,
          subtotal: totals.subtotal,
          sgst: totals.sgst,
          cgst: totals.cgst,
          total: totals.total,
        };
        const nextGoodsReceipts = [nextReceipt, ...s.goodsReceipts];
        const nextPurchaseOrders = reconcilePurchaseOrdersWithReceipts(s.purchaseOrders, nextGoodsReceipts);

        return {
          ...s,
          items: updatedItems,
          transactions: [...newTransactions, ...s.transactions],
          goodsReceipts: nextGoodsReceipts,
          purchaseOrders: nextPurchaseOrders,
        };
      });
      return id;
    },
    updateGoodsReceipt: (id, patch) => {
      setState((s) => {
        const nextGoodsReceipts = s.goodsReceipts.map((receipt) => (receipt.id === id ? { ...receipt, ...patch } : receipt));
        const nextPurchaseOrders = reconcilePurchaseOrdersWithReceipts(s.purchaseOrders, nextGoodsReceipts);

        return {
          ...s,
          goodsReceipts: nextGoodsReceipts,
          purchaseOrders: nextPurchaseOrders,
        };
      });
    },
    removeGoodsReceipt: (id) => {
      setState((s) => {
        const deletedGR = s.goodsReceipts.find((g) => g.id === id);
        const affectedPoId = deletedGR?.poId;
        const nextGoodsReceipts = s.goodsReceipts.filter((g) => g.id !== id);
        const nextPurchaseOrders = reconcilePurchaseOrdersWithReceipts(s.purchaseOrders, nextGoodsReceipts, affectedPoId);

        return {
          ...s,
          goodsReceipts: nextGoodsReceipts,
          purchaseOrders: nextPurchaseOrders,
        };
      });
    },

    // Proforma Invoices
    addProformaInvoice: (pi) => {
      const id = crypto.randomUUID();
      const totals = calcTotals(pi.items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice })), pi.applyGST ?? true, pi.additionalCharges, pi.gstRate);
      const newPI = {
        ...pi,
        id,
        date: pi.date || new Date(),
        subtotal: totals.subtotal,
        sgst: totals.sgst,
        cgst: totals.cgst,
        total: totals.total,
      };
      
      // Auto-sync customer from PI
      value.syncCustomerFromPI(newPI);
      
      setState((s) => ({
        ...s,
        proformaInvoices: [
          {
            ...pi,
            id,
            subtotal: totals.subtotal,
            sgst: totals.sgst,
            cgst: totals.cgst,
            total: totals.total,
          },
          ...s.proformaInvoices,
        ],
      }));
      return id;
    },
    updateProformaInvoice: (id, patch) => {
      setState((s) => ({
        ...s,
        proformaInvoices: s.proformaInvoices.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },
    removeProformaInvoice: (id) => {
      setState((s) => ({
        ...s,
        proformaInvoices: s.proformaInvoices.filter((p) => p.id !== id),
      }));
    },

    // CRM / Customers
    addCustomer: (customer) => {
      const id = crypto.randomUUID();
      const now = new Date();
      setState((s) => ({
        ...s,
        customers: [
          ...s.customers,
          { ...customer, id, totalProformas: 0, totalValue: 0, createdAt: now, updatedAt: now },
        ],
      }));
      return id;
    },
    updateCustomer: (id, patch) => {
      setState((s) => ({
        ...s,
        customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date() } : c)),
      }));
    },
    removeCustomer: (id) => {
      setState((s) => ({
        ...s,
        customers: s.customers.filter((c) => c.id !== id),
        customerActivities: s.customerActivities.filter((a) => a.customerId !== id),
      }));
    },
    addCustomerActivity: (activity) => {
      const id = crypto.randomUUID();
      setState((s) => ({
        ...s,
        customerActivities: [{ ...activity, id, date: new Date() }, ...s.customerActivities],
      }));
    },
    syncCustomerFromPI: (pi) => {
      setState((s) => {
        const { buyerInfo } = pi;
        // Check if customer already exists by email
        let customer = s.customers.find((c) => c.email.toLowerCase() === buyerInfo.email.toLowerCase());
        
        const piTotal = pi.total;
        const now = new Date();

        if (customer) {
          // Update existing customer
          const updatedCustomers = s.customers.map((c) =>
            c.id === customer!.id
              ? {
                  ...c,
                  name: buyerInfo.name,
                  contactPerson: buyerInfo.contactPerson,
                  phone: buyerInfo.phone,
                  address: buyerInfo.address,
                  gstNumber: buyerInfo.gstNumber,
                  totalProformas: c.totalProformas + 1,
                  totalValue: c.totalValue + piTotal,
                  lastContact: now,
                  updatedAt: now,
                }
              : c
          );
          return { ...s, customers: updatedCustomers };
        } else {
          // Create new customer
          const newCustomer: Customer = {
            id: crypto.randomUUID(),
            name: buyerInfo.name,
            contactPerson: buyerInfo.contactPerson,
            email: buyerInfo.email,
            phone: buyerInfo.phone,
            address: buyerInfo.address,
            gstNumber: buyerInfo.gstNumber,
            status: 'ACTIVE',
            source: 'PROFORMA_INVOICE',
            totalProformas: 1,
            totalValue: piTotal,
            lastContact: now,
            createdAt: now,
            updatedAt: now,
          };
          return { ...s, customers: [...s.customers, newCustomer] };
        }
      });
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

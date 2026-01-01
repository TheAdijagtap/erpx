import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  InventoryItem,
  Supplier,
  PurchaseOrder,
  GoodsReceipt,
  Transaction,
  BusinessInfo,
  GSTSettings,
  ProformaInvoice,
  Customer,
  CustomerActivity,
  ProformaProduct,
} from "@/types/inventory";

interface DataContextValue {
  // State
  inventoryItems: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  proformaInvoices: ProformaInvoice[];
  proformaProducts: ProformaProduct[];
  transactions: Transaction[];
  customers: Customer[];
  customerActivities: CustomerActivity[];
  businessInfo: BusinessInfo;
  gstSettings: GSTSettings;
  trialStartDate: Date | null;
  subscriptionEndDate: Date | null;
  loading: boolean;

  // Inventory
  addItem: (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  updateItem: (id: string, patch: Partial<InventoryItem>) => Promise<void>;
  transactItem: (itemId: string, type: "IN" | "OUT", quantity: number, reason: string, reference?: string, unitPriceOverride?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;

  // Suppliers
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt">) => Promise<string>;
  updateSupplier: (id: string, patch: Partial<Supplier>) => Promise<void>;
  removeSupplier: (id: string) => Promise<void>;

  // Purchase Orders
  addPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean; gstRate?: number }) => Promise<string>;
  updatePurchaseOrder: (id: string, patch: Partial<PurchaseOrder>) => Promise<void>;
  removePurchaseOrder: (id: string) => Promise<void>;

  // Goods Receipts
  addGoodsReceipt: (gr: Omit<GoodsReceipt, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean; gstRate?: number }) => Promise<string>;
  updateGoodsReceipt: (id: string, patch: Partial<GoodsReceipt>) => Promise<void>;
  removeGoodsReceipt: (id: string) => Promise<void>;

  // Proforma Invoices
  addProformaInvoice: (pi: Omit<ProformaInvoice, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean; gstRate?: number }) => Promise<string>;
  updateProformaInvoice: (id: string, patch: Partial<ProformaInvoice>) => Promise<void>;
  removeProformaInvoice: (id: string) => Promise<void>;

  // Proforma Products
  addProformaProduct: (product: Omit<ProformaProduct, "id" | "createdAt">) => Promise<string>;
  updateProformaProduct: (id: string, patch: Partial<ProformaProduct>) => Promise<void>;
  removeProformaProduct: (id: string) => Promise<void>;

  // Customers
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "updatedAt" | "totalProformas" | "totalValue">) => Promise<string>;
  updateCustomer: (id: string, patch: Partial<Customer>) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  addCustomerActivity: (activity: Omit<CustomerActivity, "id" | "date">) => Promise<void>;

  // Business
  setBusinessInfo: (info: BusinessInfo) => Promise<void>;
  setGstSettings: (settings: GSTSettings) => void;

  // Refresh data
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const defaultBusinessInfo: BusinessInfo = {
  id: "b1",
  name: "Your Business Name",
  address: "Your Business Address",
  phone: "+91 00000 00000",
  email: "your-email@company.com",
  gstNumber: "",
};

const defaultGstSettings: GSTSettings = { enabled: true, sgstRate: 9, cgstRate: 9 };

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoice[]>([]);
  const [proformaProducts, setProformaProducts] = useState<ProformaProduct[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerActivities, setCustomerActivities] = useState<CustomerActivity[]>([]);
  const [businessInfo, setBusinessInfoState] = useState<BusinessInfo>(defaultBusinessInfo);
  const [gstSettings, setGstSettingsState] = useState<GSTSettings>(defaultGstSettings);
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);

  // Helper to calculate totals
  const calcTotals = (items: Array<{ quantity: number; unitPrice: number }>, applyGST: boolean, additionalCharges: Array<{ amount: number }> = [], customGstRate?: number) => {
    const subtotal = items.reduce((sum, it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unitPrice) || 0;
      return sum + (qty * price);
    }, 0);
    const chargesTotal = (additionalCharges || []).reduce((sum, charge) => sum + (Number(charge.amount) || 0), 0);
    let sgst = 0, cgst = 0;

    if (applyGST) {
      const baseAmount = subtotal + chargesTotal;
      if (customGstRate !== undefined && customGstRate > 0) {
        sgst = parseFloat(((baseAmount * customGstRate) / 200).toFixed(2));
        cgst = parseFloat(((baseAmount * customGstRate) / 200).toFixed(2));
      } else if (gstSettings.enabled) {
        sgst = parseFloat(((baseAmount * gstSettings.sgstRate) / 100).toFixed(2));
        cgst = parseFloat(((baseAmount * gstSettings.cgstRate) / 100).toFixed(2));
      }
    }

    const total = subtotal + chargesTotal + sgst + cgst;
    return { subtotal: parseFloat(subtotal.toFixed(2)), sgst, cgst, total: parseFloat(total.toFixed(2)) };
  };

  // Fetch all data - fully parallel loading for fastest performance
  const refreshData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Execute ALL queries in parallel simultaneously - no phases, maximum speed
      const [
        { data: profile },
        { data: items },
        { data: sups },
        { data: pos },
        { data: grs },
        { data: pis },
        { data: prods },
        { data: custs },
        { data: trans }
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("inventory_items").select("id,name,hsn_code,description,category,current_stock,reorder_level,unit_price,unit,supplier_id,created_at,updated_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("suppliers").select("id,name,contact_person,email,phone,address,gst_number,created_at,payment_terms,notes").order("created_at", { ascending: false }).limit(200),
        supabase.from("purchase_orders").select("id,po_number,supplier_id,supplier_name,date,expected_delivery,status,subtotal,tax_amount,total,notes,payment_terms,created_at,purchase_order_items(id,item_id,item_name,description,quantity,rate,amount,unit),purchase_order_additional_charges(id,name,amount)").order("created_at", { ascending: false }).limit(200),
        supabase.from("goods_receipts").select("id,gr_number,purchase_order_id,supplier_id,supplier_name,receipt_date,status,subtotal,tax_amount,total,notes,created_at,goods_receipt_items(id,item_id,item_name,quantity_ordered,quantity_received,unit_price,amount,unit,notes),goods_receipt_additional_charges(id,name,amount)").order("created_at", { ascending: false }).limit(200),
        supabase.from("proforma_invoices").select("id,invoice_number,customer_id,customer_name,customer_address,customer_gst,date,subtotal,tax_amount,total,notes,payment_terms,created_at,proforma_invoice_items(id,item_name,hsn_code,description,quantity,rate,amount,unit),proforma_invoice_additional_charges(id,name,amount)").order("created_at", { ascending: false }).limit(200),
        supabase.from("proforma_products").select("id,name,description,unit,price,created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("customers").select("id,name,email,phone,address,gst_number,status,total_proformas,total_value,created_at,updated_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("inventory_transactions").select("id,item_id,type,quantity,unit_price,total_value,reason,reference,created_at,notes").order("created_at", { ascending: false }).limit(300),
      ]);

      // Pre-build lookup maps for faster joins (avoid repeated .find() calls)
      const itemsMap = new Map((items || []).map(i => [i.id, i]));
      const suppliersMap = new Map((sups || []).map(s => [s.id, s]));

      // Helper to map inventory item
      const mapInventoryItem = (i: any): InventoryItem => ({
        id: i.id,
        name: i.name,
        sku: i.hsn_code || "",
        description: i.description || "",
        category: i.category || "",
        currentStock: Number(i.current_stock),
        minStock: Number(i.reorder_level) || 0,
        maxStock: 1000,
        unitPrice: Number(i.unit_price) || 0,
        unit: i.unit,
        supplier: i.supplier_id || undefined,
        createdAt: new Date(i.created_at),
        updatedAt: new Date(i.updated_at),
      });

      // Helper to map supplier
      const mapSupplier = (s: any): Supplier => ({
        id: s.id,
        name: s.name,
        contactPerson: s.contact_person || "",
        email: s.email || "",
        phone: s.phone || "",
        address: s.address || "",
        gstNumber: s.gst_number || "",
        createdAt: new Date(s.created_at),
      });

      // Map all data in parallel using local variables
      const mappedTransactions = (trans || []).map((t: any) => ({
        id: t.id,
        itemId: t.item_id || "",
        type: t.type as "IN" | "OUT",
        quantity: Number(t.quantity),
        unitPrice: Number(t.unit_price) || 0,
        totalValue: Number(t.total_value) || 0,
        reason: t.reason,
        reference: t.reference || undefined,
        date: new Date(t.created_at),
        notes: t.notes || undefined,
      }));

      const mappedItems = (items || []).map(mapInventoryItem);
      const mappedSuppliers = (sups || []).map(mapSupplier);

      // Map purchase orders using lookup maps
      const mappedPOs: PurchaseOrder[] = (pos || []).map(po => {
        const supplier = suppliersMap.get(po.supplier_id || "");
        const poAny = po as any;
        return {
          id: po.id,
          poNumber: po.po_number,
          supplierId: po.supplier_id || "",
          supplier: supplier ? mapSupplier(supplier) : {} as Supplier,
          items: (po.purchase_order_items || []).map((item: any) => {
            const invItem = itemsMap.get(item.item_id);
            return {
              id: item.id,
              itemId: item.item_id || "",
              item: invItem ? mapInventoryItem(invItem) : { id: "", name: item.item_name || "Item", sku: "", description: item.description || "", category: "", currentStock: 0, minStock: 0, maxStock: 0, unitPrice: Number(item.rate), unit: item.unit || "piece", createdAt: new Date(), updatedAt: new Date() } as InventoryItem,
              quantity: Number(item.quantity),
              unitPrice: Number(item.rate),
              total: Number(item.amount),
            };
          }),
          additionalCharges: (poAny.purchase_order_additional_charges || []).map((charge: any) => ({
            id: charge.id,
            name: charge.name,
            amount: Number(charge.amount),
          })),
          subtotal: Number(po.subtotal),
          sgst: Number(po.tax_amount) / 2,
          cgst: Number(po.tax_amount) / 2,
          total: Number(po.total),
          status: (po.status?.toUpperCase() || "DRAFT") as PurchaseOrder["status"],
          date: new Date(po.date),
          expectedDelivery: po.expected_delivery ? new Date(po.expected_delivery) : undefined,
          paymentTerms: (po as any).payment_terms || undefined,
          notes: po.notes || undefined,
        };
      });

      // Map goods receipts using lookup maps
      const mappedGRs: GoodsReceipt[] = (grs || []).map(gr => {
        const supplier = suppliersMap.get(gr.supplier_id || "");
        const grAny = gr as any;
        return {
          id: gr.id,
          grNumber: gr.gr_number,
          poId: gr.purchase_order_id || undefined,
          supplierId: gr.supplier_id || "",
          supplier: supplier ? mapSupplier(supplier) : {} as Supplier,
          items: (gr.goods_receipt_items || []).map((item: any) => {
            const invItem = itemsMap.get(item.item_id);
            return {
              id: item.id,
              itemId: item.item_id || "",
              item: invItem ? mapInventoryItem(invItem) : { id: "", name: item.item_name || "Item", sku: "", description: item.notes || "", category: "", currentStock: 0, minStock: 0, maxStock: 0, unitPrice: Number(item.unit_price), unit: item.unit || "piece", createdAt: new Date(), updatedAt: new Date() } as InventoryItem,
              orderedQuantity: Number(item.quantity_ordered),
              receivedQuantity: Number(item.quantity_received),
              unitPrice: Number(item.unit_price),
              total: Number(item.amount),
            };
          }),
          additionalCharges: (grAny.goods_receipt_additional_charges || []).map((charge: any) => ({
            id: charge.id,
            name: charge.name,
            amount: Number(charge.amount),
          })),
          subtotal: Number(gr.subtotal),
          sgst: Number(gr.tax_amount) / 2,
          cgst: Number(gr.tax_amount) / 2,
          total: Number(gr.total),
          status: (gr.status?.toUpperCase() || "RECEIVED") as GoodsReceipt["status"],
          date: new Date(gr.receipt_date),
          notes: gr.notes || undefined,
        };
      });

      // Map proforma invoices
      const mappedPIs: ProformaInvoice[] = (pis || []).map(pi => {
        const piAny = pi as any;
        return {
          id: pi.id,
          proformaNumber: pi.invoice_number,
          buyerInfo: {
            name: pi.customer_name,
            contactPerson: "",
            email: "",
            phone: "",
            address: pi.customer_address || "",
            gstNumber: pi.customer_gst || "",
          },
          items: (pi.proforma_invoice_items || []).map((item: any) => ({
            id: item.id,
            itemId: "",
            item: { 
              id: "", 
              name: item.item_name || "Item", 
              sku: item.hsn_code || "", 
              description: item.description || "", 
              category: "", 
              currentStock: 0, 
              minStock: 0, 
              maxStock: 0, 
              unitPrice: Number(item.rate), 
              unit: item.unit || "piece", 
              createdAt: new Date(), 
              updatedAt: new Date() 
            } as InventoryItem,
            quantity: Number(item.quantity),
            unitPrice: Number(item.rate),
            total: Number(item.amount),
          })),
          additionalCharges: (piAny.proforma_invoice_additional_charges || []).map((charge: any) => ({
            id: charge.id,
            name: charge.name,
            amount: Number(charge.amount),
          })),
          subtotal: Number(pi.subtotal),
          sgst: Number(pi.tax_amount) / 2,
          cgst: Number(pi.tax_amount) / 2,
          total: Number(pi.total),
          status: "SENT" as ProformaInvoice["status"],
          date: new Date(pi.date),
          notes: pi.notes || undefined,
          paymentTerms: pi.payment_terms || undefined,
        };
      });

      const mappedProducts = (prods || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        unit: p.unit || "PCS",
        price: Number(p.price) || 0,
        createdAt: new Date(p.created_at),
      }));

      const mappedCustomers = (custs || []).map(c => ({
        id: c.id,
        name: c.name,
        contactPerson: "",
        email: c.email || "",
        phone: c.phone || "",
        address: c.address || "",
        gstNumber: c.gst_number || "",
        status: (c.status?.toUpperCase() || "ACTIVE") as Customer["status"],
        source: "MANUAL" as Customer["source"],
        totalProformas: c.total_proformas || 0,
        totalValue: Number(c.total_value) || 0,
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      }));

      // Batch all state updates together - React 18 will batch these automatically
      // Set business profile first (critical for UI header)
      if (profile) {
        const profileAny = profile as any;
        setBusinessInfoState({
          id: profile.id,
          name: profile.business_name || defaultBusinessInfo.name,
          address: profile.address || defaultBusinessInfo.address,
          phone: profile.contact_number || defaultBusinessInfo.phone,
          email: profile.email || user.email || defaultBusinessInfo.email,
          gstNumber: profile.gst_number || "",
          logo: profileAny.logo || undefined,
          signature: profileAny.signature || undefined,
          bankDetails: profileAny.bank_name ? {
            bankName: profileAny.bank_name || "",
            accountNumber: profileAny.bank_account_number || "",
            ifscCode: profileAny.bank_ifsc_code || "",
          } : undefined,
        });
        setTrialStartDate(profileAny.trial_start_date ? new Date(profileAny.trial_start_date) : new Date());
        setSubscriptionEndDate(profileAny.subscription_end_date ? new Date(profileAny.subscription_end_date) : null);
      }

      // Set core data entities (batched)
      setInventoryItems(mappedItems);
      setSuppliers(mappedSuppliers);
      setPurchaseOrders(mappedPOs);
      setGoodsReceipts(mappedGRs);
      setProformaInvoices(mappedPIs);
      setProformaProducts(mappedProducts);
      setCustomers(mappedCustomers);
      setTransactions(mappedTransactions);

      // Clear loading state immediately after setting data
      setLoading(false);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
      setLoading(false);
    }
  }, [user]);

  // Refresh data when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setLoading(false);
    }
  }, [user, refreshData]);

  // Re-fetch data when user returns to the app after being away
  useEffect(() => {
    if (!user) return;

    let lastActiveTime = Date.now();
    const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const timeSinceLastActive = now - lastActiveTime;
        
        // If user was away for more than 5 minutes, refresh data
        if (timeSinceLastActive > STALE_THRESHOLD) {
          console.log('Refreshing data after returning from inactivity');
          refreshData();
        }
      } else {
        lastActiveTime = Date.now();
      }
    };

    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastActive = now - lastActiveTime;
      
      if (timeSinceLastActive > STALE_THRESHOLD) {
        console.log('Refreshing data after window focus');
        refreshData();
      }
      lastActiveTime = now;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, refreshData]);

  // Inventory operations
  const addItem = async (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => {
    if (!user) throw new Error("Not authenticated");
    
    const { data, error } = await supabase.from("inventory_items").insert({
      user_id: user.id,
      name: item.name,
      description: item.description,
      category: item.category,
      current_stock: item.currentStock,
      reorder_level: item.minStock,
      unit_price: item.unitPrice,
      unit: item.unit,
      hsn_code: item.sku,
      supplier_id: item.supplier || null,
    }).select().single();

    if (error) throw error;
    
    // Optimistic update
    const newItem: InventoryItem = {
      id: data.id,
      name: item.name,
      sku: item.sku || "",
      description: item.description || "",
      category: item.category || "",
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: 1000,
      unitPrice: item.unitPrice,
      unit: item.unit,
      supplier: item.supplier,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setInventoryItems(prev => [newItem, ...prev]);
    return data.id;
  };

  const updateItem = async (id: string, patch: Partial<InventoryItem>) => {
    const updateData: any = {};
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.description !== undefined) updateData.description = patch.description;
    if (patch.category !== undefined) updateData.category = patch.category;
    if (patch.currentStock !== undefined) updateData.current_stock = patch.currentStock;
    if (patch.minStock !== undefined) updateData.reorder_level = patch.minStock;
    if (patch.unitPrice !== undefined) updateData.unit_price = patch.unitPrice;
    if (patch.unit !== undefined) updateData.unit = patch.unit;

    const { error } = await supabase.from("inventory_items").update(updateData).eq("id", id);
    if (error) throw error;
    
    // Optimistic update
    setInventoryItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...patch, updatedAt: new Date() } : item
    ));
  };

  const transactItem = async (itemId: string, type: "IN" | "OUT", quantity: number, reason: string, reference?: string, unitPriceOverride?: number) => {
    if (!user) throw new Error("Not authenticated");
    
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;

    const unitPrice = unitPriceOverride ?? item.unitPrice;
    const totalValue = quantity * unitPrice;
    const newStock = type === "IN" ? item.currentStock + quantity : Math.max(0, item.currentStock - quantity);
    
    // Record the transaction in database
    const { data: transData, error: transError } = await supabase.from("inventory_transactions").insert({
      user_id: user.id,
      item_id: itemId,
      item_name: item.name,
      type,
      quantity,
      unit_price: unitPrice,
      total_value: totalValue,
      reason,
      reference: reference || null,
    }).select().single();
    
    if (transError) throw transError;
    
    // Update the stock in database
    await supabase.from("inventory_items").update({ current_stock: newStock }).eq("id", itemId);
    
    // Optimistic update for inventory
    setInventoryItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, currentStock: newStock, updatedAt: new Date() } : i
    ));
    
    // Optimistic update for transactions
    const newTransaction: Transaction = {
      id: transData.id,
      itemId,
      type,
      quantity,
      unitPrice,
      totalValue,
      reason,
      reference,
      date: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) throw error;
    // Optimistic update
    setInventoryItems(prev => prev.filter(item => item.id !== id));
  };

  // Supplier operations
  const addSupplier = async (supplier: Omit<Supplier, "id" | "createdAt">) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase.from("suppliers").insert({
      user_id: user.id,
      name: supplier.name,
      contact_person: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      gst_number: supplier.gstNumber,
    }).select().single();

    if (error) throw error;
    
    // Optimistic update
    const newSupplier: Supplier = {
      id: data.id,
      ...supplier,
      createdAt: new Date(),
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    return data.id;
  };

  const updateSupplier = async (id: string, patch: Partial<Supplier>) => {
    const updateData: any = {};
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.contactPerson !== undefined) updateData.contact_person = patch.contactPerson;
    if (patch.email !== undefined) updateData.email = patch.email;
    if (patch.phone !== undefined) updateData.phone = patch.phone;
    if (patch.address !== undefined) updateData.address = patch.address;
    if (patch.gstNumber !== undefined) updateData.gst_number = patch.gstNumber;

    const { error } = await supabase.from("suppliers").update(updateData).eq("id", id);
    if (error) throw error;
    
    // Optimistic update
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const removeSupplier = async (id: string) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) throw error;
    // Optimistic update
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Purchase Order operations
  const addPurchaseOrder = async (po: Omit<PurchaseOrder, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean; gstRate?: number }) => {
    if (!user) throw new Error("Not authenticated");

    const totals = calcTotals(po.items.map(i => ({ quantity: i.quantity, unitPrice: i.unitPrice })), po.applyGST ?? true, po.additionalCharges, po.gstRate);

    const { data, error } = await supabase.from("purchase_orders").insert({
      user_id: user.id,
      po_number: po.poNumber,
      supplier_id: po.supplierId,
      supplier_name: po.supplier.name,
      date: po.date.toISOString().split("T")[0],
      expected_delivery: po.expectedDelivery?.toISOString().split("T")[0] || null,
      payment_terms: po.paymentTerms || null,
      subtotal: totals.subtotal,
      tax_amount: totals.sgst + totals.cgst,
      total: totals.total,
      status: po.status.toLowerCase(),
      notes: po.notes || null,
    }).select().single();

    if (error) throw error;

    // Insert PO items in parallel
    const poItems = po.items.map(item => ({
      purchase_order_id: data.id,
      item_id: item.itemId || null,
      item_name: item.item?.name || "Item",
      quantity: item.quantity,
      rate: item.unitPrice,
      amount: item.total,
      unit: item.item?.unit || "piece",
    }));

    await supabase.from("purchase_order_items").insert(poItems);

    // Insert additional charges
    if (po.additionalCharges && po.additionalCharges.length > 0) {
      const charges = po.additionalCharges.map(charge => ({
        purchase_order_id: data.id,
        name: charge.name,
        amount: charge.amount,
      }));
      await supabase.from("purchase_order_additional_charges").insert(charges);
    }

    // Optimistic update
    const newPO: PurchaseOrder = {
      id: data.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplier: po.supplier,
      items: po.items,
      additionalCharges: po.additionalCharges || [],
      ...totals,
      status: po.status,
      date: po.date,
      expectedDelivery: po.expectedDelivery,
      paymentTerms: po.paymentTerms,
      notes: po.notes,
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    return data.id;
  };

  const updatePurchaseOrder = async (id: string, patch: Partial<PurchaseOrder>) => {
    const updateData: any = {};
    if (patch.status !== undefined) updateData.status = patch.status.toLowerCase();
    if (patch.notes !== undefined) updateData.notes = patch.notes;

    const { error } = await supabase.from("purchase_orders").update(updateData).eq("id", id);
    if (error) throw error;
    
    // Optimistic update
    setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, ...patch } : po));
  };

  const removePurchaseOrder = async (id: string) => {
    await supabase.from("purchase_order_items").delete().eq("purchase_order_id", id);
    await supabase.from("purchase_order_additional_charges").delete().eq("purchase_order_id", id);
    const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
    if (error) throw error;
    // Optimistic update
    setPurchaseOrders(prev => prev.filter(po => po.id !== id));
  };

  // Goods Receipt operations
  const addGoodsReceipt = async (gr: Omit<GoodsReceipt, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean; gstRate?: number }) => {
    if (!user) throw new Error("Not authenticated");

    const totals = calcTotals(gr.items.map(i => ({ quantity: i.receivedQuantity, unitPrice: i.unitPrice })), gr.applyGST ?? true, gr.additionalCharges, gr.gstRate);

    const { data, error } = await supabase.from("goods_receipts").insert({
      user_id: user.id,
      gr_number: gr.grNumber,
      purchase_order_id: gr.poId || null,
      supplier_id: gr.supplierId,
      supplier_name: gr.supplier.name,
      receipt_date: gr.date.toISOString().split("T")[0],
      subtotal: totals.subtotal,
      tax_amount: totals.sgst + totals.cgst,
      total: totals.total,
      status: gr.status,
      notes: gr.notes || null,
    }).select().single();

    if (error) throw error;

    // Prepare all insert operations for GR items
    const grItemsToInsert = gr.items.map(item => ({
      goods_receipt_id: data.id,
      item_id: item.itemId || null,
      item_name: item.item?.name || "Item",
      quantity_ordered: item.orderedQuantity || item.receivedQuantity,
      quantity_received: item.receivedQuantity,
      unit_price: item.unitPrice,
      amount: item.total,
      unit: item.item?.unit || "piece",
    }));
    
    await supabase.from("goods_receipt_items").insert(grItemsToInsert);

    // Process inventory updates and transactions
    const transactionInserts: any[] = [];
    const stockUpdates: { itemId: string; newStock: number }[] = [];

    for (const item of gr.items) {
      if (item.itemId) {
        const currentItem = inventoryItems.find(i => i.id === item.itemId);
        if (currentItem) {
          const newStock = currentItem.currentStock + item.receivedQuantity;
          stockUpdates.push({ itemId: item.itemId, newStock });
          
          // Update stock in database
          await supabase.from("inventory_items").update({ current_stock: newStock }).eq("id", item.itemId);
          
          transactionInserts.push({
            user_id: user.id,
            item_id: item.itemId,
            item_name: currentItem.name,
            type: "IN",
            quantity: item.receivedQuantity,
            unit_price: item.unitPrice,
            total_value: item.receivedQuantity * item.unitPrice,
            reason: "Goods Receipt",
            reference: gr.grNumber,
          });
        }
      }
    }

    // Insert all transactions at once
    if (transactionInserts.length > 0) {
      await supabase.from("inventory_transactions").insert(transactionInserts);
    }

    // Insert additional charges
    if (gr.additionalCharges && gr.additionalCharges.length > 0) {
      const charges = gr.additionalCharges.map(charge => ({
        goods_receipt_id: data.id,
        name: charge.name,
        amount: charge.amount,
      }));
      await supabase.from("goods_receipt_additional_charges").insert(charges);
    }

    // Optimistic updates
    const newGR: GoodsReceipt = {
      id: data.id,
      grNumber: gr.grNumber,
      poId: gr.poId,
      supplierId: gr.supplierId,
      supplier: gr.supplier,
      items: gr.items,
      additionalCharges: gr.additionalCharges || [],
      ...totals,
      status: gr.status,
      date: gr.date,
      notes: gr.notes,
    };
    setGoodsReceipts(prev => [newGR, ...prev]);
    
    // Update inventory items optimistically
    if (stockUpdates.length > 0) {
      setInventoryItems(prev => prev.map(item => {
        const update = stockUpdates.find(u => u.itemId === item.id);
        return update ? { ...item, currentStock: update.newStock, updatedAt: new Date() } : item;
      }));
      
      // Add transactions optimistically
      const newTransactions: Transaction[] = transactionInserts.map((t, idx) => ({
        id: `temp-${Date.now()}-${idx}`,
        itemId: t.item_id,
        type: "IN" as const,
        quantity: t.quantity,
        unitPrice: t.unit_price,
        totalValue: t.total_value,
        reason: t.reason,
        reference: t.reference,
        date: new Date(),
      }));
      setTransactions(prev => [...newTransactions, ...prev]);
    }

    // Update PO status if linked
    if (gr.poId) {
      await supabase.from("purchase_orders").update({ status: "received" }).eq("id", gr.poId);
      setPurchaseOrders(prev => prev.map(po => po.id === gr.poId ? { ...po, status: "RECEIVED" } : po));
    }

    return data.id;
  };

  const updateGoodsReceipt = async (id: string, patch: Partial<GoodsReceipt>) => {
    const updateData: any = {};
    if (patch.status !== undefined) updateData.status = patch.status;
    if (patch.notes !== undefined) updateData.notes = patch.notes;

    const { error } = await supabase.from("goods_receipts").update(updateData).eq("id", id);
    if (error) throw error;
    
    // Optimistic update
    setGoodsReceipts(prev => prev.map(gr => gr.id === id ? { ...gr, ...patch } : gr));
  };

  const removeGoodsReceipt = async (id: string) => {
    await supabase.from("goods_receipt_items").delete().eq("goods_receipt_id", id);
    await supabase.from("goods_receipt_additional_charges").delete().eq("goods_receipt_id", id);
    const { error } = await supabase.from("goods_receipts").delete().eq("id", id);
    if (error) throw error;
    // Optimistic update
    setGoodsReceipts(prev => prev.filter(gr => gr.id !== id));
  };

  // Proforma Invoice operations
  const addProformaInvoice = async (pi: Omit<ProformaInvoice, "id" | "subtotal" | "sgst" | "cgst" | "total"> & { applyGST?: boolean; gstRate?: number }) => {
    if (!user) throw new Error("Not authenticated");

    const totals = calcTotals(pi.items.map(i => ({ quantity: i.quantity, unitPrice: i.unitPrice })), pi.applyGST ?? true, pi.additionalCharges, pi.gstRate);

    const { data, error } = await supabase.from("proforma_invoices").insert({
      user_id: user.id,
      invoice_number: pi.proformaNumber,
      customer_name: pi.buyerInfo.name,
      customer_address: pi.buyerInfo.address,
      customer_gst: pi.buyerInfo.gstNumber,
      date: pi.date.toISOString().split("T")[0],
      subtotal: totals.subtotal,
      tax_amount: totals.sgst + totals.cgst,
      total: totals.total,
      notes: pi.notes || null,
      payment_terms: pi.paymentTerms || null,
    }).select().single();

    if (error) throw error;

    // Insert PI items
    const piItems = pi.items.map(item => ({
      proforma_invoice_id: data.id,
      item_name: item.item?.name || "Item",
      description: item.item?.description || "",
      hsn_code: item.item?.sku || "",
      quantity: item.quantity,
      rate: item.unitPrice,
      amount: item.total,
      unit: item.item?.unit || "piece",
    }));

    await supabase.from("proforma_invoice_items").insert(piItems);

    // Insert additional charges
    if (pi.additionalCharges && pi.additionalCharges.length > 0) {
      const charges = pi.additionalCharges.map(charge => ({
        proforma_invoice_id: data.id,
        name: charge.name,
        amount: charge.amount,
      }));
      await supabase.from("proforma_invoice_additional_charges").insert(charges);
    }

    // Optimistic update
    const newPI: ProformaInvoice = {
      id: data.id,
      proformaNumber: pi.proformaNumber,
      buyerInfo: pi.buyerInfo,
      items: pi.items,
      additionalCharges: pi.additionalCharges || [],
      ...totals,
      status: "SENT",
      date: pi.date,
      notes: pi.notes,
      paymentTerms: pi.paymentTerms,
    };
    setProformaInvoices(prev => [newPI, ...prev]);
    return data.id;
  };

  const updateProformaInvoice = async (id: string, patch: Partial<ProformaInvoice>) => {
    const updateData: any = {};
    if (patch.notes !== undefined) updateData.notes = patch.notes;
    if (patch.subtotal !== undefined) updateData.subtotal = patch.subtotal;
    if (patch.sgst !== undefined || patch.cgst !== undefined) {
      updateData.tax_amount = (patch.sgst || 0) + (patch.cgst || 0);
    }
    if (patch.total !== undefined) updateData.total = patch.total;
    if (patch.paymentTerms !== undefined) updateData.payment_terms = patch.paymentTerms;
    if (patch.buyerInfo !== undefined) {
      updateData.customer_name = patch.buyerInfo.name;
      updateData.customer_address = patch.buyerInfo.address;
      updateData.customer_gst = patch.buyerInfo.gstNumber;
    }
    if (patch.date !== undefined) {
      updateData.date = patch.date.toISOString().split("T")[0];
    }

    const { error } = await supabase.from("proforma_invoices").update(updateData).eq("id", id);
    if (error) throw error;

    // Update items if provided
    if (patch.items !== undefined) {
      // Delete old items and insert new ones
      await supabase.from("proforma_invoice_items").delete().eq("proforma_invoice_id", id);
      const piItems = patch.items.map(item => ({
        proforma_invoice_id: id,
        item_name: item.item?.name || "Item",
        description: item.item?.description || "",
        hsn_code: item.item?.sku || "",
        quantity: item.quantity,
        rate: item.unitPrice,
        amount: item.total,
        unit: item.item?.unit || "piece",
      }));
      await supabase.from("proforma_invoice_items").insert(piItems);
    }

    // Update additional charges if provided
    if (patch.additionalCharges !== undefined) {
      // Delete old charges and insert new ones
      await supabase.from("proforma_invoice_additional_charges").delete().eq("proforma_invoice_id", id);
      if (patch.additionalCharges.length > 0) {
        const charges = patch.additionalCharges.map(charge => ({
          proforma_invoice_id: id,
          name: charge.name,
          amount: charge.amount,
        }));
        await supabase.from("proforma_invoice_additional_charges").insert(charges);
      }
    }

    // Optimistic update
    setProformaInvoices(prev => prev.map(pi => pi.id === id ? { ...pi, ...patch } : pi));
  };

  const removeProformaInvoice = async (id: string) => {
    await supabase.from("proforma_invoice_items").delete().eq("proforma_invoice_id", id);
    await supabase.from("proforma_invoice_additional_charges").delete().eq("proforma_invoice_id", id);
    const { error } = await supabase.from("proforma_invoices").delete().eq("id", id);
    if (error) throw error;
    // Optimistic update
    setProformaInvoices(prev => prev.filter(pi => pi.id !== id));
  };

  // Proforma Products operations
  const addProformaProduct = async (product: Omit<ProformaProduct, "id" | "createdAt">) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase.from("proforma_products").insert({
      user_id: user.id,
      name: product.name,
      description: product.description,
      unit: product.unit,
      price: product.price,
    }).select().single();

    if (error) throw error;
    
    // Optimistic update
    const newProduct: ProformaProduct = {
      id: data.id,
      ...product,
      createdAt: new Date(),
    };
    setProformaProducts(prev => [newProduct, ...prev]);
    return data.id;
  };

  const updateProformaProduct = async (id: string, patch: Partial<ProformaProduct>) => {
    const updateData: any = {};
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.description !== undefined) updateData.description = patch.description;
    if (patch.unit !== undefined) updateData.unit = patch.unit;
    if (patch.price !== undefined) updateData.price = patch.price;

    const { error } = await supabase.from("proforma_products").update(updateData).eq("id", id);
    if (error) throw error;
    
    // Optimistic update
    setProformaProducts(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  const removeProformaProduct = async (id: string) => {
    const { error } = await supabase.from("proforma_products").delete().eq("id", id);
    if (error) throw error;
    // Optimistic update
    setProformaProducts(prev => prev.filter(p => p.id !== id));
  };

  // Customer operations
  const addCustomer = async (customer: Omit<Customer, "id" | "createdAt" | "updatedAt" | "totalProformas" | "totalValue">) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase.from("customers").insert({
      user_id: user.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      gst_number: customer.gstNumber,
      status: customer.status?.toLowerCase() || "active",
    }).select().single();

    if (error) throw error;
    
    // Optimistic update
    const newCustomer: Customer = {
      id: data.id,
      ...customer,
      totalProformas: 0,
      totalValue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return data.id;
  };

  const updateCustomer = async (id: string, patch: Partial<Customer>) => {
    const updateData: any = {};
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.email !== undefined) updateData.email = patch.email;
    if (patch.phone !== undefined) updateData.phone = patch.phone;
    if (patch.address !== undefined) updateData.address = patch.address;
    if (patch.gstNumber !== undefined) updateData.gst_number = patch.gstNumber;
    if (patch.status !== undefined) updateData.status = patch.status.toLowerCase();

    const { error } = await supabase.from("customers").update(updateData).eq("id", id);
    if (error) throw error;
    
    // Optimistic update
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...patch, updatedAt: new Date() } : c));
  };

  const removeCustomer = async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
    // Optimistic update
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addCustomerActivity = async (activity: Omit<CustomerActivity, "id" | "date">) => {
    if (!user) throw new Error("Not authenticated");

    const { data } = await supabase.from("customer_activities").insert({
      user_id: user.id,
      customer_id: activity.customerId,
      type: activity.type,
      description: activity.description,
    }).select().single();
    
    // Optimistic update
    if (data) {
      const newActivity: CustomerActivity = {
        id: data.id,
        customerId: activity.customerId,
        type: activity.type,
        description: activity.description,
        date: new Date(),
      };
      setCustomerActivities(prev => [newActivity, ...prev]);
    }
  };

  // Business operations
  const setBusinessInfo = async (info: BusinessInfo) => {
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("profiles").update({
      business_name: info.name,
      address: info.address,
      contact_number: info.phone,
      email: info.email,
      gst_number: info.gstNumber,
      logo: info.logo || null,
      signature: info.signature || null,
      bank_name: info.bankDetails?.bankName || null,
      bank_account_number: info.bankDetails?.accountNumber || null,
      bank_ifsc_code: info.bankDetails?.ifscCode || null,
    }).eq("id", user.id);

    if (error) throw error;
    setBusinessInfoState(info);
  };

  const setGstSettings = (settings: GSTSettings) => {
    setGstSettingsState(settings);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value: DataContextValue = useMemo(() => ({
    inventoryItems,
    suppliers,
    purchaseOrders,
    goodsReceipts,
    proformaInvoices,
    proformaProducts,
    transactions,
    customers,
    customerActivities,
    businessInfo,
    gstSettings,
    trialStartDate,
    subscriptionEndDate,
    loading,
    addItem,
    updateItem,
    transactItem,
    removeItem,
    addSupplier,
    updateSupplier,
    removeSupplier,
    addPurchaseOrder,
    updatePurchaseOrder,
    removePurchaseOrder,
    addGoodsReceipt,
    updateGoodsReceipt,
    removeGoodsReceipt,
    addProformaInvoice,
    updateProformaInvoice,
    removeProformaInvoice,
    addProformaProduct,
    updateProformaProduct,
    removeProformaProduct,
    addCustomer,
    updateCustomer,
    removeCustomer,
    addCustomerActivity,
    setBusinessInfo,
    setGstSettings,
    refreshData,
  }), [
    inventoryItems,
    suppliers,
    purchaseOrders,
    goodsReceipts,
    proformaInvoices,
    proformaProducts,
    transactions,
    customers,
    customerActivities,
    businessInfo,
    gstSettings,
    trialStartDate,
    subscriptionEndDate,
    loading,
    refreshData,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

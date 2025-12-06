import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
} from "@/types/inventory";

interface DataContextValue {
  // State
  inventoryItems: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  proformaInvoices: ProformaInvoice[];
  transactions: Transaction[];
  customers: Customer[];
  customerActivities: CustomerActivity[];
  businessInfo: BusinessInfo;
  gstSettings: GSTSettings;
  trialStartDate: Date | null;
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerActivities, setCustomerActivities] = useState<CustomerActivity[]>([]);
  const [businessInfo, setBusinessInfoState] = useState<BusinessInfo>(defaultBusinessInfo);
  const [gstSettings, setGstSettingsState] = useState<GSTSettings>(defaultGstSettings);
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);

  // Helper to calculate totals
  const calcTotals = (items: Array<{ quantity: number; unitPrice: number }>, applyGST: boolean, additionalCharges: Array<{ amount: number }> = [], customGstRate?: number) => {
    const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const chargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    let sgst = 0, cgst = 0;

    if (applyGST) {
      if (customGstRate !== undefined) {
        sgst = parseFloat((((subtotal + chargesTotal) * customGstRate) / 200).toFixed(2));
        cgst = parseFloat((((subtotal + chargesTotal) * customGstRate) / 200).toFixed(2));
      } else if (gstSettings.enabled) {
        sgst = parseFloat((((subtotal + chargesTotal) * gstSettings.sgstRate) / 100).toFixed(2));
        cgst = parseFloat((((subtotal + chargesTotal) * gstSettings.cgstRate) / 100).toFixed(2));
      }
    }

    const total = subtotal + chargesTotal + sgst + cgst;
    return { subtotal: parseFloat(subtotal.toFixed(2)), sgst, cgst, total: parseFloat(total.toFixed(2)) };
  };

  // Fetch all data
  const refreshData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all data in parallel for speed
      const [
        { data: items },
        { data: sups },
        { data: pos },
        { data: grs },
        { data: pis },
        { data: custs },
        { data: profile },
      ] = await Promise.all([
        supabase.from("inventory_items").select("*").order("created_at", { ascending: false }),
        supabase.from("suppliers").select("*").order("created_at", { ascending: false }),
        supabase.from("purchase_orders").select("*, purchase_order_items(*), purchase_order_additional_charges(*)").order("created_at", { ascending: false }),
        supabase.from("goods_receipts").select("*, goods_receipt_items(*), goods_receipt_additional_charges(*)").order("created_at", { ascending: false }),
        supabase.from("proforma_invoices").select("*, proforma_invoice_items(*), proforma_invoice_additional_charges(*)").order("created_at", { ascending: false }),
        supabase.from("customers").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);

      // Map inventory items
      setInventoryItems((items || []).map(i => ({
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
      })));

      // Map suppliers
      setSuppliers((sups || []).map(s => ({
        id: s.id,
        name: s.name,
        contactPerson: s.contact_person || "",
        email: s.email || "",
        phone: s.phone || "",
        address: s.address || "",
        gstNumber: s.gst_number || "",
        createdAt: new Date(s.created_at),
      })));

      // Map purchase orders
      const mappedPOs: PurchaseOrder[] = (pos || []).map(po => {
        const supplier = sups?.find(s => s.id === po.supplier_id);
        const poAny = po as any;
        return {
          id: po.id,
          poNumber: po.po_number,
          supplierId: po.supplier_id || "",
          supplier: supplier ? { id: supplier.id, name: supplier.name, contactPerson: supplier.contact_person || "", email: supplier.email || "", phone: supplier.phone || "", address: supplier.address || "", gstNumber: supplier.gst_number || "", createdAt: new Date(supplier.created_at) } : {} as Supplier,
          items: (po.purchase_order_items || []).map((item: any) => {
            const invItem = items?.find(i => i.id === item.item_id);
            return {
              id: item.id,
              itemId: item.item_id || "",
              item: invItem ? {
                id: invItem.id,
                name: invItem.name,
                sku: invItem.hsn_code || "",
                description: invItem.description || "",
                category: invItem.category || "",
                currentStock: Number(invItem.current_stock),
                minStock: Number(invItem.reorder_level) || 0,
                maxStock: 1000,
                unitPrice: Number(invItem.unit_price) || 0,
                unit: invItem.unit,
                createdAt: new Date(invItem.created_at),
                updatedAt: new Date(invItem.updated_at),
              } : { id: "", name: item.item_name || "Item", sku: "", description: item.description || "", category: "", currentStock: 0, minStock: 0, maxStock: 0, unitPrice: Number(item.rate), unit: item.unit || "piece", createdAt: new Date(), updatedAt: new Date() } as InventoryItem,
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
          notes: po.notes || undefined,
        };
      });
      setPurchaseOrders(mappedPOs);

      // Map goods receipts
      const mappedGRs: GoodsReceipt[] = (grs || []).map(gr => {
        const supplier = sups?.find(s => s.id === gr.supplier_id);
        const grAny = gr as any;
        return {
          id: gr.id,
          grNumber: gr.gr_number,
          poId: gr.purchase_order_id || undefined,
          supplierId: gr.supplier_id || "",
          supplier: supplier ? { id: supplier.id, name: supplier.name, contactPerson: supplier.contact_person || "", email: supplier.email || "", phone: supplier.phone || "", address: supplier.address || "", gstNumber: supplier.gst_number || "", createdAt: new Date(supplier.created_at) } : {} as Supplier,
          items: (gr.goods_receipt_items || []).map((item: any) => {
            const invItem = items?.find(i => i.id === item.item_id);
            return {
              id: item.id,
              itemId: item.item_id || "",
              item: invItem ? {
                id: invItem.id,
                name: invItem.name,
                sku: invItem.hsn_code || "",
                description: invItem.description || "",
                category: invItem.category || "",
                currentStock: Number(invItem.current_stock),
                minStock: Number(invItem.reorder_level) || 0,
                maxStock: 1000,
                unitPrice: Number(invItem.unit_price) || 0,
                unit: invItem.unit,
                createdAt: new Date(invItem.created_at),
                updatedAt: new Date(invItem.updated_at),
              } : { id: "", name: item.item_name || "Item", sku: "", description: item.notes || "", category: "", currentStock: 0, minStock: 0, maxStock: 0, unitPrice: Number(item.unit_price), unit: item.unit || "piece", createdAt: new Date(), updatedAt: new Date() } as InventoryItem,
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
      setGoodsReceipts(mappedGRs);

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
      setProformaInvoices(mappedPIs);

      // Map customers
      setCustomers((custs || []).map(c => ({
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
      })));

      // Map business profile
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
        // Set trial start date
        setTrialStartDate(profileAny.trial_start_date ? new Date(profileAny.trial_start_date) : new Date());
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setLoading(false);
    }
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
    await refreshData();
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
    await refreshData();
  };

  const transactItem = async (itemId: string, type: "IN" | "OUT", quantity: number, reason: string, reference?: string, unitPriceOverride?: number) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;

    const newStock = type === "IN" ? item.currentStock + quantity : Math.max(0, item.currentStock - quantity);
    await updateItem(itemId, { currentStock: newStock });
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) throw error;
    await refreshData();
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
    await refreshData();
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
    await refreshData();
  };

  const removeSupplier = async (id: string) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) throw error;
    await refreshData();
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
      subtotal: totals.subtotal,
      tax_amount: totals.sgst + totals.cgst,
      total: totals.total,
      status: po.status.toLowerCase(),
      notes: po.notes || null,
    }).select().single();

    if (error) throw error;

    // Insert PO items
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

    await refreshData();
    return data.id;
  };

  const updatePurchaseOrder = async (id: string, patch: Partial<PurchaseOrder>) => {
    const updateData: any = {};
    if (patch.status !== undefined) updateData.status = patch.status.toLowerCase();
    if (patch.notes !== undefined) updateData.notes = patch.notes;

    const { error } = await supabase.from("purchase_orders").update(updateData).eq("id", id);
    if (error) throw error;
    await refreshData();
  };

  const removePurchaseOrder = async (id: string) => {
    await supabase.from("purchase_order_items").delete().eq("purchase_order_id", id);
    const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
    if (error) throw error;
    await refreshData();
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

    // Insert GR items and update inventory
    for (const item of gr.items) {
      await supabase.from("goods_receipt_items").insert({
        goods_receipt_id: data.id,
        item_id: item.itemId || null,
        item_name: item.item?.name || "Item",
        quantity_ordered: item.orderedQuantity || item.receivedQuantity,
        quantity_received: item.receivedQuantity,
        unit_price: item.unitPrice,
        amount: item.total,
        unit: item.item?.unit || "piece",
      });

      // Update inventory stock
      if (item.itemId) {
        const existingItem = inventoryItems.find(i => i.id === item.itemId);
        if (existingItem) {
          await supabase.from("inventory_items").update({
            current_stock: existingItem.currentStock + item.receivedQuantity,
          }).eq("id", item.itemId);
        }
      }
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

    // Update PO status if linked
    if (gr.poId) {
      await updatePurchaseOrder(gr.poId, { status: "RECEIVED" });
    }

    await refreshData();
    return data.id;
  };

  const updateGoodsReceipt = async (id: string, patch: Partial<GoodsReceipt>) => {
    const updateData: any = {};
    if (patch.status !== undefined) updateData.status = patch.status;
    if (patch.notes !== undefined) updateData.notes = patch.notes;

    const { error } = await supabase.from("goods_receipts").update(updateData).eq("id", id);
    if (error) throw error;
    await refreshData();
  };

  const removeGoodsReceipt = async (id: string) => {
    await supabase.from("goods_receipt_items").delete().eq("goods_receipt_id", id);
    const { error } = await supabase.from("goods_receipts").delete().eq("id", id);
    if (error) throw error;
    await refreshData();
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

    await refreshData();
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

    await refreshData();
  };

  const removeProformaInvoice = async (id: string) => {
    await supabase.from("proforma_invoice_items").delete().eq("proforma_invoice_id", id);
    const { error } = await supabase.from("proforma_invoices").delete().eq("id", id);
    if (error) throw error;
    await refreshData();
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
    await refreshData();
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
    await refreshData();
  };

  const removeCustomer = async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
    await refreshData();
  };

  const addCustomerActivity = async (activity: Omit<CustomerActivity, "id" | "date">) => {
    if (!user) throw new Error("Not authenticated");

    await supabase.from("customer_activities").insert({
      user_id: user.id,
      customer_id: activity.customerId,
      type: activity.type,
      description: activity.description,
    });
    await refreshData();
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

  const value: DataContextValue = {
    inventoryItems,
    suppliers,
    purchaseOrders,
    goodsReceipts,
    proformaInvoices,
    transactions,
    customers,
    customerActivities,
    businessInfo,
    gstSettings,
    trialStartDate,
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
    addCustomer,
    updateCustomer,
    removeCustomer,
    addCustomerActivity,
    setBusinessInfo,
    setGstSettings,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

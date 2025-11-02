import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface PurchaseOrder {
  id: string;
  user_id: string;
  po_number: string;
  supplier_id: string | null;
  supplier_name: string;
  date: string;
  expected_delivery: string | null;
  subtotal: number;
  tax_amount: number | null;
  total: number;
  status: string | null;
  notes: string | null;
  created_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  item_id: string | null;
  item_name: string;
  description: string | null;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPurchaseOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching purchase orders:", error);
      toast({ title: "Error", description: "Failed to load purchase orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const getPurchaseOrderItems = async (poId: string): Promise<PurchaseOrderItem[]> => {
    try {
      const { data, error } = await supabase
        .from("purchase_order_items")
        .select("*")
        .eq("purchase_order_id", poId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching PO items:", error);
      return [];
    }
  };

  const addPurchaseOrder = async (
    po: Omit<PurchaseOrder, "id" | "user_id" | "created_at">,
    items: Omit<PurchaseOrderItem, "id" | "purchase_order_id">[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: poData, error: poError } = await supabase
        .from("purchase_orders")
        .insert([{ ...po, user_id: user.id }])
        .select()
        .single();

      if (poError) throw poError;

      const itemsWithPoId = items.map(item => ({
        ...item,
        purchase_order_id: poData.id,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(itemsWithPoId);

      if (itemsError) throw itemsError;

      setPurchaseOrders([poData, ...purchaseOrders]);
      toast({ title: "Success", description: "Purchase order created successfully!" });
      return poData.id;
    } catch (error: any) {
      console.error("Error adding purchase order:", error);
      toast({ title: "Error", description: "Failed to create purchase order", variant: "destructive" });
      return null;
    }
  };

  const updatePurchaseOrder = async (id: string, patch: Partial<PurchaseOrder>) => {
    try {
      const { error } = await supabase
        .from("purchase_orders")
        .update(patch)
        .eq("id", id);

      if (error) throw error;
      setPurchaseOrders(purchaseOrders.map(po => po.id === id ? { ...po, ...patch } : po));
      toast({ title: "Success", description: "Purchase order updated successfully!" });
    } catch (error: any) {
      console.error("Error updating purchase order:", error);
      toast({ title: "Error", description: "Failed to update purchase order", variant: "destructive" });
    }
  };

  const removePurchaseOrder = async (id: string) => {
    try {
      // Delete items first (cascading should handle this, but being explicit)
      await supabase.from("purchase_order_items").delete().eq("purchase_order_id", id);

      const { error } = await supabase
        .from("purchase_orders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
      toast({ title: "Success", description: "Purchase order deleted successfully!" });
    } catch (error: any) {
      console.error("Error deleting purchase order:", error);
      toast({ title: "Error", description: "Failed to delete purchase order", variant: "destructive" });
    }
  };

  return {
    purchaseOrders,
    loading,
    addPurchaseOrder,
    updatePurchaseOrder,
    removePurchaseOrder,
    getPurchaseOrderItems,
    refresh: fetchPurchaseOrders,
  };
};

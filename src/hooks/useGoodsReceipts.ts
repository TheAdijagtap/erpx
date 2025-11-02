import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface GoodsReceipt {
  id: string;
  user_id: string;
  gr_number: string;
  purchase_order_id: string | null;
  supplier_id: string | null;
  supplier_name: string;
  receipt_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
}

export interface GoodsReceiptItem {
  id: string;
  goods_receipt_id: string;
  item_id: string | null;
  item_name: string;
  unit: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  amount: number;
  notes: string | null;
}

export const useGoodsReceipts = () => {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from("goods_receipts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error: any) {
      console.error("Error fetching goods receipts:", error);
      toast({ title: "Error", description: "Failed to load goods receipts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const getReceiptItems = async (receiptId: string): Promise<GoodsReceiptItem[]> => {
    try {
      const { data, error } = await supabase
        .from("goods_receipt_items")
        .select("*")
        .eq("goods_receipt_id", receiptId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching receipt items:", error);
      return [];
    }
  };

  const addReceipt = async (
    receipt: Omit<GoodsReceipt, "id" | "user_id" | "created_at">,
    items: Omit<GoodsReceiptItem, "id" | "goods_receipt_id">[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: receiptData, error: receiptError } = await supabase
        .from("goods_receipts")
        .insert([{ ...receipt, user_id: user.id }])
        .select()
        .single();

      if (receiptError) throw receiptError;

      const itemsWithReceiptId = items.map(item => ({
        ...item,
        goods_receipt_id: receiptData.id,
      }));

      const { error: itemsError } = await supabase
        .from("goods_receipt_items")
        .insert(itemsWithReceiptId);

      if (itemsError) throw itemsError;

      setReceipts([receiptData, ...receipts]);
      toast({ title: "Success", description: "Goods receipt created successfully!" });
      return receiptData.id;
    } catch (error: any) {
      console.error("Error adding goods receipt:", error);
      toast({ title: "Error", description: "Failed to create goods receipt", variant: "destructive" });
      return null;
    }
  };

  const updateReceipt = async (id: string, patch: Partial<GoodsReceipt>) => {
    try {
      const { error } = await supabase
        .from("goods_receipts")
        .update(patch)
        .eq("id", id);

      if (error) throw error;
      setReceipts(receipts.map(r => r.id === id ? { ...r, ...patch } : r));
      toast({ title: "Success", description: "Goods receipt updated successfully!" });
    } catch (error: any) {
      console.error("Error updating goods receipt:", error);
      toast({ title: "Error", description: "Failed to update goods receipt", variant: "destructive" });
    }
  };

  const removeReceipt = async (id: string) => {
    try {
      await supabase.from("goods_receipt_items").delete().eq("goods_receipt_id", id);

      const { error } = await supabase
        .from("goods_receipts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setReceipts(receipts.filter(r => r.id !== id));
      toast({ title: "Success", description: "Goods receipt deleted successfully!" });
    } catch (error: any) {
      console.error("Error deleting goods receipt:", error);
      toast({ title: "Error", description: "Failed to delete goods receipt", variant: "destructive" });
    }
  };

  return {
    receipts,
    loading,
    addReceipt,
    updateReceipt,
    removeReceipt,
    getReceiptItems,
    refresh: fetchReceipts,
  };
};

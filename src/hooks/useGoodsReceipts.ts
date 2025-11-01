import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface GoodsReceipt {
  id: string;
  gr_number: string;
  purchase_order_id: string | null;
  supplier_id: string | null;
  supplier_name: string;
  receipt_date: string;
  notes: string | null;
  created_at: string;
}

export interface GoodsReceiptItem {
  id: string;
  goods_receipt_id: string;
  item_id: string | null;
  item_name: string;
  quantity_ordered: number;
  quantity_received: number;
  unit: string;
  notes: string | null;
}

export const useGoodsReceipts = () => {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('goods_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const addReceipt = async (receipt: Omit<GoodsReceipt, 'id' | 'created_at' | 'user_id'>, items: Omit<GoodsReceiptItem, 'id' | 'goods_receipt_id'>[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: receiptData, error: receiptError } = await supabase
        .from('goods_receipts')
        .insert([{ ...receipt, user_id: user.id }])
        .select()
        .single();

      if (receiptError) throw receiptError;

      const itemsWithReceiptId = items.map(item => ({
        ...item,
        goods_receipt_id: receiptData.id
      }));

      const { error: itemsError } = await supabase
        .from('goods_receipt_items')
        .insert(itemsWithReceiptId);

      if (itemsError) throw itemsError;

      setReceipts(prev => [receiptData, ...prev]);
      toast({ title: 'Success', description: 'Goods receipt created successfully' });
      return receiptData;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const updateReceipt = async (id: string, updates: Partial<GoodsReceipt>) => {
    try {
      const { data, error } = await supabase
        .from('goods_receipts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setReceipts(prev => prev.map(gr => gr.id === id ? data : gr));
      toast({ title: 'Success', description: 'Goods receipt updated successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const removeReceipt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goods_receipts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReceipts(prev => prev.filter(gr => gr.id !== id));
      toast({ title: 'Success', description: 'Goods receipt deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const getReceiptItems = async (receiptId: string) => {
    try {
      const { data, error } = await supabase
        .from('goods_receipt_items')
        .select('*')
        .eq('goods_receipt_id', receiptId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return [];
    }
  };

  return { receipts, loading, addReceipt, updateReceipt, removeReceipt, getReceiptItems, refetch: fetchReceipts };
};

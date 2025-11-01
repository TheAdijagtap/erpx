import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string | null;
  supplier_name: string;
  date: string;
  expected_delivery: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  item_id: string | null;
  item_name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
  unit: string;
}

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchaseOrders(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const addPurchaseOrder = async (po: Omit<PurchaseOrder, 'id' | 'created_at' | 'user_id'>, items: Omit<PurchaseOrderItem, 'id' | 'purchase_order_id'>[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .insert([{ ...po, user_id: user.id }])
        .select()
        .single();

      if (poError) throw poError;

      const itemsWithPOId = items.map(item => ({
        ...item,
        purchase_order_id: poData.id
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(itemsWithPOId);

      if (itemsError) throw itemsError;

      setPurchaseOrders(prev => [poData, ...prev]);
      toast({ title: 'Success', description: 'Purchase order created successfully' });
      return poData;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPurchaseOrders(prev => prev.map(po => po.id === id ? data : po));
      toast({ title: 'Success', description: 'Purchase order updated successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const removePurchaseOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPurchaseOrders(prev => prev.filter(po => po.id !== id));
      toast({ title: 'Success', description: 'Purchase order deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const getPurchaseOrderItems = async (poId: string) => {
    try {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', poId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return [];
    }
  };

  return { purchaseOrders, loading, addPurchaseOrder, updatePurchaseOrder, removePurchaseOrder, getPurchaseOrderItems, refetch: fetchPurchaseOrders };
};

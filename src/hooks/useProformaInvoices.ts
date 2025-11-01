import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface ProformaInvoice {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_address: string | null;
  customer_gst: string | null;
  date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  payment_terms: string | null;
  created_at: string;
}

export interface ProformaInvoiceItem {
  id: string;
  proforma_invoice_id: string;
  item_name: string;
  description: string | null;
  hsn_code: string | null;
  quantity: number;
  rate: number;
  amount: number;
  unit: string;
}

export const useProformaInvoices = () => {
  const [invoices, setInvoices] = useState<ProformaInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('proforma_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const addInvoice = async (invoice: Omit<ProformaInvoice, 'id' | 'created_at' | 'user_id'>, items: Omit<ProformaInvoiceItem, 'id' | 'proforma_invoice_id'>[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('proforma_invoices')
        .insert([{ ...invoice, user_id: user.id }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        proforma_invoice_id: invoiceData.id
      }));

      const { error: itemsError } = await supabase
        .from('proforma_invoice_items')
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;

      setInvoices(prev => [invoiceData, ...prev]);
      toast({ title: 'Success', description: 'Proforma invoice created successfully' });
      return invoiceData;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<ProformaInvoice>) => {
    try {
      const { data, error } = await supabase
        .from('proforma_invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setInvoices(prev => prev.map(inv => inv.id === id ? data : inv));
      toast({ title: 'Success', description: 'Proforma invoice updated successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const removeInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proforma_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast({ title: 'Success', description: 'Proforma invoice deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const getInvoiceItems = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('proforma_invoice_items')
        .select('*')
        .eq('proforma_invoice_id', invoiceId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return [];
    }
  };

  return { invoices, loading, addInvoice, updateInvoice, removeInvoice, getInvoiceItems, refetch: fetchInvoices };
};

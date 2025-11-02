import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ProformaInvoice {
  id: string;
  user_id: string;
  invoice_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_address: string | null;
  customer_gst: string | null;
  date: string;
  subtotal: number;
  tax_amount: number | null;
  total: number;
  payment_terms: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProformaInvoiceItem {
  id: string;
  proforma_invoice_id: string;
  item_name: string;
  description: string | null;
  hsn_code: string | null;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export const useProformaInvoices = () => {
  const [invoices, setInvoices] = useState<ProformaInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("proforma_invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      console.error("Error fetching proforma invoices:", error);
      toast({ title: "Error", description: "Failed to load proforma invoices", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getInvoiceItems = async (invoiceId: string): Promise<ProformaInvoiceItem[]> => {
    try {
      const { data, error } = await supabase
        .from("proforma_invoice_items")
        .select("*")
        .eq("proforma_invoice_id", invoiceId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching invoice items:", error);
      return [];
    }
  };

  const addInvoice = async (
    invoice: Omit<ProformaInvoice, "id" | "user_id" | "created_at">,
    items: Omit<ProformaInvoiceItem, "id" | "proforma_invoice_id">[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("proforma_invoices")
        .insert([{ ...invoice, user_id: user.id }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        proforma_invoice_id: invoiceData.id,
      }));

      const { error: itemsError } = await supabase
        .from("proforma_invoice_items")
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;

      setInvoices([invoiceData, ...invoices]);
      toast({ title: "Success", description: "Proforma invoice created successfully!" });
      return invoiceData.id;
    } catch (error: any) {
      console.error("Error adding proforma invoice:", error);
      toast({ title: "Error", description: "Failed to create proforma invoice", variant: "destructive" });
      return null;
    }
  };

  const updateInvoice = async (id: string, patch: Partial<ProformaInvoice>) => {
    try {
      const { error } = await supabase
        .from("proforma_invoices")
        .update(patch)
        .eq("id", id);

      if (error) throw error;
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, ...patch } : inv));
      toast({ title: "Success", description: "Proforma invoice updated successfully!" });
    } catch (error: any) {
      console.error("Error updating proforma invoice:", error);
      toast({ title: "Error", description: "Failed to update proforma invoice", variant: "destructive" });
    }
  };

  const removeInvoice = async (id: string) => {
    try {
      await supabase.from("proforma_invoice_items").delete().eq("proforma_invoice_id", id);

      const { error } = await supabase
        .from("proforma_invoices")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setInvoices(invoices.filter(inv => inv.id !== id));
      toast({ title: "Success", description: "Proforma invoice deleted successfully!" });
    } catch (error: any) {
      console.error("Error deleting proforma invoice:", error);
      toast({ title: "Error", description: "Failed to delete proforma invoice", variant: "destructive" });
    }
  };

  return {
    invoices,
    loading,
    addInvoice,
    updateInvoice,
    removeInvoice,
    getInvoiceItems,
    refresh: fetchInvoices,
  };
};

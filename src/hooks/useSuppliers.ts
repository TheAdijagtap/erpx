import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gst_number: string | null;
  payment_terms: string | null;
  notes: string | null;
  created_at: string;
}

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      console.error("Error fetching suppliers:", error);
      toast({ title: "Error", description: "Failed to load suppliers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const addSupplier = async (supplier: Omit<Supplier, "id" | "user_id" | "created_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("suppliers")
        .insert([{ ...supplier, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setSuppliers([data, ...suppliers]);
      toast({ title: "Success", description: "Supplier added successfully!" });
      return data.id;
    } catch (error: any) {
      console.error("Error adding supplier:", error);
      toast({ title: "Error", description: "Failed to add supplier", variant: "destructive" });
      return null;
    }
  };

  const updateSupplier = async (id: string, patch: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from("suppliers")
        .update(patch)
        .eq("id", id);

      if (error) throw error;
      setSuppliers(suppliers.map(s => s.id === id ? { ...s, ...patch } : s));
      toast({ title: "Success", description: "Supplier updated successfully!" });
    } catch (error: any) {
      console.error("Error updating supplier:", error);
      toast({ title: "Error", description: "Failed to update supplier", variant: "destructive" });
    }
  };

  const removeSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setSuppliers(suppliers.filter(s => s.id !== id));
      toast({ title: "Success", description: "Supplier deleted successfully!" });
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      toast({ title: "Error", description: "Failed to delete supplier", variant: "destructive" });
    }
  };

  return {
    suppliers,
    loading,
    addSupplier,
    updateSupplier,
    removeSupplier,
    refresh: fetchSuppliers,
  };
};

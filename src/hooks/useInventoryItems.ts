import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  current_stock: number;
  reorder_level: number | null;
  unit_price: number | null;
  supplier_id: string | null;
  hsn_code: string | null;
  created_at: string;
  updated_at: string;
}

export const useInventoryItems = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      toast({ title: "Error", description: "Failed to load inventory items", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (item: Omit<InventoryItem, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("inventory_items")
        .insert([{ ...item, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setItems([data, ...items]);
      toast({ title: "Success", description: "Item added successfully!" });
      return data.id;
    } catch (error: any) {
      console.error("Error adding item:", error);
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
      return null;
    }
  };

  const updateItem = async (id: string, patch: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from("inventory_items")
        .update(patch)
        .eq("id", id);

      if (error) throw error;
      setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
      toast({ title: "Success", description: "Item updated successfully!" });
    } catch (error: any) {
      console.error("Error updating item:", error);
      toast({ title: "Error", description: "Failed to update item", variant: "destructive" });
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setItems(items.filter(i => i.id !== id));
      toast({ title: "Success", description: "Item deleted successfully!" });
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    }
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    removeItem,
    refresh: fetchItems,
  };
};

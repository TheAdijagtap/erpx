export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customer_activities: {
        Row: {
          created_at: string
          customer_id: string
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          total_proformas: number | null
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          total_proformas?: number | null
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          total_proformas?: number | null
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goods_receipt_items: {
        Row: {
          amount: number
          goods_receipt_id: string
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          quantity_ordered: number
          quantity_received: number
          unit: string
          unit_price: number
        }
        Insert: {
          amount?: number
          goods_receipt_id: string
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          quantity_ordered: number
          quantity_received: number
          unit: string
          unit_price?: number
        }
        Update: {
          amount?: number
          goods_receipt_id?: string
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          quantity_ordered?: number
          quantity_received?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_items_goods_receipt_id_fkey"
            columns: ["goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          created_at: string
          gr_number: string
          id: string
          notes: string | null
          purchase_order_id: string | null
          receipt_date: string
          status: string
          subtotal: number
          supplier_id: string | null
          supplier_name: string
          tax_amount: number
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          gr_number: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          receipt_date: string
          status?: string
          subtotal?: number
          supplier_id?: string | null
          supplier_name: string
          tax_amount?: number
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          gr_number?: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          receipt_date?: string
          status?: string
          subtotal?: number
          supplier_id?: string | null
          supplier_name?: string
          tax_amount?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          current_stock: number
          description: string | null
          hsn_code: string | null
          id: string
          name: string
          reorder_level: number | null
          supplier_id: string | null
          unit: string
          unit_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_stock?: number
          description?: string | null
          hsn_code?: string | null
          id?: string
          name: string
          reorder_level?: number | null
          supplier_id?: string | null
          unit: string
          unit_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_stock?: number
          description?: string | null
          hsn_code?: string | null
          id?: string
          name?: string
          reorder_level?: number | null
          supplier_id?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          business_name: string | null
          contact_number: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      proforma_invoice_items: {
        Row: {
          amount: number
          description: string | null
          hsn_code: string | null
          id: string
          item_name: string
          proforma_invoice_id: string
          quantity: number
          rate: number
          unit: string
        }
        Insert: {
          amount: number
          description?: string | null
          hsn_code?: string | null
          id?: string
          item_name: string
          proforma_invoice_id: string
          quantity: number
          rate: number
          unit: string
        }
        Update: {
          amount?: number
          description?: string | null
          hsn_code?: string | null
          id?: string
          item_name?: string
          proforma_invoice_id?: string
          quantity?: number
          rate?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "proforma_invoice_items_proforma_invoice_id_fkey"
            columns: ["proforma_invoice_id"]
            isOneToOne: false
            referencedRelation: "proforma_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      proforma_invoices: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_gst: string | null
          customer_id: string | null
          customer_name: string
          date: string
          id: string
          invoice_number: string
          notes: string | null
          payment_terms: string | null
          subtotal: number
          tax_amount: number | null
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_gst?: string | null
          customer_id?: string | null
          customer_name: string
          date: string
          id?: string
          invoice_number: string
          notes?: string | null
          payment_terms?: string | null
          subtotal: number
          tax_amount?: number | null
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_gst?: string | null
          customer_id?: string | null
          customer_name?: string
          date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          payment_terms?: string | null
          subtotal?: number
          tax_amount?: number | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proforma_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          amount: number
          description: string | null
          id: string
          item_id: string | null
          item_name: string
          purchase_order_id: string
          quantity: number
          rate: number
          unit: string
        }
        Insert: {
          amount: number
          description?: string | null
          id?: string
          item_id?: string | null
          item_name: string
          purchase_order_id: string
          quantity: number
          rate: number
          unit: string
        }
        Update: {
          amount?: number
          description?: string | null
          id?: string
          item_id?: string | null
          item_name?: string
          purchase_order_id?: string
          quantity?: number
          rate?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          date: string
          expected_delivery: string | null
          id: string
          notes: string | null
          po_number: string
          status: string | null
          subtotal: number
          supplier_id: string | null
          supplier_name: string
          tax_amount: number | null
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          po_number: string
          status?: string | null
          subtotal: number
          supplier_id?: string | null
          supplier_name: string
          tax_amount?: number | null
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          po_number?: string
          status?: string | null
          subtotal?: number
          supplier_id?: string | null
          supplier_name?: string
          tax_amount?: number | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      scrap_note_items: {
        Row: {
          amount: number
          description: string | null
          id: string
          item_name: string
          quantity: number
          scrap_note_id: string
          unit: string
          unit_price: number
        }
        Insert: {
          amount: number
          description?: string | null
          id?: string
          item_name: string
          quantity: number
          scrap_note_id: string
          unit?: string
          unit_price: number
        }
        Update: {
          amount?: number
          description?: string | null
          id?: string
          item_name?: string
          quantity?: number
          scrap_note_id?: string
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "scrap_note_items_scrap_note_id_fkey"
            columns: ["scrap_note_id"]
            isOneToOne: false
            referencedRelation: "scrap_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      scrap_notes: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          scrap_number: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          scrap_number: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          scrap_number?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

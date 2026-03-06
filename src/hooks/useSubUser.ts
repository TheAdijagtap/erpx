import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SubUserInfo {
  isSubUser: boolean;
  parentUserId: string | null;
  effectiveUserId: string; // parent's ID if sub-user, own ID otherwise
  permissions: string[];
  loading: boolean;
  refreshSubUserInfo: () => Promise<void>;
}

export const ALL_FEATURES = [
  { key: "inventory", label: "Inventory" },
  { key: "stock-transfer", label: "Stock Transfer" },
  { key: "bom", label: "Bill of Materials" },
  { key: "purchase-orders", label: "Purchase Orders" },
  { key: "goods-receipt", label: "Goods Receipt" },
  { key: "proforma", label: "Proforma Invoice" },
  { key: "suppliers", label: "Suppliers" },
  { key: "employees", label: "Employees" },
  { key: "attendance", label: "Attendance" },
  { key: "leaves", label: "Leave Management" },
  { key: "payroll", label: "Payroll" },
  { key: "business", label: "Business Setup" },
] as const;

export const useSubUser = (): SubUserInfo => {
  const { user } = useAuth();
  const [isSubUser, setIsSubUser] = useState(false);
  const [parentUserId, setParentUserId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSubUserInfo = useCallback(async () => {
    if (!user) {
      setIsSubUser(false);
      setParentUserId(null);
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      // Check if user is a sub-user
      const { data: link } = await supabase
        .from("sub_user_links")
        .select("parent_user_id")
        .eq("sub_user_id", user.id)
        .maybeSingle();

      if (link) {
        setIsSubUser(true);
        setParentUserId(link.parent_user_id);

        // Fetch permissions
        const { data: perms } = await supabase
          .from("sub_user_permissions")
          .select("feature")
          .eq("sub_user_id", user.id);

        setPermissions((perms || []).map((p: any) => p.feature));
      } else {
        setIsSubUser(false);
        setParentUserId(null);
        setPermissions([]);
      }
    } catch (err) {
      console.error("Error checking sub-user status:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSubUserInfo();
  }, [refreshSubUserInfo]);

  return {
    isSubUser,
    parentUserId,
    effectiveUserId: parentUserId || user?.id || "",
    permissions,
    loading,
    refreshSubUserInfo,
  };
};

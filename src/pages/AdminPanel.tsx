import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Loader2, Users, Calendar, Shield, Edit2, 
  Database, Package, FileText, Truck, ShoppingCart,
  TrendingUp, UserPlus, Clock, CheckCircle, XCircle,
  HardDrive, Activity
} from "lucide-react";
import { format, differenceInDays, addDays, subDays } from "date-fns";

interface UserProfile {
  id: string;
  email: string | null;
  business_name: string | null;
  contact_number: string | null;
  trial_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
}

interface DatabaseStats {
  inventory_items: number;
  suppliers: number;
  purchase_orders: number;
  goods_receipts: number;
  proforma_invoices: number;
  customers: number;
  transactions: number;
  passkeys: number;
}

interface UserGrowthStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

const AdminPanel = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [trialDays, setTrialDays] = useState("");
  const [subscriptionDays, setSubscriptionDays] = useState("");
  const [saving, setSaving] = useState(false);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchDatabaseStats();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDatabaseStats = async () => {
    try {
      // Fetch counts from all tables in parallel
      const [
        inventoryRes,
        suppliersRes,
        poRes,
        grRes,
        piRes,
        customersRes,
        transactionsRes,
        passkeysRes
      ] = await Promise.all([
        supabase.from("inventory_items").select("id", { count: "exact", head: true }),
        supabase.from("suppliers").select("id", { count: "exact", head: true }),
        supabase.from("purchase_orders").select("id", { count: "exact", head: true }),
        supabase.from("goods_receipts").select("id", { count: "exact", head: true }),
        supabase.from("proforma_invoices").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("inventory_transactions").select("id", { count: "exact", head: true }),
        supabase.from("passkeys").select("id", { count: "exact", head: true })
      ]);

      setDbStats({
        inventory_items: inventoryRes.count || 0,
        suppliers: suppliersRes.count || 0,
        purchase_orders: poRes.count || 0,
        goods_receipts: grRes.count || 0,
        proforma_invoices: piRes.count || 0,
        customers: customersRes.count || 0,
        transactions: transactionsRes.count || 0,
        passkeys: passkeysRes.count || 0
      });
    } catch (err) {
      console.error("Error fetching database stats:", err);
    } finally {
      setDbLoading(false);
    }
  };

  const getUserGrowthStats = (): UserGrowthStats => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = subDays(todayStart, 7);
    const monthStart = subDays(todayStart, 30);

    return {
      today: users.filter(u => new Date(u.created_at) >= todayStart).length,
      thisWeek: users.filter(u => new Date(u.created_at) >= weekStart).length,
      thisMonth: users.filter(u => new Date(u.created_at) >= monthStart).length
    };
  };

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    
    // Calculate remaining trial days
    if (user.trial_start_date) {
      const trialStart = new Date(user.trial_start_date);
      const trialEnd = addDays(trialStart, 15);
      const remaining = differenceInDays(trialEnd, new Date());
      setTrialDays(String(Math.max(0, remaining)));
    } else {
      setTrialDays("15");
    }
    
    // Calculate remaining subscription days
    if (user.subscription_end_date) {
      const subEnd = new Date(user.subscription_end_date);
      const remaining = differenceInDays(subEnd, new Date());
      setSubscriptionDays(String(Math.max(0, remaining)));
    } else {
      setSubscriptionDays("0");
    }
    
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    
    setSaving(true);
    try {
      const updates: Partial<UserProfile> = {};
      
      // Set new trial end date based on days from now
      const trialDaysNum = parseInt(trialDays) || 0;
      if (trialDaysNum > 0) {
        const newTrialStart = addDays(new Date(), -15 + trialDaysNum);
        updates.trial_start_date = newTrialStart.toISOString();
      }
      
      // Set subscription end date based on days from now
      const subDaysNum = parseInt(subscriptionDays) || 0;
      if (subDaysNum > 0) {
        const newSubEnd = addDays(new Date(), subDaysNum);
        updates.subscription_end_date = newSubEnd.toISOString();
      } else {
        updates.subscription_end_date = null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success("User updated successfully");
      setEditDialogOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const getStatus = (user: UserProfile) => {
    const now = new Date();
    
    // Check subscription first
    if (user.subscription_end_date) {
      const subEnd = new Date(user.subscription_end_date);
      const daysLeft = differenceInDays(subEnd, now);
      if (daysLeft > 0) {
        return { type: "subscribed", label: `${daysLeft}d subscription`, variant: "default" as const };
      } else {
        return { type: "expired", label: "Subscription expired", variant: "destructive" as const };
      }
    }
    
    // Check trial
    if (user.trial_start_date) {
      const trialStart = new Date(user.trial_start_date);
      const trialEnd = addDays(trialStart, 15);
      const daysLeft = differenceInDays(trialEnd, now);
      if (daysLeft > 0) {
        return { type: "trial", label: `${daysLeft}d trial left`, variant: "secondary" as const };
      } else {
        return { type: "expired", label: "Trial expired", variant: "destructive" as const };
      }
    }
    
    return { type: "unknown", label: "No status", variant: "outline" as const };
  };

  const getConversionRate = () => {
    if (users.length === 0) return 0;
    const subscribed = users.filter(u => getStatus(u).type === "subscribed").length;
    return ((subscribed / users.length) * 100).toFixed(1);
  };

  const getActiveRate = () => {
    if (users.length === 0) return 0;
    const active = users.filter(u => {
      const status = getStatus(u);
      return status.type === "subscribed" || status.type === "trial";
    }).length;
    return ((active / users.length) * 100).toFixed(1);
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const growthStats = getUserGrowthStats();
  const totalDbRecords = dbStats 
    ? Object.values(dbStats).reduce((a, b) => a + b, 0) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, trials, and subscriptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Activity className="h-4 w-4 mr-2 text-green-500" />
            System Online
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Users className="h-4 w-4 mr-2" />
            {users.length} Users
          </Badge>
        </div>
      </div>

      {/* User Stats Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Total Users
            </div>
            <div className="text-2xl font-bold mt-1">{users.length}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Active Trials
            </div>
            <div className="text-2xl font-bold mt-1 text-blue-600">
              {users.filter((u) => getStatus(u).type === "trial").length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              Subscribed
            </div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {users.filter((u) => getStatus(u).type === "subscribed").length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4" />
              Expired
            </div>
            <div className="text-2xl font-bold mt-1 text-destructive">
              {users.filter((u) => getStatus(u).type === "expired").length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserPlus className="h-4 w-4" />
              Today
            </div>
            <div className="text-2xl font-bold mt-1 text-purple-600">{growthStats.today}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              This Week
            </div>
            <div className="text-2xl font-bold mt-1">{growthStats.thisWeek}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              This Month
            </div>
            <div className="text-2xl font-bold mt-1">{growthStats.thisMonth}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Conversion
            </div>
            <div className="text-2xl font-bold mt-1 text-green-600">{getConversionRate()}%</div>
          </Card>
        </div>
      </div>

      {/* Database Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </h2>
        {dbLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading database stats...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="p-4 border-l-4 border-l-primary">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HardDrive className="h-4 w-4" />
                Total Records
              </div>
              <div className="text-2xl font-bold mt-1">{totalDbRecords.toLocaleString()}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                Inventory
              </div>
              <div className="text-2xl font-bold mt-1">{dbStats?.inventory_items || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                Suppliers
              </div>
              <div className="text-2xl font-bold mt-1">{dbStats?.suppliers || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                PO's
              </div>
              <div className="text-2xl font-bold mt-1">{dbStats?.purchase_orders || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                GR's
              </div>
              <div className="text-2xl font-bold mt-1">{dbStats?.goods_receipts || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Invoices
              </div>
              <div className="text-2xl font-bold mt-1">{dbStats?.proforma_invoices || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Customers
              </div>
              <div className="text-2xl font-bold mt-1">{dbStats?.customers || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Transactions
              </div>
              <div className="text-2xl font-bold mt-1">{dbStats?.transactions || 0}</div>
            </Card>
          </div>
        )}
      </div>

      {/* Active Rate Card */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Overall Active User Rate</div>
            <div className="text-3xl font-bold text-primary">{getActiveRate()}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              Users currently on trial or with active subscription
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Passkeys Issued</div>
            <div className="text-2xl font-bold">{dbStats?.passkeys || 0}</div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="font-semibold">All Users</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const status = getStatus(user);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email || "—"}</TableCell>
                    <TableCell>{user.business_name || "—"}</TableCell>
                    <TableCell>{user.contact_number || "—"}</TableCell>
                    <TableCell>
                      {user.created_at
                        ? format(new Date(user.created_at), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Edit User: {selectedUser?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trialDays">Trial Days Remaining</Label>
              <Input
                id="trialDays"
                type="number"
                min="0"
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                placeholder="Enter days"
              />
              <p className="text-xs text-muted-foreground">
                Set the number of trial days remaining from today
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionDays">Subscription Days Remaining</Label>
              <Input
                id="subscriptionDays"
                type="number"
                min="0"
                value={subscriptionDays}
                onChange={(e) => setSubscriptionDays(e.target.value)}
                placeholder="Enter days (0 to remove subscription)"
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 to remove subscription, or set days from today
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;

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
import { Loader2, Users, Calendar, Shield, Edit2 } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";

interface UserProfile {
  id: string;
  email: string | null;
  business_name: string | null;
  contact_number: string | null;
  trial_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
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

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
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
        <Badge variant="outline" className="px-3 py-1">
          <Users className="h-4 w-4 mr-2" />
          {users.length} Users
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Users</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Trials</div>
          <div className="text-2xl font-bold">
            {users.filter((u) => getStatus(u).type === "trial").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Subscribed</div>
          <div className="text-2xl font-bold">
            {users.filter((u) => getStatus(u).type === "subscribed").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Expired</div>
          <div className="text-2xl font-bold text-destructive">
            {users.filter((u) => getStatus(u).type === "expired").length}
          </div>
        </Card>
      </div>

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

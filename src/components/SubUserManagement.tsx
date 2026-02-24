import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Trash2, Shield, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ALL_FEATURES } from "@/hooks/useSubUser";

interface SubUser {
  id: string;
  sub_user_id: string;
  email: string;
  permissions: string[];
  created_at: string;
}

const SubUserManagement = () => {
  const { user } = useAuth();
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<SubUser | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const fetchSubUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: links } = await supabase
      .from("sub_user_links")
      .select("id, sub_user_id, created_at")
      .eq("parent_user_id", user.id);

    if (!links || links.length === 0) {
      setSubUsers([]);
      setLoading(false);
      return;
    }

    // Fetch permissions for all sub-users
    const subUserIds = links.map((l: any) => l.sub_user_id);
    const { data: perms } = await supabase
      .from("sub_user_permissions")
      .select("sub_user_id, feature")
      .in("sub_user_id", subUserIds);

    // Build sub-user list with emails from auth (we'll use the link data)
    const mapped: SubUser[] = links.map((link: any) => ({
      id: link.id,
      sub_user_id: link.sub_user_id,
      email: "", // We'll need to get this from somewhere
      permissions: (perms || [])
        .filter((p: any) => p.sub_user_id === link.sub_user_id)
        .map((p: any) => p.feature),
      created_at: link.created_at,
    }));

    setSubUsers(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubUsers();
  }, [fetchSubUsers]);

  const handleCreate = async () => {
    if (!newEmail || !newPassword) {
      toast({ title: "Error", description: "Email and password are required.", variant: "destructive" as any });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" as any });
      return;
    }
    if (selectedPermissions.length === 0) {
      toast({ title: "Error", description: "Select at least one feature.", variant: "destructive" as any });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-sub-user", {
        body: { email: newEmail, password: newPassword, permissions: selectedPermissions },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Success", description: `Sub-user ${newEmail} created successfully.` });
      setNewEmail("");
      setNewPassword("");
      setSelectedPermissions([]);
      setShowAddDialog(false);
      fetchSubUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create sub-user.", variant: "destructive" as any });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (subUser: SubUser) => {
    if (!confirm("Are you sure? This will permanently delete this sub-user and revoke their login access.")) return;

    try {
      const { data, error } = await supabase.functions.invoke("delete-sub-user", {
        body: { subUserId: subUser.sub_user_id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Removed", description: "Sub-user has been permanently deleted." });
      fetchSubUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete sub-user.", variant: "destructive" as any });
    }
  };

  const togglePermission = (feature: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(feature) ? list.filter(f => f !== feature) : [...list, feature]);
  };

  const handleUpdatePermissions = async () => {
    if (!editingUser) return;

    // Delete all existing permissions
    await supabase
      .from("sub_user_permissions")
      .delete()
      .eq("sub_user_id", editingUser.sub_user_id);

    // Insert new permissions
    if (editPermissions.length > 0) {
      const rows = editPermissions.map(feature => ({
        sub_user_id: editingUser.sub_user_id,
        feature,
      }));
      await supabase.from("sub_user_permissions").insert(rows);
    }

    toast({ title: "Updated", description: "Permissions updated successfully." });
    setEditingUser(null);
    fetchSubUsers();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-light rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Sub-Users</h2>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Sub-User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Sub-User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="subuser@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="space-y-2">
                <Label>Feature Access</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_FEATURES.map((f) => (
                    <Badge
                      key={f.key}
                      variant={selectedPermissions.includes(f.key) ? "default" : "outline"}
                      className="cursor-pointer select-none"
                      onClick={() => togglePermission(f.key, selectedPermissions, setSelectedPermissions)}
                    >
                      {f.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? "Creating..." : "Create Sub-User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading sub-users...</p>
      ) : subUsers.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sub-users added yet. Add a sub-user to give them restricted access to your account.</p>
      ) : (
        <div className="space-y-3">
          {subUsers.map((su) => (
            <div key={su.id} className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex-1">
                <p className="font-medium text-sm">{su.email || su.sub_user_id.slice(0, 8) + "..."}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {su.permissions.length > 0 ? (
                    su.permissions.map((p) => {
                      const feat = ALL_FEATURES.find(f => f.key === p);
                      return (
                        <Badge key={p} variant="secondary" className="text-xs">
                          {feat?.label || p}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground">No permissions</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingUser(su);
                    setEditPermissions([...su.permissions]);
                  }}
                >
                  <Shield className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(su)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Permissions Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {ALL_FEATURES.map((f) => (
                <Badge
                  key={f.key}
                  variant={editPermissions.includes(f.key) ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => togglePermission(f.key, editPermissions, setEditPermissions)}
                >
                  {f.label}
                </Badge>
              ))}
            </div>
            <Button onClick={handleUpdatePermissions} className="w-full">
              Save Permissions
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SubUserManagement;

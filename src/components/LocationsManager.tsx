import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useData } from "@/store/SupabaseDataContext";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
  address?: string;
}

const LocationsManager = () => {
  const { effectiveUserId } = useData();
  const [locations, setLocations] = useState<Location[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const fetchLocations = async () => {
    const { data } = await supabase.from("locations").select("*").order("created_at", { ascending: true });
    setLocations((data || []).map((l: any) => ({ id: l.id, name: l.name, address: l.address })));
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Location name is required"); return; }

    if (editingId) {
      const { error } = await supabase.from("locations").update({ name, address: address || null }).eq("id", editingId);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Location updated");
    } else {
      const { error } = await supabase.from("locations").insert({ user_id: effectiveUserId, name, address: address || null });
      if (error) { toast.error("Failed to add location"); return; }
      toast.success("Location added");
    }

    setName(""); setAddress(""); setShowAdd(false); setEditingId(null);
    fetchLocations();
  };

  const handleEdit = (loc: Location) => {
    setEditingId(loc.id);
    setName(loc.name);
    setAddress(loc.address || "");
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) { toast.error("Cannot delete (may be in use)"); return; }
    toast.success("Location deleted");
    fetchLocations();
  };

  const handleCancel = () => {
    setShowAdd(false); setEditingId(null); setName(""); setAddress("");
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-light rounded-lg">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Stock Locations</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Define warehouse/stock locations for stock transfers.</p>

      {locations.length > 0 && (
        <div className="space-y-2 mb-4">
          {locations.map(loc => (
            <div key={loc.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div>
                <span className="font-medium">{loc.name}</span>
                {loc.address && <span className="text-sm text-muted-foreground ml-2">— {loc.address}</span>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(loc)}><Edit className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(loc.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <div className="space-y-3 p-4 border rounded-md">
          <div className="space-y-2">
            <Label>Location Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main Warehouse" />
          </div>
          <div className="space-y-2">
            <Label>Address (Optional)</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Location address" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}><Save className="w-3.5 h-3.5 mr-1" /> {editingId ? "Update" : "Add"}</Button>
            <Button size="sm" variant="outline" onClick={handleCancel}><X className="w-3.5 h-3.5 mr-1" /> Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Location
        </Button>
      )}
    </Card>
  );
};

export default LocationsManager;

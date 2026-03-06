import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Plus, Trash2, Eye, Edit, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useData } from "@/store/SupabaseDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BOM {
  id: string;
  productName: string;
  productDescription?: string;
  unit: string;
  quantity: number;
  items: BOMItem[];
  createdAt: string;
}

interface BOMItem {
  id: string;
  itemId?: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface FormItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  search: string;
}

const BillOfMaterials = () => {
  const { inventoryItems, effectiveUserId } = useData();
  const { user } = useAuth();
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showView, setShowView] = useState<BOM | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productUnit, setProductUnit] = useState("pcs");
  const [productQty, setProductQty] = useState(1);
  const [formItems, setFormItems] = useState<FormItem[]>([{ itemId: "", itemName: "", quantity: 0, unit: "pcs", unitPrice: 0, search: "" }]);

  const fetchBoms = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bom")
      .select("*, bom_items(*)")
      .order("created_at", { ascending: false });

    setBoms((data || []).map((b: any) => ({
      id: b.id,
      productName: b.product_name,
      productDescription: b.product_description,
      unit: b.unit,
      quantity: Number(b.quantity),
      createdAt: b.created_at,
      items: (b.bom_items || []).map((i: any) => ({
        id: i.id,
        itemId: i.item_id,
        itemName: i.item_name,
        quantity: Number(i.quantity),
        unit: i.unit,
        unitPrice: Number(i.unit_price) || 0,
      })),
    })));
    setLoading(false);
  };

  useEffect(() => { fetchBoms(); }, [user]);

  const addFormItem = () => setFormItems([...formItems, { itemId: "", itemName: "", quantity: 0, unit: "pcs", unitPrice: 0, search: "" }]);

  const removeFormItem = (idx: number) => {
    if (formItems.length > 1) setFormItems(formItems.filter((_, i) => i !== idx));
  };

  const updateFormItem = (idx: number, field: keyof FormItem, value: any) => {
    const updated = [...formItems];
    if (field === "itemId") {
      const inv = inventoryItems.find(i => i.id === value);
      updated[idx] = { ...updated[idx], itemId: value, itemName: inv?.name || "", unit: inv?.unit || "pcs", unitPrice: inv?.unitPrice || 0 };
    } else {
      (updated[idx] as any)[field] = value;
    }
    setFormItems(updated);
  };

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setProductUnit("pcs");
    setProductQty(1);
    setFormItems([{ itemId: "", itemName: "", quantity: 0, unit: "pcs", unitPrice: 0, search: "" }]);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!productName.trim()) { toast.error("Product name is required"); return; }
    if (formItems.some(i => !i.itemName || i.quantity <= 0)) { toast.error("Fill all material items"); return; }

    if (editingId) {
      // Update existing
      const { error } = await supabase.from("bom").update({
        product_name: productName,
        product_description: productDescription || null,
        unit: productUnit,
        quantity: productQty,
      }).eq("id", editingId);

      if (error) { toast.error("Failed to update BOM"); return; }

      // Delete old items and re-insert
      await supabase.from("bom_items").delete().eq("bom_id", editingId);
      await supabase.from("bom_items").insert(formItems.map(i => ({
        bom_id: editingId,
        item_id: i.itemId || null,
        item_name: i.itemName,
        quantity: i.quantity,
        unit: i.unit,
        unit_price: i.unitPrice,
      })));

      toast.success("BOM updated");
    } else {
      // Create new
      const { data: bom, error } = await supabase
        .from("bom")
        .insert({
          user_id: effectiveUserId,
          product_name: productName,
          product_description: productDescription || null,
          unit: productUnit,
          quantity: productQty,
        })
        .select()
        .single();

      if (error || !bom) { toast.error("Failed to create BOM"); return; }

      await supabase.from("bom_items").insert(formItems.map(i => ({
        bom_id: bom.id,
        item_id: i.itemId || null,
        item_name: i.itemName,
        quantity: i.quantity,
        unit: i.unit,
        unit_price: i.unitPrice,
      })));

      toast.success("BOM created");
    }

    setShowForm(false);
    resetForm();
    fetchBoms();
  };

  const handleEdit = (bom: BOM) => {
    setEditingId(bom.id);
    setProductName(bom.productName);
    setProductDescription(bom.productDescription || "");
    setProductUnit(bom.unit);
    setProductQty(bom.quantity);
    setFormItems(bom.items.map(i => ({
      itemId: i.itemId || "",
      itemName: i.itemName,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
      search: "",
    })));
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("bom").delete().eq("id", id);
    if (error) { toast.error("Failed to delete BOM"); return; }
    toast.success("BOM deleted");
    fetchBoms();
  };

  const filteredBoms = boms.filter(b =>
    b.productName.toLowerCase().includes(search.toLowerCase())
  );

  const totalCost = (items: BOMItem[]) => items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bill of Materials</h1>
          <p className="text-muted-foreground mt-1">Define raw materials needed per finished product</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New BOM
        </Button>
      </div>

      {boms.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filteredBoms.length > 0 ? (
        <div className="grid gap-4">
          {filteredBoms.map(bom => (
            <Card key={bom.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{bom.productName}</h3>
                  {bom.productDescription && <p className="text-sm text-muted-foreground">{bom.productDescription}</p>}
                  <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Output: {bom.quantity} {bom.unit}</span>
                    <span>Materials: {bom.items.length}</span>
                    <span>Est. Cost: ₹{totalCost(bom.items).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setShowView(bom)}><Eye className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(bom)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(bom.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !loading ? (
        <Card className="p-8 text-center">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Bill of Materials Yet</h3>
          <p className="text-muted-foreground">Define what raw materials are needed to produce your finished products.</p>
        </Card>
      ) : null}

      {/* Create/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "New"} Bill of Materials</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Finished Product Name *</Label>
                <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Widget Assembly" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Output Qty</Label>
                  <Input type="number" value={productQty} onChange={e => setProductQty(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input value={productUnit} onChange={e => setProductUnit(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} placeholder="Product description..." />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Raw Materials</Label>
                <Button variant="outline" size="sm" onClick={addFormItem}><Plus className="w-3 h-3 mr-1" /> Add Material</Button>
              </div>
              {formItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Search inventory item..."
                      value={item.itemId ? item.itemName : item.search}
                      onChange={e => {
                        const updated = [...formItems];
                        updated[idx] = { ...updated[idx], search: e.target.value, itemId: "", itemName: "" };
                        setFormItems(updated);
                      }}
                    />
                    {!item.itemId && item.search.length > 0 && (() => {
                      const filtered = inventoryItems.filter(i =>
                        i.name.toLowerCase().includes(item.search.toLowerCase())
                      );
                      return filtered.length > 0 ? (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md max-h-48 overflow-y-auto">
                          {filtered.map(i => (
                            <button
                              key={i.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                              onClick={() => updateFormItem(idx, "itemId", i.id)}
                            >
                              {i.name} <span className="text-muted-foreground">({i.unit})</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md px-3 py-2 text-sm text-muted-foreground">
                          No items found
                        </div>
                      );
                    })()}
                  </div>
                  <div className="w-20">
                    <Input type="number" placeholder="Qty" value={item.quantity || ""} onChange={e => updateFormItem(idx, "quantity", Number(e.target.value))} />
                  </div>
                  <div className="w-16">
                    <Input value={item.unit} readOnly className="bg-muted" />
                  </div>
                  <div className="w-24">
                    <Input type="number" placeholder="Price" value={item.unitPrice || ""} onChange={e => updateFormItem(idx, "unitPrice", Number(e.target.value))} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFormItem(idx)} disabled={formItems.length === 1}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="text-right text-sm font-medium">
                Est. Cost: ₹{formItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toFixed(2)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Update" : "Create"} BOM</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View BOM Dialog */}
      <Dialog open={!!showView} onOpenChange={() => setShowView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{showView?.productName}</DialogTitle>
          </DialogHeader>
          {showView && (
            <div className="space-y-4">
              {showView.productDescription && <p className="text-muted-foreground">{showView.productDescription}</p>}
              <div className="text-sm"><span className="text-muted-foreground">Output:</span> {showView.quantity} {showView.unit}</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showView.items.map(i => (
                    <TableRow key={i.id}>
                      <TableCell>{i.itemName}</TableCell>
                      <TableCell>{i.quantity}</TableCell>
                      <TableCell>{i.unit}</TableCell>
                      <TableCell className="text-right">₹{(i.quantity * i.unitPrice).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="font-semibold">Total Estimated Cost</TableCell>
                    <TableCell className="text-right font-semibold">₹{totalCost(showView.items).toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillOfMaterials;

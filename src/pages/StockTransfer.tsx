import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Plus, Trash2, Eye, Printer, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { printElementById } from "@/lib/print";
import { escapeHtml } from "@/lib/htmlEscape";
import { useData } from "@/store/SupabaseDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

interface Location {
  id: string;
  name: string;
  address?: string;
}

interface StockTransfer {
  id: string;
  transferNumber: string;
  fromLocation: string;
  toLocation: string;
  status: string;
  date: string;
  notes?: string;
  items: { id: string; itemName: string; quantity: number; unit: string }[];
}

interface TransferItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

const StockTransfer = () => {
  const { inventoryItems, effectiveUserId } = useData();
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState<StockTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<TransferItem[]>([{ itemId: "", itemName: "", quantity: 0, unit: "pcs" }]);
  const [itemSearches, setItemSearches] = useState<Record<number, string>>({});

  const fetchData = async () => {
    if (!user) return;
    const [{ data: locs }, { data: trans }] = await Promise.all([
      supabase.from("locations").select("*").order("created_at", { ascending: false }),
      supabase.from("stock_transfers").select("*, stock_transfer_items(*)").order("created_at", { ascending: false }),
    ]);

    const locsArr = (locs || []).map((l: any) => ({ id: l.id, name: l.name, address: l.address }));
    setLocations(locsArr);
    setTransfers((trans || []).map((t: any) => ({
      id: t.id,
      transferNumber: t.transfer_number,
      fromLocation: locsArr.find((l: any) => l.id === t.from_location_id)?.name || "Unknown",
      toLocation: locsArr.find((l: any) => l.id === t.to_location_id)?.name || "Unknown",
      status: t.status,
      date: t.date,
      notes: t.notes,
      items: (t.stock_transfer_items || []).map((i: any) => ({
        id: i.id,
        itemName: i.item_name,
        quantity: Number(i.quantity),
        unit: i.unit,
      })),
    })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const addItem = () => setItems([...items, { itemId: "", itemName: "", quantity: 0, unit: "pcs" }]);

  const removeItem = (idx: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof TransferItem, value: any) => {
    const updated = [...items];
    if (field === "itemId") {
      const inv = inventoryItems.find(i => i.id === value);
      updated[idx] = { ...updated[idx], itemId: value, itemName: inv?.name || "", unit: inv?.unit || "pcs" };
    } else {
      (updated[idx] as any)[field] = value;
    }
    setItems(updated);
  };

  const getLocationStock = async (locationId: string, itemId: string): Promise<number> => {
    // Get all completed transfers involving this location and item
    const { data: transfers } = await supabase
      .from("stock_transfers")
      .select("id, from_location_id, to_location_id, stock_transfer_items(item_id, quantity)")
      .or(`from_location_id.eq.${locationId},to_location_id.eq.${locationId}`);

    let stock = 0;
    (transfers || []).forEach((t: any) => {
      (t.stock_transfer_items || []).forEach((si: any) => {
        if (si.item_id === itemId) {
          if (t.to_location_id === locationId) stock += Number(si.quantity);
          if (t.from_location_id === locationId) stock -= Number(si.quantity);
        }
      });
    });
    return stock;
  };

  const handleCreate = async () => {
    if (!fromLocationId || !toLocationId || fromLocationId === toLocationId) {
      toast.error("Select different from/to locations");
      return;
    }
    if (items.some(i => !i.itemId || i.quantity <= 0)) {
      toast.error("Fill all items with valid quantities");
      return;
    }

    // Validate stock availability at source location
    for (const item of items) {
      const availableStock = await getLocationStock(fromLocationId, item.itemId);
      if (availableStock < item.quantity) {
        const fromLocName = locations.find(l => l.id === fromLocationId)?.name || "Unknown";
        toast.error(`Insufficient stock for "${item.itemName}" at ${fromLocName}. Available: ${availableStock}, Requested: ${item.quantity}`);
        return;
      }
    }

    const transferNumber = `ST-${Date.now().toString(36).toUpperCase()}`;
    const { data: transfer, error } = await supabase
      .from("stock_transfers")
      .insert({
        user_id: effectiveUserId,
        transfer_number: transferNumber,
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
        notes,
      })
      .select()
      .single();

    if (error || !transfer) {
      toast.error("Failed to create transfer");
      return;
    }

    const { error: itemsError } = await supabase
      .from("stock_transfer_items")
      .insert(items.map(i => ({
        stock_transfer_id: transfer.id,
        item_id: i.itemId,
        item_name: i.itemName,
        quantity: i.quantity,
        unit: i.unit,
      })));

    if (itemsError) {
      toast.error("Failed to add transfer items");
      return;
    }

    // Record inventory transactions for each item
    const fromLocName = locations.find(l => l.id === fromLocationId)?.name || "Unknown";
    const toLocName = locations.find(l => l.id === toLocationId)?.name || "Unknown";
    const txRecords = items.flatMap(i => [
      {
        user_id: effectiveUserId,
        item_id: i.itemId,
        item_name: i.itemName,
        type: "OUT",
        quantity: i.quantity,
        reason: "Stock Transfer",
        reference: transferNumber,
        notes: `Transferred from ${fromLocName} to ${toLocName}`,
      },
      {
        user_id: effectiveUserId,
        item_id: i.itemId,
        item_name: i.itemName,
        type: "IN",
        quantity: i.quantity,
        reason: "Stock Transfer",
        reference: transferNumber,
        notes: `Received from ${fromLocName} to ${toLocName}`,
      },
    ]);
    await supabase.from("inventory_transactions").insert(txRecords);

    toast.success(`Stock transfer ${transferNumber} created`);
    setShowCreate(false);
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setFromLocationId("");
    setToLocationId("");
    setNotes("");
    setItems([{ itemId: "", itemName: "", quantity: 0, unit: "pcs" }]);
    setItemSearches({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Transfer</h1>
          <p className="text-muted-foreground mt-1">Transfer stock between locations</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Transfer
        </Button>
      </div>

      {locations.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <ArrowRightLeft className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Locations Defined</h3>
          <p className="text-muted-foreground mb-4">Please add locations in Business Setup first before creating stock transfers.</p>
          <Button variant="outline" onClick={() => window.location.href = "/business"}>Go to Business Setup</Button>
        </Card>
      )}

      {transfers.length > 0 && (
        <Card>
          <div className="p-4 pb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by transfer #, location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer #</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers
                .filter(t => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return t.transferNumber.toLowerCase().includes(q) ||
                    t.fromLocation.toLowerCase().includes(q) ||
                    t.toLocation.toLowerCase().includes(q) ||
                    t.status.toLowerCase().includes(q);
                })
                .map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.transferNumber}</TableCell>
                  <TableCell>{t.fromLocation}</TableCell>
                  <TableCell>{t.toLocation}</TableCell>
                  <TableCell>{t.items.length} item(s)</TableCell>
                  <TableCell>{new Date(t.date).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setShowView(t)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {transfers.length === 0 && locations.length > 0 && !loading && (
        <Card className="p-8 text-center">
          <ArrowRightLeft className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Stock Transfers Yet</h3>
          <p className="text-muted-foreground">Create your first stock transfer to move items between locations.</p>
        </Card>
      )}

      {/* Create Transfer Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Stock Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Location</Label>
                <Select value={fromLocationId} onValueChange={setFromLocationId}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Location</Label>
                <Select value={toLocationId} onValueChange={setToLocationId}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {locations.filter(l => l.id !== fromLocationId).map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      value={item.itemId}
                      onValueChange={v => {
                        updateItem(idx, "itemId", v);
                        setItemSearches(prev => ({ ...prev, [idx]: "" }));
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search items..."
                            value={itemSearches[idx] || ""}
                            onChange={e => setItemSearches(prev => ({ ...prev, [idx]: e.target.value }))}
                            onKeyDown={e => e.stopPropagation()}
                            className="h-8"
                          />
                        </div>
                        {inventoryItems
                          .filter(i => {
                            const search = (itemSearches[idx] || "").toLowerCase();
                            if (!search) return true;
                            return i.name.toLowerCase().includes(search) || (i.itemCode || "").toLowerCase().includes(search);
                          })
                          .map(i => (
                            <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity || ""}
                      onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                    />
                  </div>
                  <div className="w-20">
                    <Input value={item.unit} readOnly className="bg-muted" />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Transfer notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Transfer Dialog */}
      <Dialog open={!!showView} onOpenChange={() => setShowView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              Transfer {showView?.transferNumber}
              {showView && (
                <Button variant="outline" size="sm" className="gap-1" onClick={() => printElementById("st-print", `Stock Transfer - ${showView.transferNumber}`)}>
                  <Printer className="w-4 h-4" /> Print
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {showView && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm text-muted-foreground">From:</span> <span className="font-medium">{showView.fromLocation}</span></div>
                <div><span className="text-sm text-muted-foreground">To:</span> <span className="font-medium">{showView.toLocation}</span></div>
                <div><span className="text-sm text-muted-foreground">Date:</span> <span className="font-medium">{new Date(showView.date).toLocaleDateString("en-IN")}</span></div>
                <div><span className="text-sm text-muted-foreground">Status:</span> <Badge variant="secondary">{showView.status}</Badge></div>
              </div>
              {showView.notes && <div><span className="text-sm text-muted-foreground">Notes:</span> <p>{showView.notes}</p></div>}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showView.items.map(i => (
                    <TableRow key={i.id}>
                      <TableCell>{i.itemName}</TableCell>
                      <TableCell>{i.quantity}</TableCell>
                      <TableCell>{i.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Hidden printable content */}
              {showView && (
                <div id="st-print" className="hidden">
                  <h2>Stock Transfer Note</h2>
                  <div className="section">
                    <div className="grid">
                      <div><strong>Transfer #:</strong> {escapeHtml(showView.transferNumber)}</div>
                      <div><strong>Date:</strong> {new Date(showView.date).toLocaleDateString("en-IN")}</div>
                    </div>
                    <div className="grid" style={{ marginTop: 8 }}>
                      <div><strong>From Location:</strong> {escapeHtml(showView.fromLocation)}</div>
                      <div><strong>To Location:</strong> {escapeHtml(showView.toLocation)}</div>
                    </div>
                    <div style={{ marginTop: 8 }}><strong>Status:</strong> {escapeHtml(showView.status)}</div>
                    {showView.notes && <div style={{ marginTop: 4 }}><strong>Notes:</strong> {escapeHtml(showView.notes)}</div>}
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showView.items.map((i, idx) => (
                        <tr key={i.id}>
                          <td>{idx + 1}</td>
                          <td>{escapeHtml(i.itemName)}</td>
                          <td>{i.quantity}</td>
                          <td>{escapeHtml(i.unit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockTransfer;

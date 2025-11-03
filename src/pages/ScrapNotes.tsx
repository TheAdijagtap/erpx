import { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/format";
import { printDocument } from "@/lib/print";

interface ScrapNoteItem {
  id?: string;
  item_name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
}

interface ScrapNote {
  id: string;
  scrap_number: string;
  date: string;
  notes: string;
  subtotal: number;
  total: number;
  created_at: string;
  items?: ScrapNoteItem[];
}

export default function ScrapNotes() {
  const [scrapNotes, setScrapNotes] = useState<ScrapNote[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScrapNotes();
  }, []);

  const fetchScrapNotes = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to view scrap notes");
        return;
      }

      const { data: notes, error: notesError } = await supabase
        .from("scrap_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (notesError) throw notesError;

      const notesWithItems = await Promise.all(
        (notes || []).map(async (note) => {
          const { data: items } = await supabase
            .from("scrap_note_items")
            .select("*")
            .eq("scrap_note_id", note.id);

          return { ...note, items: items || [] };
        })
      );

      setScrapNotes(notesWithItems);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch scrap notes");
    } finally {
      setLoading(false);
    }
  };

  const deleteScrapNote = async (id: string) => {
    try {
      const { error } = await supabase.from("scrap_notes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Scrap note deleted");
      fetchScrapNotes();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete scrap note");
    }
  };

  const handlePrint = (note: ScrapNote) => {
    const printContent = `
      <div style="padding: 40px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; color: #333;">SCRAP NOTE</h1>
          <p style="margin: 5px 0; color: #666;">${note.scrap_number}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Date:</strong> ${formatDate(new Date(note.date))}</p>
          ${note.notes ? `<p><strong>Notes:</strong> ${note.notes}</p>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Item</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Description</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Qty</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Unit</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Price</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(note.items || [])
              .map(
                (item) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.item_name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.description || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.unit}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.unit_price)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.amount)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: right;">
          <p style="font-size: 18px; margin: 10px 0;"><strong>Total: ${formatCurrency(note.total)}</strong></p>
        </div>
      </div>
    `;

    printDocument(printContent, `scrap-note-${note.scrap_number}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scrap Notes</h1>
          <p className="text-muted-foreground">Manage and track scrap items</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Scrap Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ScrapNoteForm onClose={() => setIsDialogOpen(false)} onSuccess={fetchScrapNotes} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading scrap notes...</p>
          </CardContent>
        </Card>
      ) : scrapNotes.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No scrap notes yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scrapNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{note.scrap_number}</CardTitle>
                    <CardDescription>
                      {formatDate(new Date(note.date))} • {note.items?.length || 0} items
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(note)}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteScrapNote(note.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {note.notes && (
                  <p className="text-sm text-muted-foreground mb-4">{note.notes}</p>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(note.items || []).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.item_name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.description || '-'}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <div className="text-right">
                    <p className="text-lg font-bold">Total: {formatCurrency(note.total)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ScrapNoteForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [scrapNumber, setScrapNumber] = useState(`SCR-${Date.now()}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ScrapNoteItem[]>([
    { item_name: "", description: "", quantity: 0, unit: "kg", unit_price: 0, amount: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setItems([...items, { item_name: "", description: "", quantity: 0, unit: "kg", unit_price: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ScrapNoteItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate amount
    if (field === "quantity" || field === "unit_price") {
      const qty = field === "quantity" ? parseFloat(value) || 0 : updated[index].quantity;
      const price = field === "unit_price" ? parseFloat(value) || 0 : updated[index].unit_price;
      updated[index].amount = qty * price;
    }
    
    setItems(updated);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSave = async () => {
    if (!scrapNumber.trim()) {
      toast.error("Scrap number is required");
      return;
    }

    if (items.length === 0 || items.every(item => !item.item_name.trim())) {
      toast.error("Add at least one item");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const validItems = items.filter(item => item.item_name.trim());
      const total = calculateTotal();

      const { data: scrapNote, error: noteError } = await supabase
        .from("scrap_notes")
        .insert({
          user_id: user.id,
          scrap_number: scrapNumber,
          date,
          notes,
          subtotal: total,
          total,
        })
        .select()
        .single();

      if (noteError) throw noteError;

      const itemsToInsert = validItems.map(item => ({
        scrap_note_id: scrapNote.id,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        amount: item.amount,
      }));

      const { error: itemsError } = await supabase.from("scrap_note_items").insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success("Scrap note created successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create scrap note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Scrap Note</DialogTitle>
        <DialogDescription>Add scrap items with their quantities and prices</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Scrap Number</Label>
            <Input value={scrapNumber} onChange={(e) => setScrapNumber(e.target.value)} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Notes (Optional)</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-3">
                    <Label className="text-xs">Item Title</Label>
                    <Input
                      value={item.item_name}
                      onChange={(e) => updateItem(index, "item_name", e.target.value)}
                      placeholder="e.g., Copper Wire"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">Unit</Label>
                    <Select value={item.unit} onValueChange={(val) => updateItem(index, "unit", val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="ton">ton</SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                        <SelectItem value="meter">meter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price || ""}
                      onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-right text-sm font-medium">
                  Amount: {formatCurrency(item.amount)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="text-right">
            <p className="text-2xl font-bold">Total: {formatCurrency(calculateTotal())}</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Scrap Note"}
        </Button>
      </DialogFooter>
    </>
  );
}

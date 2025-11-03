import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, Eye, Edit, Printer, TrendingUp } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { formatDateIN, formatINR } from "@/lib/format";
import { printElementById } from "@/lib/print";
import { ScrapNote as ScrapNoteType, ScrapNoteItem } from "@/types/inventory";
import React from "react";

const ScrapNote = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { scrapNotes } = useApp();

  const filteredNotes = useMemo(() =>
    scrapNotes.filter(note =>
      note.noteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), [scrapNotes, searchTerm]
  );

  const stats = useMemo(() => {
    const total = scrapNotes.length;
    const totalValue = scrapNotes.reduce((sum, note) => sum + note.totalValue, 0);
    const avgValue = total > 0 ? totalValue / total : 0;
    const draftCount = scrapNotes.filter(n => n.status === 'DRAFT').length;

    return { total, totalValue, avgValue, draftCount };
  }, [scrapNotes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scrap Notes</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage scrap materials and waste inventory.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Notes</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Value</p>
              <p className="text-2xl font-bold text-foreground">{formatINR(stats.totalValue)}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Value</p>
              <p className="text-2xl font-bold text-foreground">{formatINR(stats.avgValue)}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Draft Notes</p>
              <p className="text-2xl font-bold text-foreground">{stats.draftCount}</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by note number or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <CreateScrapNoteDialog />
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No scrap notes match your search." : "No scrap notes yet. Create your first one!"}
            </p>
            {!searchTerm && <CreateScrapNoteDialog />}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Note Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.noteNumber}</TableCell>
                    <TableCell>{note.title}</TableCell>
                    <TableCell>{note.items.length}</TableCell>
                    <TableCell className="font-semibold">{formatINR(note.totalValue)}</TableCell>
                    <TableCell>
                      <Badge variant={note.status === 'DRAFT' ? 'outline' : note.status === 'FINALIZED' ? 'default' : 'secondary'}>
                        {note.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateIN(note.date)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <ViewScrapNoteDialog note={note} />
                        <EditScrapNoteDialog note={note} />
                        <PrintScrapNoteButton note={note} />
                        <DeleteScrapNoteDialog noteId={note.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

const CreateScrapNoteDialog = () => {
  const { addScrapNote } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ScrapNoteItem[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const addItem = () => {
    setItems([...items, {
      id: crypto.randomUUID(),
      itemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index] = { ...newItems[index], [field]: value };
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const totalValue = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = () => {
    if (!title.trim() || items.length === 0) return;

    addScrapNote({
      title,
      description,
      items,
      status: 'DRAFT',
      totalValue,
      date: new Date(date),
    });

    setTitle("");
    setDescription("");
    setItems([]);
    setDate(new Date().toISOString().split('T')[0]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Scrap Note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Scrap Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Monthly Scrap Collection"
              />
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Scrap Items</h3>
              <Button onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No items added yet</p>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                    <Input
                      placeholder="Item name"
                      value={item.itemName}
                      onChange={(e) => updateItem(idx, 'itemName', e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{formatINR(item.total)}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-end">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Total Value:</p>
                    <p className="text-2xl font-bold">{formatINR(totalValue)}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || items.length === 0}>
            Create Scrap Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ViewScrapNoteDialog = ({ note }: { note: ScrapNoteType }) => {
  const { businessInfo } = useApp();
  const [open, setOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      printElementById(`scrap-print-${note.id}`, `Scrap Note ${note.noteNumber}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scrap Note - {note.noteNumber}</DialogTitle>
        </DialogHeader>

        <div id={`scrap-print-${note.id}`} ref={printRef} className="space-y-6">
          <div className="border rounded-lg p-6 bg-white dark:bg-slate-950">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {businessInfo.logo && (
                  <img src={businessInfo.logo} alt="Logo" className="h-16 w-auto" />
                )}
                <div>
                  <h2 className="text-2xl font-bold">{businessInfo.name}</h2>
                  <p className="text-sm text-muted-foreground">{businessInfo.address}</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold">SCRAP NOTE</h3>
                <p className="text-sm text-muted-foreground">{note.noteNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Note Date</p>
                <p className="text-base">{formatDateIN(note.date)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Status</p>
                <p className="text-base"><Badge>{note.status}</Badge></p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Total Value</p>
                <p className="text-base font-bold">{formatINR(note.totalValue)}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Title</h4>
              <p className="text-base">{note.title}</p>
            </div>

            {note.description && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-base whitespace-pre-wrap">{note.description}</p>
              </div>
            )}

            <div className="mb-6">
              <h4 className="font-semibold mb-3">Scrap Items</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Item Name</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {note.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.itemName}</td>
                      <td className="py-2 text-muted-foreground">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatINR(item.unitPrice)}</td>
                      <td className="text-right py-2 font-semibold">{formatINR(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 border-t-2 border-black">
                  <span className="font-bold">TOTAL VALUE:</span>
                  <span className="font-bold text-lg">{formatINR(note.totalValue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditScrapNoteDialog = ({ note }: { note: ScrapNoteType }) => {
  const { updateScrapNote } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [description, setDescription] = useState(note.description);
  const [items, setItems] = useState<ScrapNoteItem[]>(note.items);
  const [date, setDate] = useState(note.date instanceof Date ? note.date.toISOString().split('T')[0] : new Date(note.date).toISOString().split('T')[0]);
  const [status, setStatus] = useState(note.status);

  const addItem = () => {
    setItems([...items, {
      id: crypto.randomUUID(),
      itemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index] = { ...newItems[index], [field]: value };
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const totalValue = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = () => {
    if (!title.trim() || items.length === 0) return;

    updateScrapNote(note.id, {
      title,
      description,
      items,
      status,
      totalValue,
      date: new Date(date),
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Scrap Note - {note.noteNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Monthly Scrap Collection"
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="FINALIZED">Finalized</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Scrap Items</h3>
              <Button onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                  <Input
                    placeholder="Item name"
                    value={item.itemName}
                    onChange={(e) => updateItem(idx, 'itemName', e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                  <Input
                    type="number"
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{formatINR(item.total)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-end">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Total Value:</p>
                    <p className="text-2xl font-bold">{formatINR(totalValue)}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || items.length === 0}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PrintScrapNoteButton = ({ note }: { note: ScrapNoteType }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => printElementById(`scrap-print-${note.id}`, `Scrap Note ${note.noteNumber}`)}
    >
      <Printer className="w-4 h-4" />
    </Button>
  );
};

const DeleteScrapNoteDialog = ({ noteId }: { noteId: string }) => {
  const { removeScrapNote } = useApp();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    removeScrapNote(noteId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Scrap Note?</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">This action cannot be undone.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScrapNote;

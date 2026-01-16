import { useMemo, useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Package, Eye, Edit, Minus, PlusCircle, Trash2 } from "lucide-react";
import { useData } from "@/store/SupabaseDataContext";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";

const Inventory = () => {
  const { inventoryItems: items, transactions, transactItem, removeItem, addItem } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 150);

  const filteredItems = useMemo(() =>
    items.filter(item =>
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [items, debouncedSearch]
  );

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock <= minStock) return "low";
    if (currentStock <= minStock * 1.5) return "medium";
    return "good";
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case "low":
        return <Badge variant="destructive">Low Stock</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Medium Stock</Badge>;
      default:
        return <Badge className="bg-success text-success-foreground">Good Stock</Badge>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm">
            Manage your stock levels and track inventory movements.
          </p>
        </div>
        <CreateItemDialog>
          <Button className="gap-2 bg-primary hover:bg-primary-hover w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Add New Item
          </Button>
        </CreateItemDialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search items by name, description, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-border"
        />
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item.currentStock, item.minStock);
          return (
            <Card key={item.id} className="p-5 border border-border hover:shadow-[var(--shadow-medium)] transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-primary-light rounded-md shrink-0">
                  <Package className="w-4 h-4 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                    </div>
                    <div className="shrink-0">
                      {getStockBadge(stockStatus)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Stock</div>
                      <div className="text-sm font-medium text-foreground">{item.currentStock} {item.unit}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Price</div>
                      <div className="text-sm font-medium text-foreground">{formatINR(item.unitPrice)}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <ItemViewDialog itemId={item.id}>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </ItemViewDialog>
                    <ItemTransactDialog itemId={item.id} type="OUT">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Minus className="w-4 h-4" />
                      </Button>
                    </ItemTransactDialog>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => {
                      if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                        removeItem(item.id);
                      }
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-16 text-center border border-border">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first inventory item"}
          </p>
          <CreateItemDialog>
            <Button className="gap-2 bg-primary hover:bg-primary-hover">
              <Plus className="w-4 h-4" />
              Add New Item
            </Button>
          </CreateItemDialog>
        </Card>
      )}
    </div>
  );
};

function ItemViewDialog({ itemId, children }: { itemId: string; children: React.ReactNode }) {
  const { inventoryItems: items, transactions, suppliers, updateItem } = useData();
  const item = items.find(i => i.id === itemId)!;
  const itemTx = transactions.filter(t => t.itemId === itemId);
  const supplier = item.supplier ? suppliers.find(s => s.id === item.supplier) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: item.name,
    description: item.description,
    category: item.category,
    sku: item.sku,
    itemCode: item.itemCode || '',
    make: item.make || '',
    mpn: item.mpn || '',
    unitPrice: item.unitPrice,
    unit: item.unit,
    minStock: item.minStock,
  });

  // Reset form when item changes or edit mode toggles
  const handleEditClick = () => {
    setEditForm({
      name: item.name,
      description: item.description,
      category: item.category,
      sku: item.sku,
      itemCode: item.itemCode || '',
      make: item.make || '',
      mpn: item.mpn || '',
      unitPrice: item.unitPrice,
      unit: item.unit,
      minStock: item.minStock,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      toast({ title: "Error", description: "Item name is required", variant: "destructive" as any });
      return;
    }
    try {
      await updateItem(item.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        sku: editForm.sku.trim(),
        itemCode: editForm.itemCode.trim() || undefined,
        make: editForm.make.trim() || undefined,
        mpn: editForm.mpn.trim() || undefined,
        unitPrice: Number(editForm.unitPrice) || 0,
        unit: editForm.unit.trim(),
        minStock: Number(editForm.minStock) || 0,
      });
      toast({ title: "Success", description: "Item updated successfully" });
      setIsEditing(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update item", variant: "destructive" as any });
    }
  };

  // Calculate stats
  const totalIn = itemTx.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0);
  const totalOut = itemTx.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.quantity, 0);
  const stockValue = item.currentStock * item.unitPrice;
  const stockStatus = item.currentStock <= item.minStock ? 'low' : item.currentStock <= item.minStock * 1.5 ? 'medium' : 'good';

  return (
    <Dialog onOpenChange={(open) => !open && setIsEditing(false)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-semibold h-auto py-1"
                  placeholder="Item name"
                />
              ) : (
                <h2 className="text-xl font-semibold text-foreground">{item.name}</h2>
              )}
              {isEditing ? (
                <Input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="text-sm mt-1"
                  placeholder="Description"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5">{item.description || 'No description'}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {isEditing ? (
                  <Input
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="text-xs w-32"
                    placeholder="Category"
                  />
                ) : (
                  <Badge variant="secondary" className="text-xs">{item.category || 'Uncategorized'}</Badge>
                )}
                {!isEditing && stockStatus === 'low' && <Badge variant="destructive" className="text-xs">Low Stock</Badge>}
                {!isEditing && stockStatus === 'medium' && <Badge className="bg-warning text-warning-foreground text-xs">Medium Stock</Badge>}
                {!isEditing && stockStatus === 'good' && <Badge className="bg-success text-success-foreground text-xs">In Stock</Badge>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleEditClick} className="gap-1">
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats - View only */}
        {!isEditing && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{item.currentStock}</div>
              <div className="text-xs text-muted-foreground mt-1">Current Stock ({item.unit})</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatINR(stockValue)}</div>
              <div className="text-xs text-muted-foreground mt-1">Stock Value</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalIn}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Received</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalOut}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Used</div>
            </div>
          </div>
        )}

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t">
          {/* Left Column - Item Codes */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Item Codes & Identifiers
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">HSN Code</div>
                {isEditing ? (
                  <Input
                    value={editForm.sku}
                    onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                    className="h-7 text-sm font-mono"
                    placeholder="HSN Code"
                  />
                ) : (
                  <div className="font-medium font-mono">{item.sku || '-'}</div>
                )}
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Item Code</div>
                {isEditing ? (
                  <Input
                    value={editForm.itemCode}
                    onChange={(e) => setEditForm({ ...editForm, itemCode: e.target.value })}
                    className="h-7 text-sm font-mono"
                    placeholder="Item Code"
                  />
                ) : (
                  <div className="font-medium font-mono">{item.itemCode || '-'}</div>
                )}
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Make</div>
                {isEditing ? (
                  <Input
                    value={editForm.make}
                    onChange={(e) => setEditForm({ ...editForm, make: e.target.value })}
                    className="h-7 text-sm"
                    placeholder="Make"
                  />
                ) : (
                  <div className="font-medium">{item.make || '-'}</div>
                )}
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">MPN</div>
                {isEditing ? (
                  <Input
                    value={editForm.mpn}
                    onChange={(e) => setEditForm({ ...editForm, mpn: e.target.value })}
                    className="h-7 text-sm font-mono"
                    placeholder="MPN"
                  />
                ) : (
                  <div className="font-medium font-mono">{item.mpn || '-'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stock & Pricing */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Stock & Pricing
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Unit Price</div>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.unitPrice}
                    onChange={(e) => setEditForm({ ...editForm, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="h-7 text-sm"
                  />
                ) : (
                  <div className="font-medium text-primary">{formatINR(item.unitPrice)}</div>
                )}
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Unit</div>
                {isEditing ? (
                  <Input
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    className="h-7 text-sm"
                    placeholder="pcs, kg, etc."
                  />
                ) : (
                  <div className="font-medium">{item.unit}</div>
                )}
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Min Stock Level</div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editForm.minStock}
                    onChange={(e) => setEditForm({ ...editForm, minStock: parseFloat(e.target.value) || 0 })}
                    className="h-7 text-sm"
                  />
                ) : (
                  <div className="font-medium">{item.minStock} {item.unit}</div>
                )}
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Supplier</div>
                <div className="font-medium truncate" title={supplier?.name || '-'}>{supplier?.name || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Info - View only */}
        {!isEditing && (
          <div className="flex items-center gap-6 py-3 px-4 rounded-md bg-muted/30 text-xs text-muted-foreground border-t">
            <div>
              <span className="font-medium">Created:</span> {item.createdAt.toLocaleDateString('en-IN')}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {item.updatedAt.toLocaleDateString('en-IN')}
            </div>
            <div>
              <span className="font-medium">Transactions:</span> {itemTx.length}
            </div>
          </div>
        )}

        {/* Transactions Table - View only */}
        {!isEditing && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Transaction History
            </h4>
            <div className="rounded-md border max-h-48 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Qty</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Reference</TableHead>
                    <TableHead className="text-xs">Batch/Lot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemTx.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  )}
                  {itemTx.slice(0, 10).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs">{new Date(t.date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <Badge variant={t.type === 'IN' ? 'default' : 'secondary'} className="text-xs">
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{t.quantity}</TableCell>
                      <TableCell className="text-xs">{t.reason}</TableCell>
                      <TableCell className="text-xs font-mono">{t.reference || '-'}</TableCell>
                      <TableCell className="text-xs font-mono">{t.batchNumber || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {itemTx.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Showing 10 of {itemTx.length} transactions
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ItemTransactDialog({ itemId, type, children }: { itemId: string; type: 'IN' | 'OUT'; children: React.ReactNode }) {
  const { inventoryItems: items, transactItem, transactions } = useData();
  const item = items.find(i => i.id === itemId)!;
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(item.unitPrice);
  const [reason, setReason] = useState(type === 'IN' ? 'Purchase' : 'Usage');
  const [reference, setReference] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  // Auto-generate batch number when dialog opens for IN transactions
  const generateBatchNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `LOT-${year}${month}-`;
    
    // Find highest existing batch number with same prefix
    const existingBatches = transactions
      .filter(t => t.batchNumber?.startsWith(prefix))
      .map(t => {
        const num = parseInt(t.batchNumber?.split('-').pop() || '0', 10);
        return isNaN(num) ? 0 : num;
      });
    
    const nextNum = existingBatches.length > 0 ? Math.max(...existingBatches) + 1 : 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  };

  // Generate batch number when dialog opens for IN type
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && type === 'IN') {
      setBatchNumber(generateBatchNumber());
    }
  };

  const onSubmit = () => {
    if (quantity <= 0) return;
    if (type === 'OUT' && quantity > item.currentStock) {
      toast({ title: 'Insufficient stock', description: 'Quantity exceeds available stock.', variant: 'destructive' as any });
      return;
    }
    transactItem(itemId, type, quantity, reason, reference || undefined, type === 'IN' ? unitPrice : undefined, batchNumber || undefined);
    toast({ title: 'Transaction recorded', description: `${type === 'IN' ? 'Added' : 'Used'} ${quantity} ${item.unit}.` });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{type === 'IN' ? 'Add Stock' : 'Use Stock'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-muted-foreground">Item</div>
              <div className="font-medium">{item.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Available</div>
              <div className="font-medium">{item.currentStock} {item.unit}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm mb-1">Quantity</div>
              <Input type="number" step="0.01" value={quantity} min={0} onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)} />
            </div>
            {type === 'IN' && (
              <div>
                <div className="text-sm mb-1">Unit Price</div>
                <Input type="number" step="0.01" value={unitPrice} min={0} onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)} />
              </div>
            )}
          </div>

          <div>
            <div className="text-sm mb-1">Reason</div>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm mb-1">Reference (optional)</div>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="PO/GR number, etc." />
            </div>
            {type === 'IN' && (
              <div>
                <div className="text-sm mb-1">Batch/Lot No.</div>
                <Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="Auto-generated" />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit}>{type === 'IN' ? <><PlusCircle className="w-4 h-4 mr-1" /> Add</> : <> <Minus className="w-4 h-4 mr-1" /> Use</>}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateItemDialog({ children }: { children: React.ReactNode }) {
  const { addItem } = useData();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    hsnCode: "",
    itemCode: "",
    make: "",
    mpn: "",
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitPrice: 0,
    unit: "pcs"
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.category) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" as any });
      return;
    }

    const item = {
      id: Date.now().toString(),
      ...formData,
      sku: formData.hsnCode || "", // Use HSN code as SKU
      itemCode: formData.itemCode || undefined,
      make: formData.make || undefined,
      mpn: formData.mpn || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addItem(item);
    toast({ title: "Success", description: "Item added successfully!" });
    setFormData({ name: "", description: "", category: "", hsnCode: "", itemCode: "", make: "", mpn: "", currentStock: 0, minStock: 0, maxStock: 0, unitPrice: 0, unit: "pcs" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input 
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Input 
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter item description"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Input 
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Enter category"
                required
              />
            </div>
            <div>
              <Label htmlFor="hsnCode">HSN Code</Label>
              <Input 
                id="hsnCode"
                value={formData.hsnCode}
                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                placeholder="e.g., 8471"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="itemCode">Item Code</Label>
              <Input 
                id="itemCode"
                value={formData.itemCode}
                onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="make">Make</Label>
              <Input 
                id="make"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="Manufacturer"
              />
            </div>
            <div>
              <Label htmlFor="mpn">MPN</Label>
              <Input 
                id="mpn"
                value={formData.mpn}
                onChange={(e) => setFormData({ ...formData, mpn: e.target.value })}
                placeholder="Part Number"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input 
                id="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">Pieces</SelectItem>
                  <SelectItem value="kg">Kilograms</SelectItem>
                  <SelectItem value="ltr">Liters</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStock">Min Stock</Label>
              <Input 
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="maxStock">Max Stock</Label>
              <Input 
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="unitPrice">Unit Price</Label>
            <Input 
              id="unitPrice"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              min="0"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default Inventory;

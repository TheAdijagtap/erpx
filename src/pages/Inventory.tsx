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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage your stock levels and track inventory movements.
          </p>
        </div>
        <CreateItemDialog>
          <Button className="gap-2 bg-primary hover:bg-primary-hover">
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

                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Stock</div>
                    <div className="text-sm font-medium text-foreground">{item.currentStock} {item.unit}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Price</div>
                    <div className="text-sm font-medium text-foreground">{formatINR(item.unitPrice)}</div>
                  </div>

                  <div>
                    {getStockBadge(stockStatus)}
                  </div>

                  <div className="flex gap-2 shrink-0">
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
  const { inventoryItems: items, transactions } = useData();
  const item = items.find(i => i.id === itemId)!;
  const itemTx = transactions.filter(t => t.itemId === itemId);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Item Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3 text-sm">
            {/* Row 1: Name & Category */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <div className="text-muted-foreground text-xs">Name</div>
                <div className="font-medium">{item.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Category</div>
                <div className="font-medium">{item.category}</div>
              </div>
            </div>
            
            {/* Row 2: HSN Code (full width) */}
            {item.sku && (
              <div>
                <div className="text-muted-foreground text-xs">HSN Code</div>
                <div className="font-medium">{item.sku}</div>
              </div>
            )}
            
            {/* Row 3: Item Code, Make, MPN - fixed 3-column grid */}
            {(item.itemCode || item.make || item.mpn) && (
              <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                <div>
                  <div className="text-muted-foreground text-xs">Item Code</div>
                  <div className="font-medium">{item.itemCode || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Make</div>
                  <div className="font-medium">{item.make || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">MPN</div>
                  <div className="font-medium">{item.mpn || '-'}</div>
                </div>
              </div>
            )}
            
            {/* Row 4: Description (full width) */}
            <div>
              <div className="text-muted-foreground text-xs">Description</div>
              <div className="font-medium">{item.description || '-'}</div>
            </div>
            
            {/* Row 5: Unit Price & Unit */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <div className="text-muted-foreground text-xs">Unit Price</div>
                <div className="font-medium">{formatINR(item.unitPrice)}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Unit</div>
                <div className="font-medium">{item.unit}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Transactions</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Batch/Lot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemTx.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No transactions yet.</TableCell>
                    </TableRow>
                  )}
                  {itemTx.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell>{t.quantity}</TableCell>
                      <TableCell>{t.reason}</TableCell>
                      <TableCell>{t.reference || '-'}</TableCell>
                      <TableCell>{t.batchNumber || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
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

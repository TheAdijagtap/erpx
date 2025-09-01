import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Package, Eye, Edit, Minus, PlusCircle, Trash2 } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/format";

const Inventory = () => {
  const { items, transactions, transactItem } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() =>
    items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    ), [items, searchTerm]
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
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your stock levels and track inventory movements.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search items by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item.currentStock, item.minStock);
          const itemTransactions = transactions.filter(t => t.itemId === item.id).slice(0, 5);
          return (
            <Card key={item.id} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.sku}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                  </div>
                  <div className="p-2 bg-primary-light rounded-lg">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Stock:</span>
                    <span className="font-bold text-lg">
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Min: {item.minStock}</span>
                    <span>Max: {item.maxStock}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Unit Price:</span>
                    <span className="font-semibold">{formatINR(item.unitPrice)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {getStockBadge(stockStatus)}
                  <span className="text-sm text-muted-foreground">
                    Value: {formatINR(item.currentStock * item.unitPrice)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <ItemViewDialog itemId={item.id}>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Eye className="w-4 h-4" /> View
                    </Button>
                  </ItemViewDialog>
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Edit className="w-4 h-4" /> Edit
                  </Button>
                  <ItemTransactDialog itemId={item.id} type="OUT">
                    <Button variant="accent" size="sm" className="flex-1 gap-1">
                      <Minus className="w-4 h-4" /> Use
                    </Button>
                  </ItemTransactDialog>
                </div>

                {itemTransactions.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Recent activity</p>
                    <div className="flex gap-2 flex-wrap">
                      {itemTransactions.map((t) => (
                        <Badge key={t.id} variant="secondary">
                          {t.type === 'IN' ? '+' : '-'}{t.quantity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first inventory item"}
          </p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Item
          </Button>
        </Card>
      )}
    </div>
  );
};

function ItemViewDialog({ itemId, children }: { itemId: string; children: React.ReactNode }) {
  const { items, transactions } = useApp();
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
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Name</div>
              <div className="font-medium">{item.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">SKU</div>
              <div className="font-medium">{item.sku}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Category</div>
              <div className="font-medium">{item.category}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Unit Price</div>
              <div className="font-medium">{formatINR(item.unitPrice)}</div>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemTx.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No transactions yet.</TableCell>
                    </TableRow>
                  )}
                  {itemTx.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell>{t.quantity}</TableCell>
                      <TableCell>{t.reason}</TableCell>
                      <TableCell>{t.reference || '-'}</TableCell>
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
  const { items, transactItem } = useApp();
  const item = items.find(i => i.id === itemId)!;
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(item.unitPrice);
  const [reason, setReason] = useState(type === 'IN' ? 'Purchase' : 'Usage');
  const [reference, setReference] = useState("");

  const onSubmit = () => {
    if (quantity <= 0) return;
    if (type === 'OUT' && quantity > item.currentStock) {
      toast({ title: 'Insufficient stock', description: 'Quantity exceeds available stock.', variant: 'destructive' as any });
      return;
    }
    transactItem(itemId, type, quantity, reason, reference || undefined, type === 'IN' ? unitPrice : undefined);
    toast({ title: 'Transaction recorded', description: `${type === 'IN' ? 'Added' : 'Used'} ${quantity} ${item.unit}.` });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Input type="number" value={quantity} min={1} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} />
            </div>
            {type === 'IN' && (
              <div>
                <div className="text-sm mb-1">Unit Price</div>
                <Input type="number" value={unitPrice} min={0} onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)} />
              </div>
            )}
          </div>

          <div>
            <div className="text-sm mb-1">Reason</div>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          <div>
            <div className="text-sm mb-1">Reference (optional)</div>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="PO/GR number, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit}>{type === 'IN' ? <><PlusCircle className="w-4 h-4 mr-1" /> Add</> : <> <Minus className="w-4 h-4 mr-1" /> Use</>}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Inventory;

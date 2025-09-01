import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Eye, Edit, Printer, Trash2 } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { formatDateIN, formatINR } from "@/lib/format";
import { printElementById } from "@/lib/print";
import { numberToWords } from "@/lib/numberToWords";

const PurchaseOrders = () => {
  const { purchaseOrders } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = useMemo(() => purchaseOrders.filter(order =>
    order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [purchaseOrders, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage purchase orders for your suppliers.
          </p>
        </div>
        <CreatePODialog />
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by PO number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{order.poNumber}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supplier: {order.supplier.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {formatDateIN(order.date)}
                  </p>
                </div>
                <div className="p-2 bg-primary-light rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items</p>
                  <p className="text-lg font-semibold">{order.items.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                  <p className="text-lg font-semibold">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold">{formatINR(order.total)}</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="float-right font-medium">{formatINR(order.subtotal)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SGST:</span>
                    <span className="float-right font-medium">{formatINR(order.sgst)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CGST:</span>
                    <span className="float-right font-medium">{formatINR(order.cgst)}</span>
                  </div>
                  <div className="font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="float-right">{formatINR(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <ViewPODialog id={order.id} />
                <EditPODialog id={order.id} />
                <PrintPOButton id={order.id} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No purchase orders found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Create your first purchase order to get started"}
          </p>
          <CreatePODialog />
        </Card>
      )}
    </div>
  );
};

function getStatusBadge(status: string) {
  switch (status) {
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "SENT":
      return <Badge className="bg-warning text-warning-foreground">Sent</Badge>;
    case "RECEIVED":
      return <Badge className="bg-success text-success-foreground">Received</Badge>;
    case "PARTIAL":
      return <Badge className="bg-accent text-accent-foreground">Partial</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function CreatePODialog() {
  const { suppliers, items, addPurchaseOrder, gstSettings } = useApp();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string | null>(suppliers[0]?.id || null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [applyGST, setApplyGST] = useState<boolean>(gstSettings.enabled);
  const [rows, setRows] = useState<Array<{ itemId: string; quantity: number; unitPrice: number }>>([
    { itemId: items[0]?.id || "", quantity: 1, unitPrice: items[0]?.unitPrice || 0 },
  ]);

  const onAddRow = () => setRows([...rows, { itemId: items[0]?.id || "", quantity: 1, unitPrice: items[0]?.unitPrice || 0 }]);
  const onSubmit = () => {
    if (!supplierId || rows.some(r => !r.itemId || r.quantity <= 0)) return;
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(Math.random()*900+100)}`;
    const poItems = rows.map((r) => ({
      id: crypto.randomUUID(),
      itemId: r.itemId,
      item: items.find(i => i.id === r.itemId)!,
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      total: r.quantity * r.unitPrice,
    }));
    addPurchaseOrder({
      poNumber,
      supplierId,
      supplier: suppliers.find(s => s.id === supplierId)!,
      items: poItems,
      status: "SENT",
      date: new Date(date),
      notes: "",
      expectedDelivery: undefined,
      applyGST,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create New PO
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="mb-1">Supplier</div>
              <Select value={supplierId || undefined} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent className="z-50">
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-1">Date</div>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <input id="applyGST" type="checkbox" checked={applyGST} onChange={(e) => setApplyGST(e.target.checked)} />
              <label htmlFor="applyGST">Apply GST (SGST/CGST)</label>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="min-w-[220px]">
                      <Select value={row.itemId} onValueChange={(v) => {
                        const it = items.find(i => i.id === v)!;
                        const next = [...rows];
                        next[idx] = { ...row, itemId: v, unitPrice: it.unitPrice };
                        setRows(next);
                      }}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select item" /></SelectTrigger>
                        <SelectContent className="z-50 max-h-64">
                          {items.map((i) => (
                            <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={1} value={row.quantity} onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, quantity: parseInt(e.target.value) || 0 };
                        setRows(next);
                      }} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} value={row.unitPrice} onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, unitPrice: parseInt(e.target.value) || 0 };
                        setRows(next);
                      }} />
                    </TableCell>
                    <TableCell className="font-medium">{formatINR(row.quantity * row.unitPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button variant="outline" className="gap-2" onClick={onAddRow}><Plus className="w-4 h-4" /> Add Item</Button>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewPODialog({ id }: { id: string }) {
  const { purchaseOrders, businessInfo, gstSettings } = useApp();
  const order = purchaseOrders.find(p => p.id === id)!;
  const elId = `po-print-${id}`;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1"><Eye className="w-4 h-4" /> View</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Purchase Order</DialogTitle>
        </DialogHeader>
        <div id={elId}>
          <div className="section">
            <div className="header">
              {businessInfo.logo && <img src={businessInfo.logo} alt="Logo" />}
              <div>
                <div className="brand">{businessInfo.name}</div>
                <div className="muted">{businessInfo.address}</div>
                <div className="muted">{businessInfo.email} · {businessInfo.phone}</div>
                {businessInfo.gstNumber && <div className="muted">GST: {businessInfo.gstNumber}</div>}
              </div>
            </div>
          </div>
          
          <div className="section">
            <h2>Purchase Order {order.poNumber}</h2>
          </div>
          
          <div className="section">
            <div className="grid">
              <div>
                <strong>Supplier Details</strong>
                <div>{order.supplier.name}</div>
                <div className="muted">{order.supplier.address}</div>
                <div className="muted">{order.supplier.email} · {order.supplier.phone}</div>
                {order.supplier.gstNumber && <div className="muted">GST: {order.supplier.gstNumber}</div>}
              </div>
              <div>
                <strong>Order Details</strong>
                <div>Date: {formatDateIN(order.date)}</div>
                <div>Status: {order.status}</div>
                <div>GST: {order.sgst + order.cgst > 0 ? `${gstSettings.sgstRate + gstSettings.cgstRate}%` : 'Not Applied'}</div>
              </div>
            </div>
          </div>
          
          <div className="section">
            <table>
              <thead>
                <tr><th>#</th><th>Item</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Total</th></tr>
              </thead>
              <tbody>
                {order.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td>{idx + 1}</td>
                    <td>{it.item.name}</td>
                    <td>{it.quantity}</td>
                    <td>{it.item.unit}</td>
                    <td>{formatINR(it.unitPrice)}</td>
                    <td>{formatINR(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="section">
            <table className="totals">
              <tbody>
                <tr><td className="label">Subtotal</td><td className="value">{formatINR(order.subtotal)}</td></tr>
                <tr><td className="label">SGST</td><td className="value">{formatINR(order.sgst)}</td></tr>
                <tr><td className="label">CGST</td><td className="value">{formatINR(order.cgst)}</td></tr>
                <tr><td className="label"><strong>Total Amount</strong></td><td className="value"><strong>{formatINR(order.total)}</strong></td></tr>
              </tbody>
            </table>
            <div className="amount-words">
              Amount in Words: {numberToWords(order.total)}
            </div>
          </div>
          
          <div className="section terms">
            <strong>Terms & Conditions:</strong>
            <div className="muted" style={{ marginTop: '8px', lineHeight: '1.4' }}>
              1. Payment terms: 30 days from invoice date<br />
              2. All disputes subject to local jurisdiction<br />
              3. Goods once sold will not be taken back<br />
              4. Late payment may attract penalty charges<br />
              5. All rates are inclusive of applicable taxes
            </div>
          </div>
          
          {businessInfo.signature && (
            <div className="signature-section">
              <div>Authorized Signatory</div>
              <img src={businessInfo.signature} alt="Authorized Signature" className="signature-image" style={{ marginTop: '8px' }} />
              <div className="muted">{businessInfo.name}</div>
            </div>
          )}
          
          {order.notes && <div className="footer">Notes: {order.notes}</div>}
        </div>
        <DialogFooter>
          <Button onClick={() => printElementById(elId, `PO ${order.poNumber}`)} className="gap-1"><Printer className="w-4 h-4" /> Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditPODialog({ id }: { id: string }) {
  const { purchaseOrders, updatePurchaseOrder } = useApp();
  const order = purchaseOrders.find(p => p.id === id)!;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || "");

  const onSave = () => { updatePurchaseOrder(id, { status, notes }); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1"><Edit className="w-4 h-4" /> Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit PO</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <div className="mb-1">Status</div>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="z-50">
                {['DRAFT','SENT','RECEIVED','PARTIAL','CANCELLED'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="mb-1">Notes</div>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PrintPOButton({ id }: { id: string }) {
  const elId = `po-print-${id}`;
  return (
    <Button variant="outline" size="sm" className="gap-1" onClick={() => printElementById(elId)}>
      <Printer className="w-4 h-4" /> Print/PDF
    </Button>
  );
}

export default PurchaseOrders;

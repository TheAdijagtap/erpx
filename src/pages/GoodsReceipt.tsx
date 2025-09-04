import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Package, Eye, Edit, Printer, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { formatDateIN, formatINR } from "@/lib/format";
import { printElementById } from "@/lib/print";

const GoodsReceiptPage = () => {
  const { goodsReceipts } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReceipts = useMemo(() => goodsReceipts.filter(receipt =>
    receipt.grNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [goodsReceipts, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goods Receipt</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage incoming goods from suppliers.
          </p>
        </div>
        <CreateGRDialog />
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by GR number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReceipts.map((receipt) => (
          <Card key={receipt.id} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{receipt.grNumber}</h3>
                    {getStatusBadge(receipt.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supplier: {receipt.supplier.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {formatDateIN(receipt.date)}
                  </p>
                </div>
                <div className="p-2 bg-primary-light rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items</p>
                  <p className="text-lg font-semibold">{receipt.items.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Received Qty</p>
                  <p className="text-lg font-semibold">
                    {receipt.items.reduce((sum, item) => sum + item.receivedQuantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ordered Qty</p>
                  <p className="text-lg font-semibold">
                    {receipt.items.reduce((sum, item) => sum + (item.orderedQuantity || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold">{formatINR(receipt.total)}</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="float-right font-medium">{formatINR(receipt.subtotal)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SGST:</span>
                    <span className="float-right font-medium">{formatINR(receipt.sgst)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CGST:</span>
                    <span className="float-right font-medium">{formatINR(receipt.cgst)}</span>
                  </div>
                  <div className="font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="float-right">{formatINR(receipt.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <ViewGRDialog id={receipt.id} />
                <EditGRDialog id={receipt.id} />
                <PrintGRButton id={receipt.id} />
                <DeleteGRDialog id={receipt.id} />
                {receipt.status === 'QUALITY_CHECK' && (
                  <>
                    <UpdateStatusButton id={receipt.id} status="ACCEPTED" label="Accept" />
                    <UpdateStatusButton id={receipt.id} status="REJECTED" label="Reject" destructive />
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredReceipts.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No goods receipts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Create your first goods receipt to get started"}
          </p>
          <CreateGRDialog />
        </Card>
      )}
    </div>
  );
};

function getStatusBadge(status: string) {
  switch (status) {
    case "RECEIVED":
      return <Badge className="bg-warning text-warning-foreground">Received</Badge>;
    case "QUALITY_CHECK":
      return <Badge className="bg-accent text-accent-foreground">Quality Check</Badge>;
    case "ACCEPTED":
      return <Badge className="bg-success text-success-foreground">Accepted</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function CreateGRDialog() {
  const { suppliers, items, addGoodsReceipt, gstSettings } = useApp();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string | null>(suppliers[0]?.id || null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [applyGST, setApplyGST] = useState<boolean>(gstSettings.enabled);
  const [rows, setRows] = useState<Array<{ itemId: string; receivedQuantity: number; unitPrice: number; orderedQuantity?: number }>>([
    { itemId: items[0]?.id || "", receivedQuantity: 1, unitPrice: items[0]?.unitPrice || 0 },
  ]);
  const [additionalCharges, setAdditionalCharges] = useState<Array<{ name: string; amount: number }>>([]);

  const onAddRow = () => setRows([...rows, { itemId: items[0]?.id || "", receivedQuantity: 1, unitPrice: items[0]?.unitPrice || 0 }]);
  const onSubmit = () => {
    if (!supplierId || rows.some(r => !r.itemId || r.receivedQuantity <= 0)) return;
    const grNumber = `GR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*999)+1).padStart(3, '0')}`;
    const grItems = rows.map((r) => ({
      id: crypto.randomUUID(),
      itemId: r.itemId,
      item: items.find(i => i.id === r.itemId)!,
      orderedQuantity: r.orderedQuantity,
      receivedQuantity: r.receivedQuantity,
      unitPrice: r.unitPrice,
      total: r.receivedQuantity * r.unitPrice,
    }));
    addGoodsReceipt({
      grNumber,
      supplierId,
      supplier: suppliers.find(s => s.id === supplierId)!,
      items: grItems,
      additionalCharges: additionalCharges.map(charge => ({
        id: crypto.randomUUID(),
        name: charge.name,
        amount: charge.amount,
      })),
      status: "QUALITY_CHECK",
      date: new Date(date),
      notes: "",
      poId: undefined,
      applyGST,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create New GR
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Goods Receipt</DialogTitle>
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
              <input id="applyGSTgr" type="checkbox" checked={applyGST} onChange={(e) => setApplyGST(e.target.checked)} />
              <label htmlFor="applyGSTgr">Apply GST (SGST/CGST)</label>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Ordered Qty</TableHead>
                  <TableHead>Received Qty</TableHead>
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
                      <Input type="number" min={0} value={row.orderedQuantity || 0} onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, orderedQuantity: parseInt(e.target.value) || 0 };
                        setRows(next);
                      }} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={1} value={row.receivedQuantity} onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, receivedQuantity: parseInt(e.target.value) || 0 };
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
                    <TableCell className="font-medium">{formatINR((row.receivedQuantity) * row.unitPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button variant="outline" className="gap-2" onClick={onAddRow}><Plus className="w-4 h-4" /> Add Item</Button>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Additional Charges</h4>
            <div className="space-y-2">
              {additionalCharges.map((charge, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="Charge name (e.g., Freight)"
                    value={charge.name}
                    onChange={(e) => {
                      const next = [...additionalCharges];
                      next[idx] = { ...charge, name: e.target.value };
                      setAdditionalCharges(next);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={charge.amount}
                    onChange={(e) => {
                      const next = [...additionalCharges];
                      next[idx] = { ...charge, amount: parseFloat(e.target.value) || 0 };
                      setAdditionalCharges(next);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = additionalCharges.filter((_, i) => i !== idx);
                      setAdditionalCharges(next);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdditionalCharges([...additionalCharges, { name: "", amount: 0 }])}
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> Add Charge
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewGRDialog({ id }: { id: string }) {
  const { goodsReceipts, businessInfo, gstSettings } = useApp();
  const receipt = goodsReceipts.find(g => g.id === id)!;
  const elId = `gr-print-${id}`;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1"><Eye className="w-4 h-4" /> View</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Goods Receipt</DialogTitle>
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
            <h2>Goods Receipt {receipt.grNumber}</h2>
          </div>
          
          <div className="section">
            <div className="grid">
              <div>
                <strong>Supplier Details</strong>
                <div>{receipt.supplier.name}</div>
                <div className="muted">{receipt.supplier.address}</div>
                <div className="muted">{receipt.supplier.email} · {receipt.supplier.phone}</div>
                {receipt.supplier.gstNumber && <div className="muted">GST: {receipt.supplier.gstNumber}</div>}
              </div>
              <div>
                <strong>Receipt Details</strong>
                <div>Date: {formatDateIN(receipt.date)}</div>
                <div>Status: {receipt.status}</div>
                <div>GST: {receipt.sgst + receipt.cgst > 0 ? `${gstSettings.sgstRate + gstSettings.cgstRate}%` : 'Not Applied'}</div>
              </div>
            </div>
          </div>
          
          <div className="section">
            <p style={{marginBottom: '8px', fontStyle: 'italic'}}>Following goods have been received and verified :</p>
            <table>
              <thead>
                <tr><th>#</th><th>Item</th><th>Ordered</th><th>Received</th><th>Unit</th><th>Rate</th><th>Total</th></tr>
              </thead>
              <tbody>
                {receipt.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td>{idx + 1}</td>
                    <td>{it.item.name}</td>
                    <td>{it.orderedQuantity || '-'}</td>
                    <td>{it.receivedQuantity}</td>
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
                <tr><td className="label">Subtotal</td><td className="value">{formatINR(receipt.subtotal)}</td></tr>
                {(receipt.additionalCharges ?? []).map((charge) => (
                  <tr key={charge.id}><td className="label">{charge.name}</td><td className="value">{formatINR(charge.amount)}</td></tr>
                ))}
                <tr><td className="label">SGST</td><td className="value">{formatINR(receipt.sgst)}</td></tr>
                <tr><td className="label">CGST</td><td className="value">{formatINR(receipt.cgst)}</td></tr>
                <tr><td className="label"><strong>Total Amount</strong></td><td className="value"><strong>{formatINR(receipt.total)}</strong></td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="section terms">
            <strong>Receipt Confirmation:</strong>
            <div className="muted" style={{ marginTop: '8px', lineHeight: '1.4' }}>
              1. All goods have been inspected upon receipt<br />
              2. Quality check completed as per standards<br />
              3. Quantities verified and confirmed<br />
              4. Any discrepancies noted in remarks section<br />
              5. Goods accepted in good condition
            </div>
          </div>
          
          <div className="signature-section">
            <div>Authorized Signatory</div>
            <div style={{ marginTop: '40px', borderTop: '1px solid #000', width: '200px', textAlign: 'center', paddingTop: '8px' }}>
              {businessInfo.name}
            </div>
          </div>
          
          {receipt.notes && <div className="footer">Notes: {receipt.notes}</div>}
        </div>
        <DialogFooter>
          <Button onClick={() => printElementById(elId, `GR ${receipt.grNumber}`)} className="gap-1"><Printer className="w-4 h-4" /> Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditGRDialog({ id }: { id: string }) {
  const { goodsReceipts, updateGoodsReceipt } = useApp();
  const receipt = goodsReceipts.find(g => g.id === id)!;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(receipt.status);
  const [notes, setNotes] = useState(receipt.notes || "");

  const onSave = () => { updateGoodsReceipt(id, { status, notes }); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1"><Edit className="w-4 h-4" /> Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit GR</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <div className="mb-1">Status</div>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="z-50">
                {['RECEIVED','QUALITY_CHECK','ACCEPTED','REJECTED'].map(s => (
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

function UpdateStatusButton({ id, status, label, destructive }: { id: string; status: any; label: string; destructive?: boolean }) {
  const { updateGoodsReceipt } = useApp();
  return (
    <Button variant={destructive ? 'destructive' : 'success'} size="sm" onClick={() => updateGoodsReceipt(id, { status })}>
      {label}
    </Button>
  );
}

function PrintGRButton({ id }: { id: string }) {
  const elId = `gr-print-${id}`;
  return (
    <Button variant="outline" size="sm" className="gap-1" onClick={() => printElementById(elId)}>
      <Printer className="w-4 h-4" /> Print/PDF
    </Button>
  );
}

function DeleteGRDialog({ id }: { id: string }) {
  const { goodsReceipts, removeGoodsReceipt } = useApp();
  const receipt = goodsReceipts.find(g => g.id === id)!;
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete GR ${receipt.grNumber}?`)) {
      removeGoodsReceipt(id);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
      <Trash2 className="w-4 h-4" /> Delete
    </Button>
  );
}

export default GoodsReceiptPage;

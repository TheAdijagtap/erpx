import { useMemo, useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Package, Eye, Edit, Printer, CheckCircle, XCircle, Trash2, Tag } from "lucide-react";
import { useData } from "@/store/SupabaseDataContext";
import { formatDateIN, formatINR } from "@/lib/format";
import { printElementById } from "@/lib/print";
import { numberToWords } from "@/lib/numberToWords";
import { escapeHtml } from "@/lib/htmlEscape";
import { useDebounce } from "@/hooks/useDebounce";

const isValidHsn = (value?: string) => {
  const v = (value ?? "").trim();
  return v.length > 0 && /^\d+$/.test(v);
};

const GoodsReceiptPage = () => {
  const { goodsReceipts } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 150);

  const filteredReceipts = useMemo(() => goodsReceipts.filter(receipt =>
    receipt.grNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    receipt.supplier.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  ), [goodsReceipts, debouncedSearch]);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredReceipts.map((receipt) => (
          <Card key={receipt.id} className="p-4 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{receipt.grNumber}</h3>
                    {getStatusBadge(receipt.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {receipt.supplier.name} · {formatDateIN(receipt.date)}
                  </p>
                </div>
                <div className="p-1.5 bg-primary-light rounded">
                  <Package className="w-4 h-4 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Items</p>
                  <p className="text-sm font-semibold">{receipt.items.length}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Received</p>
                  <p className="text-sm font-semibold">
                    {receipt.items.reduce((sum, item) => sum + item.receivedQuantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Ordered</p>
                  <p className="text-sm font-semibold">
                    {receipt.items.reduce((sum, item) => sum + (item.orderedQuantity || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total</p>
                  <p className="text-sm font-semibold">{formatINR(receipt.total)}</p>
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <ViewGRDialog id={receipt.id} />
                <EditGRDialog id={receipt.id} />
                <PrintGRButton id={receipt.id} />
                <TCodeDialog id={receipt.id} />
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
      return <Badge className="bg-blue-400 text-blue-900">Received</Badge>;
    case "QUALITY_CHECK":
      return <Badge className="bg-yellow-400 text-yellow-900">Quality Check</Badge>;
    case "ACCEPTED":
      return <Badge className="bg-green-500 text-white">Accepted</Badge>;
    case "REJECTED":
      return <Badge className="bg-red-500 text-white">Rejected</Badge>;
    default:
      return <Badge className="bg-gray-400 text-gray-900">{status}</Badge>;
  }
}

function CreateGRDialog() {
  const { suppliers, inventoryItems: items, addGoodsReceipt, gstSettings, purchaseOrders, transactions } = useData();
  const [open, setOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(suppliers[0]?.id || null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [applyGST, setApplyGST] = useState<boolean>(gstSettings.enabled);
  const [batchCounter, setBatchCounter] = useState(0);
  const [rows, setRows] = useState<Array<{ itemId: string; receivedQuantity: number; unitPrice: number; orderedQuantity?: number; batchNumber?: string }>>([]);
  const [additionalCharges, setAdditionalCharges] = useState<Array<{ name: string; amount: number }>>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  // Generate batch number
  const generateBatchNumber = (counter: number) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `LOT-${year}${month}-`;
    
    // Find highest existing batch number with same prefix from transactions
    const existingBatches = transactions
      .filter(t => t.batchNumber?.startsWith(prefix))
      .map(t => {
        const num = parseInt(t.batchNumber?.split('-').pop() || '0', 10);
        return isNaN(num) ? 0 : num;
      });
    
    const baseNum = existingBatches.length > 0 ? Math.max(...existingBatches) : 0;
    return `${prefix}${String(baseNum + counter + 1).padStart(3, '0')}`;
  };

  // Initialize first row with batch number when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && rows.length === 0) {
      setBatchCounter(0);
      setRows([{ 
        itemId: items[0]?.id || "", 
        receivedQuantity: 1, 
        unitPrice: items[0]?.unitPrice || 0, 
        batchNumber: generateBatchNumber(0) 
      }]);
    }
  };

  const filteredItems = useMemo(() => {
    const search = itemSearch.toLowerCase().trim();
    if (!search) return items;
    return items.filter(i => 
      i.name.toLowerCase().includes(search) ||
      (i.description && i.description.toLowerCase().includes(search)) ||
      (i.category && i.category.toLowerCase().includes(search)) ||
      (i.sku && i.sku.toLowerCase().includes(search))
    );
  }, [items, itemSearch]);

  const filteredSuppliers = useMemo(() => 
    suppliers.filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase())),
    [suppliers, supplierSearch]
  );

  const availablePOs = purchaseOrders.filter(po => po.status !== 'CANCELLED' && po.status !== 'RECEIVED');

  const handlePOSelection = (poId: string) => {
    setSelectedPoId(poId);
    const selectedPO = purchaseOrders.find(po => po.id === poId);
    if (selectedPO) {
      setSupplierId(selectedPO.supplierId);
      setDate(new Date().toISOString().slice(0, 10));
      setApplyGST(selectedPO.sgst > 0 || selectedPO.cgst > 0);
      setBatchCounter(selectedPO.items.length - 1);
      setRows(selectedPO.items.map((item, idx) => ({
        itemId: item.itemId,
        orderedQuantity: item.quantity,
        receivedQuantity: item.quantity,
        unitPrice: item.unitPrice,
        batchNumber: generateBatchNumber(idx),
      })));
      setAdditionalCharges(selectedPO.additionalCharges?.map(charge => ({
        name: charge.name,
        amount: charge.amount
      })) || []);
    }
  };

  const onAddRow = () => {
    const newCounter = batchCounter + 1;
    setBatchCounter(newCounter);
    setRows([...rows, { 
      itemId: items[0]?.id || "", 
      receivedQuantity: 1, 
      unitPrice: items[0]?.unitPrice || 0, 
      batchNumber: generateBatchNumber(newCounter) 
    }]);
  };
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
      batchNumber: r.batchNumber || undefined,
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
      poId: selectedPoId || undefined,
      applyGST,
    });
    setOpen(false);
    setSelectedPoId(null);
    setBatchCounter(0);
    setRows([]);
    setAdditionalCharges([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-1">Select Purchase Order (Optional)</div>
              <Select value={selectedPoId || undefined} onValueChange={handlePOSelection}>
                <SelectTrigger><SelectValue placeholder="Select PO to auto-fill" /></SelectTrigger>
                <SelectContent className="z-50">
                  {availablePOs.map((po) => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.poNumber} - {po.supplier.name} ({formatINR(po.total)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-1">Date</div>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-1">Supplier</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Select value={supplierId || undefined} onValueChange={setSupplierId} disabled={!!selectedPoId}>
                  <SelectTrigger className="pl-10"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent className="z-50">
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Search suppliers..."
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {filteredSuppliers.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        No suppliers found
                      </div>
                    ) : (
                      filteredSuppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
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
                  <TableHead>Batch/Lot No.</TableHead>
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
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                        <Select value={row.itemId} onValueChange={(v) => {
                          const it = items.find(i => i.id === v)!;
                          const next = [...rows];
                          next[idx] = { ...row, itemId: v, unitPrice: it.unitPrice };
                          setRows(next);
                        }}>
                          <SelectTrigger className="w-full pl-10"><SelectValue placeholder="Select item" /></SelectTrigger>
                          <SelectContent className="z-50 max-h-64">
                            <div className="px-2 pb-2 sticky top-0 bg-background">
                              <Input
                                placeholder="Search items..."
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                className="h-8"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            {filteredItems.length === 0 ? (
                              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                No items found
                              </div>
                            ) : (
                              filteredItems.map((i) => (
                                <SelectItem key={i.id} value={i.id}>
                                  <div className="flex flex-col">
                                    <span>{i.name}</span>
                                    {i.description && (
                                      <span className="text-xs text-muted-foreground">{i.description}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Batch/Lot"
                        value={row.batchNumber || ""}
                        onChange={(e) => {
                          const next = [...rows];
                          next[idx] = { ...row, batchNumber: e.target.value };
                          setRows(next);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} value={row.orderedQuantity || 0} onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, orderedQuantity: parseFloat(e.target.value) || 0 };
                        setRows(next);
                      }} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} step="0.01" value={row.receivedQuantity} onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, receivedQuantity: parseFloat(e.target.value) || 0 };
                        setRows(next);
                      }} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} step="0.01" value={row.unitPrice} onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, unitPrice: parseFloat(e.target.value) || 0 };
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
  const { goodsReceipts, businessInfo, gstSettings } = useData();
  const receipt = goodsReceipts.find(g => g.id === id)!;
  const elId = `gr-print-${id}`;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1"><Eye className="w-4 h-4" /> View</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Goods Receipt</SheetTitle>
        </SheetHeader>
        <div id={elId} className="mt-4">
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
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  {receipt.items.some(it => it.batchNumber) && <th>Batch/Lot</th>}
                  {receipt.items.some(it => isValidHsn(it.item.sku)) && <th>HSN</th>}
                  <th>Ordered</th>
                  <th>Received</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div style={{fontWeight: '600'}}>{it.item.name}</div>
                      {it.item.description && <div style={{fontSize: '12px', color: '#64748b', marginTop: '2px'}}>{it.item.description}</div>}
                    </td>
                    {receipt.items.some(i => i.batchNumber) && <td>{it.batchNumber || '-'}</td>}
                    {receipt.items.some(i => isValidHsn(i.item.sku)) && <td>{isValidHsn(it.item.sku) ? it.item.sku : '-'}</td>}
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
            <strong>Terms & Conditions:</strong>
            <div className="muted" style={{ marginTop: '8px', lineHeight: '1.4' }}>
              1. All goods have been inspected upon receipt<br />
              2. Quality check completed as per standards<br />
              3. Quantities verified and confirmed<br />
              4. Any discrepancies noted in remarks section<br />
              5. Goods accepted in good condition
            </div>
          </div>
          
          {businessInfo.signature && (
            <div className="signature-section">
              <div>Authorized Signatory</div>
              <img src={businessInfo.signature} alt="Authorized Signature" className="signature-image" style={{ marginTop: '8px' }} />
              <div className="muted">{businessInfo.name}</div>
            </div>
          )}
          
          {receipt.notes && <div className="footer">Notes: {receipt.notes}</div>}
        </div>
        <SheetFooter className="mt-6">
          <Button onClick={() => printElementById(elId, `GR ${receipt.grNumber}`)} className="gap-1"><Printer className="w-4 h-4" /> Print</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function EditGRDialog({ id }: { id: string }) {
  const { goodsReceipts, updateGoodsReceipt } = useData();
  const receipt = goodsReceipts.find(g => g.id === id)!;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(receipt.status);
  const [notes, setNotes] = useState(receipt.notes || "");
  const [qcDate, setQcDate] = useState<string>(receipt.qcDate ? receipt.qcDate.toISOString().slice(0, 10) : "");

  const onSave = () => { 
    updateGoodsReceipt(id, { 
      status, 
      notes, 
      qcDate: qcDate ? new Date(qcDate) : undefined 
    }); 
    setOpen(false); 
  };

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
            <div className="mb-1">QC Date</div>
            <Input 
              type="date" 
              value={qcDate} 
              onChange={(e) => setQcDate(e.target.value)} 
              placeholder="Select QC completion date"
            />
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
  const { updateGoodsReceipt } = useData();
  return (
    <Button variant={destructive ? 'destructive' : 'default'} size="sm" onClick={() => updateGoodsReceipt(id, { status })}>
      {label}
    </Button>
  );
}

function PrintGRButton({ id }: { id: string }) {
  const { goodsReceipts, businessInfo, gstSettings } = useData();
  const receipt = goodsReceipts.find(g => g.id === id)!;
  const elId = `gr-print-standalone-${id}`;
  
  const handlePrint = () => {
    // Create a temporary container with the print content
    const tempDiv = document.createElement('div');
    tempDiv.id = elId;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Render the same content as ViewGRDialog
    tempDiv.innerHTML = `
      <div class="section">
        <div class="header">
          ${businessInfo.logo ? `<img src="${escapeHtml(businessInfo.logo)}" alt="Logo" />` : ''}
          <div>
            <div class="brand">${escapeHtml(businessInfo.name)}</div>
            <div class="muted">${escapeHtml(businessInfo.address)}</div>
            <div class="muted">${escapeHtml(businessInfo.email)} · ${escapeHtml(businessInfo.phone)}</div>
            ${businessInfo.gstNumber ? `<div class="muted">GST: ${escapeHtml(businessInfo.gstNumber)}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="section"><h2>Goods Receipt ${escapeHtml(receipt.grNumber)}</h2></div>
      <div class="section">
        <div class="grid">
          <div>
            <strong>Supplier Details</strong>
            <div>${escapeHtml(receipt.supplier.name)}</div>
            <div class="muted">${escapeHtml(receipt.supplier.address)}</div>
            <div class="muted">${escapeHtml(receipt.supplier.email)} · ${escapeHtml(receipt.supplier.phone)}</div>
            ${receipt.supplier.gstNumber ? `<div class="muted">GST: ${escapeHtml(receipt.supplier.gstNumber)}</div>` : ''}
          </div>
          <div>
            <strong>Receipt Details</strong>
            <div>Date: ${formatDateIN(receipt.date)}</div>
            <div>Status: ${escapeHtml(receipt.status)}</div>
            <div>GST: ${receipt.sgst + receipt.cgst > 0 ? `${gstSettings.sgstRate + gstSettings.cgstRate}%` : 'Not Applied'}</div>
          </div>
        </div>
      </div>
      <div class="section">
        <p style="margin-bottom: 8px; font-style: italic">Following goods have been received and verified :</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              ${receipt.items.some(it => it.batchNumber) ? '<th>Batch/Lot</th>' : ''}
              ${receipt.items.some(it => isValidHsn(it.item.sku)) ? '<th>HSN</th>' : ''}
              <th>Ordered</th>
              <th>Received</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.items.map((it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <div style="font-weight: 600">${escapeHtml(it.item.name)}</div>
                  ${it.item.description ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px">${escapeHtml(it.item.description)}</div>` : ''}
                </td>
                ${receipt.items.some(i => i.batchNumber) ? `<td>${it.batchNumber ? escapeHtml(it.batchNumber) : '-'}</td>` : ''}
                ${receipt.items.some(i => isValidHsn(i.item.sku)) ? `<td>${isValidHsn(it.item.sku) ? escapeHtml(it.item.sku) : '-'}</td>` : ''}
                <td>${it.orderedQuantity || '-'}</td>
                <td>${it.receivedQuantity}</td>
                <td>${escapeHtml(it.item.unit)}</td>
                <td>${formatINR(it.unitPrice)}</td>
                <td>${formatINR(it.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="section">
        <table class="totals">
          <tbody>
            <tr><td class="label">Subtotal</td><td class="value">${formatINR(receipt.subtotal)}</td></tr>
            ${(receipt.additionalCharges ?? []).map(charge => `<tr><td class="label">${escapeHtml(charge.name)}</td><td class="value">${formatINR(charge.amount)}</td></tr>`).join('')}
            <tr><td class="label">SGST</td><td class="value">${formatINR(receipt.sgst)}</td></tr>
            <tr><td class="label">CGST</td><td class="value">${formatINR(receipt.cgst)}</td></tr>
            <tr><td class="label"><strong>Total Amount</strong></td><td class="value"><strong>${formatINR(receipt.total)}</strong></td></tr>
          </tbody>
        </table>
        <div class="amount-words">Amount in Words: ${numberToWords(receipt.total)}</div>
      </div>
      <div class="section terms">
        <strong>Terms & Conditions:</strong>
        <div class="muted" style="margin-top: 8px; line-height: 1.4">
          1. All goods have been inspected upon receipt<br />
          2. Quality check completed as per standards<br />
          3. Quantities verified and confirmed<br />
          4. Any discrepancies noted in remarks section<br />
          5. Goods accepted in good condition
        </div>
      </div>
      ${businessInfo.signature ? `
        <div class="signature-section">
          <div>Authorized Signatory</div>
          <img src="${escapeHtml(businessInfo.signature)}" alt="Authorized Signature" class="signature-image" style="margin-top: 8px" />
          <div class="muted">${escapeHtml(businessInfo.name)}</div>
        </div>
      ` : ''}
      ${receipt.notes ? `<div class="footer">Notes: ${escapeHtml(receipt.notes)}</div>` : ''}
    `;
    
    printElementById(elId, `GR ${receipt.grNumber}`);
    setTimeout(() => document.body.removeChild(tempDiv), 500);
  };
  
  return (
    <Button variant="outline" size="sm" className="gap-1" onClick={handlePrint}>
      <Printer className="w-4 h-4" /> Print/PDF
    </Button>
  );
}

function DeleteGRDialog({ id }: { id: string }) {
  const { goodsReceipts, removeGoodsReceipt } = useData();
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

// T-Code Sticker Generator Dialog
function TCodeDialog({ id }: { id: string }) {
  const { goodsReceipts, businessInfo } = useData();
  const receipt = goodsReceipts.find(g => g.id === id)!;
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [stickerQty, setStickerQty] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedItemData = receipt.items.find(it => it.id === selectedItem);

  const generateTCode = (itemCode?: string) => {
    // Use item's Item Code directly if available
    if (itemCode) {
      return itemCode;
    }
    // Fallback to auto-generated format if no item code
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `TC-${dateStr}-${random}`;
  };

  const printStickers = async () => {
    if (!selectedItemData) return;

    setIsGenerating(true);
    
    // Import QR code library
    const QRCode = await import('qrcode');
    
    const stickers = [];
    const tCodeRecords = [];
    
    for (let i = 0; i < stickerQty; i++) {
      const tCode = generateTCode(selectedItemData.item.itemCode);
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(tCode, {
        width: 80,
        margin: 1,
        errorCorrectionLevel: 'M',
      });
      
      stickers.push({
        tCode,
        qrCode: qrDataUrl,
        itemName: selectedItemData.item.name,
        grNumber: receipt.grNumber,
        grDate: receipt.date.toLocaleDateString('en-IN'),
        qcDate: receipt.qcDate ? receipt.qcDate.toLocaleDateString('en-IN') : '-',
        batchNumber: selectedItemData.batchNumber || '-',
        unit: selectedItemData.item.unit,
        stickerNo: i + 1,
        totalStickers: stickerQty,
      });
      
      tCodeRecords.push({
        goods_receipt_id: receipt.id,
        goods_receipt_item_id: selectedItemData.id,
        t_code: tCode,
        item_name: selectedItemData.item.name,
        gr_number: receipt.grNumber,
        batch_number: selectedItemData.batchNumber || null,
        unit: selectedItemData.item.unit,
        sticker_number: i + 1,
        total_stickers: stickerQty,
      });
    }

    // Save T-Codes to database
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const recordsWithUserId = tCodeRecords.map(r => ({ ...r, user_id: user.id }));
        const { error } = await supabase.from('t_codes').insert(recordsWithUserId);
        if (error) {
          console.error('Failed to save T-Codes:', error);
        }
      }
    } catch (err) {
      console.error('Error saving T-Codes:', err);
    }
    
    setIsGenerating(false);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const stickerHtml = stickers.map((s, idx) => `
      <div class="sticker" style="page-break-inside: avoid; ${idx > 0 ? 'page-break-before: auto;' : ''}">
        <div class="header">
          <div class="qr-code"><img src="${s.qrCode}" alt="QR Code" /></div>
          <div class="header-text">
            <div class="tcode">${escapeHtml(s.tCode)}</div>
            <div class="company">${escapeHtml(businessInfo.name)}</div>
          </div>
        </div>
        <table>
          <tr><td class="label">Item:</td><td class="value">${escapeHtml(s.itemName)}</td></tr>
          <tr><td class="label">GR No:</td><td class="value">${escapeHtml(s.grNumber)}</td></tr>
          <tr><td class="label">GR Date:</td><td class="value">${escapeHtml(s.grDate)}</td></tr>
          <tr><td class="label">QC Date:</td><td class="value">${escapeHtml(s.qcDate)}</td></tr>
          <tr><td class="label">Batch/Lot:</td><td class="value">${escapeHtml(s.batchNumber)}</td></tr>
        </table>
        <div class="footer">
          <span class="sticker-num">${s.stickerNo} of ${s.totalStickers}</span>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>T-Code Stickers - ${receipt.grNumber}</title>
        <style>
          @page { size: 80mm 50mm; margin: 2mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; }
          .sticker {
            width: 76mm;
            height: 46mm;
            border: 1px solid #000;
            padding: 2mm;
            margin-bottom: 2mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .header {
            display: flex;
            align-items: center;
            gap: 2mm;
          }
          .qr-code {
            flex-shrink: 0;
          }
          .qr-code img {
            width: 18mm;
            height: 18mm;
          }
          .header-text {
            flex: 1;
          }
          .tcode {
            font-size: 12px;
            font-weight: bold;
            padding: 1mm;
            background: #f0f0f0;
            border: 1px solid #ccc;
            letter-spacing: 0.5px;
            text-align: center;
          }
          .company {
            font-size: 9px;
            text-align: center;
            font-weight: bold;
            margin-top: 1mm;
            color: #333;
          }
          table {
            width: 100%;
            font-size: 9px;
            border-collapse: collapse;
            margin-top: 1mm;
          }
          td { padding: 0.5mm 0; }
          td.label { font-weight: bold; width: 25%; color: #555; }
          td.value { color: #000; }
          .footer {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #666;
            margin-top: 1mm;
          }
          @media print {
            .sticker { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>${stickerHtml}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Tag className="w-4 h-4" /> T-Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate T-Code Stickers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Generate printable T-Code stickers for items in this GR. Each sticker contains item details, batch number, and a unique transaction code.
          </p>

          <div>
            <div className="mb-1 font-medium">Select Item</div>
            <Select value={selectedItem || undefined} onValueChange={setSelectedItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select item to generate T-Code" />
              </SelectTrigger>
              <SelectContent>
                {receipt.items.map((it) => (
                  <SelectItem key={it.id} value={it.id}>
                    {it.item.name} - Qty: {it.receivedQuantity} {it.item.unit} {it.batchNumber ? `(${it.batchNumber})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedItemData && (
            <div className="p-3 bg-muted rounded-md space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item:</span>
                <span className="font-medium">{selectedItemData.item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Received Qty:</span>
                <span className="font-medium">{selectedItemData.receivedQuantity} {selectedItemData.item.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch/Lot:</span>
                <span className="font-medium">{selectedItemData.batchNumber || '-'}</span>
              </div>
            </div>
          )}

          <div>
            <div className="mb-1 font-medium">Number of Stickers</div>
            <Input
              type="number"
              min={1}
              max={100}
              value={stickerQty}
              onChange={(e) => setStickerQty(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              placeholder="Enter quantity"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Generate multiple stickers for the same item (e.g., for different packages)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={printStickers}
            disabled={!selectedItem || isGenerating}
            className="gap-1"
          >
            <Printer className="w-4 h-4" /> {isGenerating ? 'Generating...' : 'Print Stickers'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GoodsReceiptPage;

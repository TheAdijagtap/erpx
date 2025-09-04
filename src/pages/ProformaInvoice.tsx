import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Search, Receipt, Eye, Edit, Printer, Trash2, Calendar } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { formatDateIN, formatINR } from "@/lib/format";
import { printElementById } from "@/lib/print";
import { numberToWords } from "@/lib/numberToWords";
import { ProformaInvoice as ProformaInvoiceType, ProformaInvoiceItem, BuyerInfo } from "@/types/inventory";

const ProformaInvoice = () => {
  const { proformaInvoices } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvoices = useMemo(() => proformaInvoices.filter(invoice =>
    invoice.proformaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.buyerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [proformaInvoices, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proforma Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage proforma invoices for your buyers.
          </p>
        </div>
        <CreateProformaDialog />
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by proforma number or buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{invoice.proformaNumber}</h3>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Buyer: {invoice.buyerInfo.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {formatDateIN(invoice.date)}
                  </p>
                </div>
                <div className="p-2 bg-primary-light rounded-lg">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items</p>
                  <p className="text-lg font-semibold">{invoice.items.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                  <p className="text-lg font-semibold">
                    {invoice.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold">{formatINR(invoice.total)}</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="float-right font-medium">{formatINR(invoice.subtotal)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SGST:</span>
                    <span className="float-right font-medium">{formatINR(invoice.sgst)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CGST:</span>
                    <span className="float-right font-medium">{formatINR(invoice.cgst)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-semibold">Total:</span>
                    <span className="float-right font-semibold">{formatINR(invoice.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ViewProformaDialog invoice={invoice} />
                <EditProformaDialog invoice={invoice} />
                <PrintProformaButton id={invoice.id} />
                <DeleteProformaDialog id={invoice.id} />
              </div>
            </div>
          </Card>
        ))}

        {filteredInvoices.length === 0 && (
          <Card className="p-12 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No proforma invoices found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No invoices match your search criteria." : "Create your first proforma invoice to get started."}
            </p>
            {!searchTerm && <CreateProformaDialog />}
          </Card>
        )}
      </div>
    </div>
  );
};

const getStatusBadge = (status: ProformaInvoiceType['status']) => {
  const config = {
    DRAFT: { label: "Draft", variant: "secondary" as const },
    SENT: { label: "Sent", variant: "outline" as const },
    ACCEPTED: { label: "Accepted", variant: "default" as const },
    CANCELLED: { label: "Cancelled", variant: "destructive" as const },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
};

const CreateProformaDialog = () => {
  const { inventoryItems, addProformaInvoice, businessInfo, gstSettings } = useApp();
  const [open, setOpen] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
  });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [items, setItems] = useState<ProformaInvoiceItem[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<Array<{ name: string; amount: number }>>([]);
  const [notes, setNotes] = useState("");

  const addRow = () => {
    if (inventoryItems.length === 0) return;
    
    setItems([...items, {
      id: Date.now().toString(),
      itemId: inventoryItems[0].id,
      item: inventoryItems[0],
      quantity: 1,
      unitPrice: inventoryItems[0].unitPrice,
      total: inventoryItems[0].unitPrice,
    }]);
  };

  const updateItem = (index: number, field: keyof ProformaInvoiceItem, value: any) => {
    const newItems = [...items];
    if (field === 'itemId') {
      const selectedItem = inventoryItems.find(item => item.id === value);
      if (selectedItem) {
        newItems[index] = {
          ...newItems[index],
          itemId: value,
          item: selectedItem,
          unitPrice: selectedItem.unitPrice,
          total: newItems[index].quantity * selectedItem.unitPrice,
        };
      }
    } else if (field === 'quantity' || field === 'unitPrice') {
      newItems[index] = { ...newItems[index], [field]: value };
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calcTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const chargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const sgst = gstSettings.enabled ? ((subtotal + chargesTotal) * gstSettings.sgstRate) / 100 : 0;
    const cgst = gstSettings.enabled ? ((subtotal + chargesTotal) * gstSettings.cgstRate) / 100 : 0;
    const total = subtotal + chargesTotal + sgst + cgst;
    return { subtotal, sgst, cgst, total };
  };

  const handleSubmit = () => {
    if (!buyerInfo.name || items.length === 0) return;

    const { subtotal, sgst, cgst, total } = calcTotals();
    const proformaNumber = `PI-${Date.now()}`;

    addProformaInvoice({
      proformaNumber,
      buyerInfo,
      items,
      additionalCharges: additionalCharges.map(charge => ({
        id: crypto.randomUUID(),
        name: charge.name,
        amount: charge.amount,
      })),
      status: 'DRAFT',
      date: new Date(date),
      validUntil: validUntil ? new Date(validUntil) : undefined,
      paymentTerms,
      notes,
    });

    setOpen(false);
    // Reset form
    setBuyerInfo({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
    });
    setDate(new Date().toISOString().split('T')[0]);
    setValidUntil("");
    setPaymentTerms("");
    setItems([]);
    setNotes("");
  };

  const { subtotal, sgst, cgst, total } = calcTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Proforma
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Proforma Invoice</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Buyer Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyerName">Company Name *</Label>
                <Input
                  id="buyerName"
                  value={buyerInfo.name}
                  onChange={(e) => setBuyerInfo({...buyerInfo, name: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={buyerInfo.contactPerson}
                  onChange={(e) => setBuyerInfo({...buyerInfo, contactPerson: e.target.value})}
                  placeholder="Enter contact person"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={buyerInfo.email}
                  onChange={(e) => setBuyerInfo({...buyerInfo, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={buyerInfo.phone}
                  onChange={(e) => setBuyerInfo({...buyerInfo, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={buyerInfo.address}
                  onChange={(e) => setBuyerInfo({...buyerInfo, address: e.target.value})}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={buyerInfo.gstNumber}
                  onChange={(e) => setBuyerInfo({...buyerInfo, gstNumber: e.target.value})}
                  placeholder="Enter GST number"
                />
              </div>
            </div>
          </Card>

          {/* Invoice Details */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g., 30 days"
                />
              </div>
            </div>
          </Card>

          {/* Items */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button onClick={addRow} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Select
                        value={item.itemId}
                        onValueChange={(value) => updateItem(index, 'itemId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((invItem) => (
                            <SelectItem key={invItem.id} value={invItem.id}>
                              {invItem.name} ({invItem.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>{formatINR(item.total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {items.length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {additionalCharges.map((charge, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{charge.name}:</span>
                    <span>{formatINR(charge.amount)}</span>
                  </div>
                ))}
                {gstSettings.enabled && (
                  <>
                    <div className="flex justify-between">
                      <span>SGST ({gstSettings.sgstRate}%):</span>
                      <span>{formatINR(sgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST ({gstSettings.cgstRate}%):</span>
                      <span>{formatINR(cgst)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Additional Charges */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Additional Charges</h3>
              <Button
                onClick={() => setAdditionalCharges([...additionalCharges, { name: "", amount: 0 }])}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Charge
              </Button>
            </div>
            
            <div className="space-y-2">
              {additionalCharges.map((charge, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!buyerInfo.name || items.length === 0}>
            Create Proforma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ViewProformaDialog = ({ invoice }: { invoice: ProformaInvoiceType }) => {
  const { businessInfo } = useApp();
  const [open, setOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      printElementById(`proforma-print-${invoice.id}`, `Proforma Invoice ${invoice.proformaNumber}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proforma Invoice Details</DialogTitle>
        </DialogHeader>
        
        <div id={`proforma-print-${invoice.id}`} ref={printRef}>
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
            <h2>Proforma Invoice {invoice.proformaNumber}</h2>
          </div>
          
          <div className="section">
            <div className="grid">
              <div>
                <strong>Buyer Details</strong>
                <div>{invoice.buyerInfo.name}</div>
                {invoice.buyerInfo.contactPerson && <div>{invoice.buyerInfo.contactPerson}</div>}
                <div className="muted">{invoice.buyerInfo.address}</div>
                <div className="muted">{invoice.buyerInfo.email} · {invoice.buyerInfo.phone}</div>
                {invoice.buyerInfo.gstNumber && <div className="muted">GST: {invoice.buyerInfo.gstNumber}</div>}
              </div>
              <div>
                <strong>Invoice Details</strong>
                <div>Date: {formatDateIN(invoice.date)}</div>
                {invoice.validUntil && <div>Valid Until: {formatDateIN(invoice.validUntil)}</div>}
                <div>Status: {invoice.status}</div>
                {invoice.paymentTerms && <div>Payment Terms: {invoice.paymentTerms}</div>}
              </div>
            </div>
          </div>
          
          <div className="section">
            <p style={{marginBottom: '8px', fontStyle: 'italic'}}>We are pleased to submit our quotation for the following items :</p>
            <table>
              <thead>
                <tr><th>#</th><th>Item</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Total</th></tr>
              </thead>
              <tbody>
                {invoice.items.map((it, idx) => (
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
                <tr><td className="label">Subtotal</td><td className="value">{formatINR(invoice.subtotal)}</td></tr>
                {(invoice.additionalCharges ?? []).map((charge) => (
                  <tr key={charge.id}><td className="label">{charge.name}</td><td className="value">{formatINR(charge.amount)}</td></tr>
                ))}
                <tr><td className="label">SGST</td><td className="value">{formatINR(invoice.sgst)}</td></tr>
                <tr><td className="label">CGST</td><td className="value">{formatINR(invoice.cgst)}</td></tr>
                <tr><td className="label"><strong>Total Amount</strong></td><td className="value"><strong>{formatINR(invoice.total)}</strong></td></tr>
              </tbody>
            </table>
            <div className="amount-words">
              Amount in Words: {numberToWords(invoice.total)}
            </div>
          </div>
          
          <div className="section terms">
            <strong>Terms & Conditions:</strong>
            <div className="muted" style={{ marginTop: '8px', lineHeight: '1.4' }}>
              1. Payment terms: {invoice.paymentTerms || "As agreed"}<br />
              2. Prices are valid until: {invoice.validUntil ? formatDateIN(invoice.validUntil) : "Further notice"}<br />
              3. All prices are subject to change without prior notice<br />
              4. This is a proforma invoice and not a tax invoice<br />
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
          
          {invoice.notes && <div className="footer">Notes: {invoice.notes}</div>}
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

const EditProformaDialog = ({ invoice }: { invoice: ProformaInvoiceType }) => {
  const { updateProformaInvoice } = useApp();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(invoice.status);
  const [notes, setNotes] = useState(invoice.notes || "");

  const handleSubmit = () => {
    updateProformaInvoice(invoice.id, { status, notes });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Proforma Invoice</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PrintProformaButton = ({ id }: { id: string }) => {
  const handlePrint = () => {
    printElementById(`proforma-print-${id}`, `Proforma Invoice`);
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="w-4 h-4 mr-2" />
      Print
    </Button>
  );
};

const DeleteProformaDialog = ({ id }: { id: string }) => {
  const { removeProformaInvoice } = useApp();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    removeProformaInvoice(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Proforma Invoice</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete this proforma invoice? This action cannot be undone.</p>
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

export default ProformaInvoice;
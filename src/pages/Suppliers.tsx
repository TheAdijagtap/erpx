import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, Mail, Phone, MapPin, Edit, Eye, Trash2, FileText, Package, Download, Bell, MessageCircle, Calendar, CheckCircle } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { toast } from "@/hooks/use-toast";
import { formatINR, formatDateIN } from "@/lib/format";

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"suppliers" | "follow-ups">("suppliers");
  const { suppliers, removeSupplier, addSupplier } = useApp();

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportSupplierList = () => {
    const csvContent = [
      ['Company Name', 'Contact Person', 'Email', 'Phone', 'Address', 'GST Number'].join(','),
      ...filteredSuppliers.map(supplier => [
        `"${supplier.name}"`,
        `"${supplier.contactPerson}"`,
        `"${supplier.email}"`,
        `"${supplier.phone}"`,
        `"${supplier.address}"`,
        `"${supplier.gstNumber || '-'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `suppliers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: "Success", description: "Supplier list exported successfully!" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supplier Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your supplier relationships and follow-up reminders.
          </p>
        </div>
        <CreateSupplierDialog>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Supplier
          </Button>
        </CreateSupplierDialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "suppliers" | "follow-ups")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="suppliers">
            <Users className="w-4 h-4 mr-2" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="follow-ups">
            <Bell className="w-4 h-4 mr-2" />
            Follow-Ups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-6 mt-6">

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search suppliers by name, contact person, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={exportSupplierList}>
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-light rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{suppliers.length}</p>
              <p className="text-sm text-muted-foreground">Total Suppliers</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-light rounded-lg">
              <Badge className="bg-success text-success-foreground">
                {suppliers.filter(s => s.gstNumber).length}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {suppliers.filter(s => s.gstNumber).length}
              </p>
              <p className="text-sm text-muted-foreground">GST Registered</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent-light rounded-lg">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-sm text-muted-foreground">Cities Covered</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{supplier.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{supplier.contactPerson}</p>
                  {supplier.gstNumber && (
                    <Badge variant="outline" className="mt-2">
                      GST: {supplier.gstNumber}
                    </Badge>
                  )}
                </div>
                <div className="p-2 bg-primary-light rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{supplier.phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm text-foreground leading-relaxed">
                    {supplier.address}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Added on {new Date((supplier as any).createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <ViewSupplierDialog supplier={supplier} />
                <EditSupplierDialog supplier={supplier} />
                <Button variant="destructive" size="sm" className="gap-1" onClick={() => {
                  if (confirm(`Are you sure you want to delete supplier ${supplier.name}?`)) {
                    removeSupplier(supplier.id);
                  }
                }}>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

        {filteredSuppliers.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No suppliers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Add your first supplier to start managing relationships"}
            </p>
            <CreateSupplierDialog>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add New Supplier
              </Button>
            </CreateSupplierDialog>
          </Card>
        )}
        </TabsContent>

        <TabsContent value="follow-ups" className="space-y-6 mt-6">
          <FollowUpSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function ViewSupplierDialog({ supplier }: { supplier: any }) {
  const [open, setOpen] = useState(false);
  const { purchaseOrders, goodsReceipts } = useApp();

  const supplierData = useMemo(() => {
    const pos = purchaseOrders.filter(po => po.supplierId === supplier.id);
    const grs = goodsReceipts.filter(gr => gr.supplierId === supplier.id);
    
    const totalPurchased = pos.reduce((sum, po) => sum + po.total, 0);
    const totalReceived = grs.reduce((sum, gr) => sum + gr.total, 0);
    
    return {
      purchaseOrders: pos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      goodsReceipts: grs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      totalPurchased,
      totalReceived,
      totalOrders: pos.length,
      totalReceipts: grs.length
    };
  }, [purchaseOrders, goodsReceipts, supplier.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 gap-1">
          <Eye className="w-4 h-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Supplier Details - {supplier.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="purchases">Purchase Orders ({supplierData.totalOrders})</TabsTrigger>
            <TabsTrigger value="receipts">Goods Receipts ({supplierData.totalReceipts})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Purchased</p>
                </div>
                <p className="text-2xl font-bold">{formatINR(supplierData.totalPurchased)}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-success" />
                  <p className="text-sm text-muted-foreground">Total Received</p>
                </div>
                <p className="text-2xl font-bold">{formatINR(supplierData.totalReceived)}</p>
              </Card>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Company Name</Label>
                <p className="font-medium">{supplier.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Contact Person</Label>
                <p className="font-medium">{supplier.contactPerson}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{supplier.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="font-medium">{supplier.phone}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-medium">{supplier.address}</p>
              </div>
              {supplier.gstNumber && (
                <div>
                  <Label className="text-muted-foreground">GST Number</Label>
                  <p className="font-medium">{supplier.gstNumber}</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="purchases" className="space-y-4">
            {supplierData.purchaseOrders.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No purchase orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {supplierData.purchaseOrders.map((po) => (
                  <Card key={po.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{po.poNumber}</h4>
                        <p className="text-sm text-muted-foreground">{formatDateIN(po.date)}</p>
                      </div>
                      <Badge variant={po.status === 'RECEIVED' ? 'default' : 'secondary'}>
                        {po.status}
                      </Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {po.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity} {item.item.unit}</TableCell>
                            <TableCell className="text-right">{formatINR(item.unitPrice)}</TableCell>
                            <TableCell className="text-right">{formatINR(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-3 pt-3 border-t flex justify-between">
                      <span className="font-medium">Total Amount</span>
                      <span className="font-bold">{formatINR(po.total)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="receipts" className="space-y-4">
            {supplierData.goodsReceipts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No goods receipts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {supplierData.goodsReceipts.map((gr) => (
                  <Card key={gr.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{gr.grNumber}</h4>
                        <p className="text-sm text-muted-foreground">{formatDateIN(gr.date)}</p>
                      </div>
                      <Badge variant={gr.status === 'ACCEPTED' ? 'default' : 'secondary'}>
                        {gr.status}
                      </Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Received Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gr.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.item.name}</TableCell>
                            <TableCell className="text-right">{item.receivedQuantity} {item.item.unit}</TableCell>
                            <TableCell className="text-right">{formatINR(item.unitPrice)}</TableCell>
                            <TableCell className="text-right">{formatINR(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-3 pt-3 border-t flex justify-between">
                      <span className="font-medium">Total Amount</span>
                      <span className="font-bold">{formatINR(gr.total)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditSupplierDialog({ supplier }: { supplier: any }) {
  const { updateSupplier } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: supplier.name,
    contactPerson: supplier.contactPerson,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    gstNumber: supplier.gstNumber || ""
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.email || !formData.phone) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" as any });
      return;
    }

    updateSupplier(supplier.id, formData);
    toast({ title: "Success", description: "Supplier updated successfully!" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 gap-1">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Company Name *</Label>
            <Input 
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter company name"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-contactPerson">Contact Person *</Label>
            <Input 
              id="edit-contactPerson"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Enter contact person name"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-email">Email *</Label>
            <Input 
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-phone">Phone *</Label>
            <Input 
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-address">Address</Label>
            <Textarea 
              id="edit-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-gstNumber">GST Number</Label>
            <Input 
              id="edit-gstNumber"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="Enter GST number (optional)"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateSupplierDialog({ children }: { children: React.ReactNode }) {
  const { addSupplier } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: ""
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.email || !formData.phone) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" as any });
      return;
    }

    const supplier = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date()
    };

    addSupplier(supplier);
    toast({ title: "Success", description: "Supplier added successfully!" });
    setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", gstNumber: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Company Name *</Label>
            <Input 
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter company name"
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPerson">Contact Person *</Label>
            <Input 
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Enter contact person name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input 
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea 
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input 
              id="gstNumber"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="Enter GST number (optional)"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Supplier</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FollowUpSection() {
  const { followUps, suppliers, purchaseOrders, addFollowUp, updateFollowUp, removeFollowUp } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFollowUps = useMemo(() => {
    return followUps
      .filter(f => 
        f.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime());
  }, [followUps, searchTerm]);

  const openWhatsApp = (phoneNumber: string, message: string) => {
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search follow-ups by supplier or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <CreateFollowUpDialog>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Follow-Up
          </Button>
        </CreateFollowUpDialog>
      </div>

      {/* Follow-Ups List */}
      <div className="grid gap-4">
        {filteredFollowUps.map((followUp) => {
          const isOverdue = new Date(followUp.reminderDate) < new Date() && followUp.status === 'PENDING';
          const po = followUp.purchaseOrderId 
            ? purchaseOrders.find(p => p.id === followUp.purchaseOrderId)
            : null;

          return (
            <Card key={followUp.id} className={`p-6 ${isOverdue ? 'border-destructive' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isOverdue ? 'bg-destructive-light' : 'bg-primary-light'}`}>
                      <Bell className={`w-5 h-5 ${isOverdue ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{followUp.supplier.name}</h3>
                        <Badge variant={followUp.status === 'COMPLETED' ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                          {followUp.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Reminder: {formatDateIN(followUp.reminderDate)}</span>
                        {isOverdue && <span className="text-destructive font-medium">(Overdue)</span>}
                      </div>
                      {po && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <FileText className="w-4 h-4" />
                          <span>PO: {po.poNumber} - {po.status}</span>
                        </div>
                      )}
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{followUp.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      openWhatsApp(followUp.supplier.phone, followUp.message);
                      if (followUp.status === 'PENDING') {
                        updateFollowUp(followUp.id, { status: 'COMPLETED' });
                        toast({ title: "Success", description: "Follow-up marked as completed!" });
                      }
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                  {followUp.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        updateFollowUp(followUp.id, { status: 'COMPLETED' });
                        toast({ title: "Success", description: "Follow-up marked as completed!" });
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this follow-up?')) {
                        removeFollowUp(followUp.id);
                        toast({ title: "Success", description: "Follow-up deleted!" });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredFollowUps.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No follow-ups found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Add your first follow-up to track supplier communications"}
            </p>
            <CreateFollowUpDialog>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Follow-Up
              </Button>
            </CreateFollowUpDialog>
          </Card>
        )}
      </div>
    </div>
  );
}

function CreateFollowUpDialog({ children }: { children: React.ReactNode }) {
  const { suppliers, purchaseOrders, addFollowUp } = useApp();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  const availablePOs = useMemo(() => {
    if (!supplierId) return [];
    return purchaseOrders.filter(po => po.supplierId === supplierId);
  }, [supplierId, purchaseOrders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierId || !message || !reminderDate) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) {
      toast({ title: "Error", description: "Supplier not found", variant: "destructive" });
      return;
    }

    addFollowUp({
      supplierId,
      supplier,
      purchaseOrderId: purchaseOrderId || undefined,
      message,
      reminderDate: new Date(reminderDate),
      status: 'PENDING',
    });

    toast({ title: "Success", description: "Follow-up reminder created!" });
    setOpen(false);
    setSupplierId("");
    setPurchaseOrderId("");
    setMessage("");
    setReminderDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Follow-Up Reminder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supplier">Supplier *</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger id="supplier">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name} - {supplier.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {supplierId && availablePOs.length > 0 && (
            <div>
              <Label htmlFor="po">Related Purchase Order (Optional)</Label>
              <Select value={purchaseOrderId} onValueChange={setPurchaseOrderId}>
                <SelectTrigger id="po">
                  <SelectValue placeholder="Select purchase order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {availablePOs.map(po => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.poNumber} - {po.status} - {formatINR(po.total)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="reminderDate">Reminder Date *</Label>
            <Input
              id="reminderDate"
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your follow-up message that will be sent via WhatsApp..."
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              This message will be pre-filled when you click the WhatsApp button
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Follow-Up</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default Suppliers;
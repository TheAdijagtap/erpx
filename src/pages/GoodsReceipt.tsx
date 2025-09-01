import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, Eye, Edit, Printer, CheckCircle, XCircle } from "lucide-react";
import { GoodsReceipt } from "@/types/inventory";

const GoodsReceiptPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - in real app this would come from API
  const [goodsReceipts] = useState<GoodsReceipt[]>([
    {
      id: "1",
      grNumber: "GR-2024-001",
      poId: "1",
      supplierId: "1",
      supplier: {
        id: "1",
        name: "ABC Stationery Supplies",
        contactPerson: "Rajesh Kumar",
        email: "rajesh@abcstationery.com",
        phone: "+91 98765 43210",
        address: "123 Business Park, Mumbai, Maharashtra 400001",
        gstNumber: "27ABCDE1234F1Z5",
        createdAt: new Date("2024-01-01"),
      },
      items: [
        {
          id: "1",
          itemId: "1",
          item: {
            id: "1",
            name: "Office Paper A4",
            sku: "PPR-A4-001",
            category: "Office Supplies",
            currentStock: 150,
            minStock: 50,
            maxStock: 500,
            unitPrice: 250,
            unit: "pack",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          orderedQuantity: 100,
          receivedQuantity: 100,
          unitPrice: 250,
          total: 25000,
        },
      ],
      subtotal: 25000,
      sgst: 2250,
      cgst: 2250,
      total: 29500,
      status: "ACCEPTED",
      date: new Date("2024-01-16"),
      notes: "All items received in good condition",
    },
    {
      id: "2",
      grNumber: "GR-2024-002",
      poId: "2",
      supplierId: "2",
      supplier: {
        id: "2",
        name: "Tech Solutions India",
        contactPerson: "Priya Sharma",
        email: "priya@techsolutions.in",
        phone: "+91 87654 32109",
        address: "456 Tech Hub, Bangalore, Karnataka 560001",
        gstNumber: "29XYZAB5678G2H3",
        createdAt: new Date("2024-01-02"),
      },
      items: [
        {
          id: "2",
          itemId: "2",
          item: {
            id: "2",
            name: "Wireless Mouse",
            sku: "TECH-MS-002",
            category: "Technology",
            currentStock: 25,
            minStock: 15,
            maxStock: 100,
            unitPrice: 1200,
            unit: "piece",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          orderedQuantity: 50,
          receivedQuantity: 30,
          unitPrice: 1200,
          total: 36000,
        },
      ],
      subtotal: 36000,
      sgst: 3240,
      cgst: 3240,
      total: 42480,
      status: "QUALITY_CHECK",
      date: new Date("2024-01-12"),
      notes: "Partial delivery - remaining 20 items expected next week",
    },
  ]);

  const filteredReceipts = goodsReceipts.filter(receipt =>
    receipt.grNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goods Receipt</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage incoming goods from suppliers.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create New GR
        </Button>
      </div>

      {/* Search and Filters */}
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
          <Button variant="outline">Filter by Status</Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xl font-bold">{goodsReceipts.length}</p>
              <p className="text-sm text-muted-foreground">Total GRs</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-success" />
            <div>
              <p className="text-xl font-bold">
                {goodsReceipts.filter(gr => gr.status === "ACCEPTED").length}
              </p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center">
              <span className="text-accent font-bold text-sm">QC</span>
            </div>
            <div>
              <p className="text-xl font-bold">
                {goodsReceipts.filter(gr => gr.status === "QUALITY_CHECK").length}
              </p>
              <p className="text-sm text-muted-foreground">Quality Check</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-destructive" />
            <div>
              <p className="text-xl font-bold">
                {goodsReceipts.filter(gr => gr.status === "REJECTED").length}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Goods Receipts List */}
      <div className="space-y-4">
        {filteredReceipts.map((receipt) => (
          <Card key={receipt.id} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <div className="space-y-4">
              {/* Header */}
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
                    Date: {receipt.date.toLocaleDateString('en-IN')}
                  </p>
                  {receipt.poId && (
                    <p className="text-sm text-muted-foreground">
                      Related PO: PO-2024-{receipt.poId.padStart(3, '0')}
                    </p>
                  )}
                </div>
                <div className="p-2 bg-primary-light rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Items Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items</p>
                  <p className="text-lg font-semibold">{receipt.items.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Received Quantity</p>
                  <p className="text-lg font-semibold">
                    {receipt.items.reduce((sum, item) => sum + item.receivedQuantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {receipt.items[0]?.orderedQuantity ? "Expected Quantity" : "Ordered Quantity"}
                  </p>
                  <p className="text-lg font-semibold">
                    {receipt.items[0]?.orderedQuantity || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold">₹{receipt.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Variance Alert */}
              {receipt.items.some(item => item.orderedQuantity && item.receivedQuantity !== item.orderedQuantity) && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <p className="text-sm text-warning font-medium">
                    ⚠️ Quantity variance detected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Some items have different received vs ordered quantities
                  </p>
                </div>
              )}

              {/* Tax Breakdown */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="float-right font-medium">₹{receipt.subtotal.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SGST (9%):</span>
                    <span className="float-right font-medium">₹{receipt.sgst.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CGST (9%):</span>
                    <span className="float-right font-medium">₹{receipt.cgst.toLocaleString()}</span>
                  </div>
                  <div className="font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="float-right">₹{receipt.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {receipt.notes && (
                <div className="bg-primary-light/30 p-3 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Notes:</strong> {receipt.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Printer className="w-4 h-4" />
                  Print/PDF
                </Button>
                {receipt.status === "QUALITY_CHECK" && (
                  <>
                    <Button variant="success" size="sm" className="gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-1">
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
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
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create New GR
          </Button>
        </Card>
      )}
    </div>
  );
};

export default GoodsReceiptPage;
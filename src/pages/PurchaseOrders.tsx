import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Eye, Edit, Printer } from "lucide-react";
import { PurchaseOrder } from "@/types/inventory";

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - in real app this would come from API
  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: "1",
      poNumber: "PO-2024-001",
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
          quantity: 100,
          unitPrice: 250,
          total: 25000,
        },
      ],
      subtotal: 25000,
      sgst: 2250,
      cgst: 2250,
      total: 29500,
      status: "SENT",
      date: new Date("2024-01-15"),
      expectedDelivery: new Date("2024-01-22"),
      notes: "Urgent delivery required for office setup",
    },
    {
      id: "2",
      poNumber: "PO-2024-002",
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
          quantity: 50,
          unitPrice: 1200,
          total: 60000,
        },
      ],
      subtotal: 60000,
      sgst: 5400,
      cgst: 5400,
      total: 70800,
      status: "PARTIAL",
      date: new Date("2024-01-10"),
      expectedDelivery: new Date("2024-01-18"),
    },
  ]);

  const filteredOrders = purchaseOrders.filter(order =>
    order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage purchase orders for your suppliers.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create New PO
        </Button>
      </div>

      {/* Search and Filters */}
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
          <Button variant="outline">Filter by Status</Button>
        </div>
      </Card>

      {/* Purchase Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <div className="space-y-4">
              {/* Header */}
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
                    Date: {order.date.toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="p-2 bg-primary-light rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Items Summary */}
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
                  <p className="text-lg font-semibold">₹{order.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Tax Breakdown */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="float-right font-medium">₹{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SGST (9%):</span>
                    <span className="float-right font-medium">₹{order.sgst.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CGST (9%):</span>
                    <span className="float-right font-medium">₹{order.cgst.toLocaleString()}</span>
                  </div>
                  <div className="font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="float-right">₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expected Delivery */}
              {order.expectedDelivery && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Expected Delivery:</span>
                  <span className="font-medium">{order.expectedDelivery.toLocaleDateString('en-IN')}</span>
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
                {order.status === "SENT" && (
                  <Button variant="success" size="sm">
                    Create GR
                  </Button>
                )}
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
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create New PO
          </Button>
        </Card>
      )}
    </div>
  );
};

export default PurchaseOrders;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Mail, Phone, MapPin, Edit, Eye, Trash2 } from "lucide-react";
import { Supplier } from "@/types/inventory";

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - in real app this would come from API
  const [suppliers] = useState<Supplier[]>([
    {
      id: "1",
      name: "ABC Stationery Supplies",
      contactPerson: "Rajesh Kumar",
      email: "rajesh@abcstationery.com",
      phone: "+91 98765 43210",
      address: "123 Business Park, Andheri East, Mumbai, Maharashtra 400069",
      gstNumber: "27ABCDE1234F1Z5",
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      name: "Tech Solutions India",
      contactPerson: "Priya Sharma",
      email: "priya@techsolutions.in",
      phone: "+91 87654 32109",
      address: "456 Tech Hub, Electronic City, Bangalore, Karnataka 560100",
      gstNumber: "29XYZAB5678G2H3",
      createdAt: new Date("2024-01-02"),
    },
    {
      id: "3",
      name: "Print Solutions Ltd",
      contactPerson: "Amit Patel",
      email: "amit@printsolutions.com",
      phone: "+91 76543 21098",
      address: "789 Industrial Area, Sector 18, Gurgaon, Haryana 122015",
      gstNumber: "06PQRST9876K3L4",
      createdAt: new Date("2024-01-03"),
    },
    {
      id: "4",
      name: "Green Office Supplies",
      contactPerson: "Sunita Reddy",
      email: "sunita@greenoffice.co.in",
      phone: "+91 65432 10987",
      address: "321 Eco Plaza, Banjara Hills, Hyderabad, Telangana 500034",
      gstNumber: "36MNOPQ4321D5E6",
      createdAt: new Date("2024-01-04"),
    },
  ]);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supplier Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your supplier relationships and contact information.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Supplier
        </Button>
      </div>

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
          <Button variant="outline">Export List</Button>
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
                  Added on {supplier.createdAt.toLocaleDateString('en-IN')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" className="gap-1" onClick={() => {
                  if (confirm(`Are you sure you want to delete supplier ${supplier.name}?`)) {
                    // In a real app, this would call API to delete
                    console.log('Delete supplier:', supplier.id);
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
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Supplier
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Suppliers;
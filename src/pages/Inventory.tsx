import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, Eye, Edit, Minus } from "lucide-react";
import { InventoryItem } from "@/types/inventory";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - in real app this would come from API
  const [inventoryItems] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Office Paper A4",
      sku: "PPR-A4-001",
      description: "Premium quality A4 printing paper",
      category: "Office Supplies",
      currentStock: 150,
      minStock: 50,
      maxStock: 500,
      unitPrice: 250,
      unit: "pack",
      supplier: "ABC Stationery",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Wireless Mouse",
      sku: "TECH-MS-002",
      description: "Ergonomic wireless optical mouse",
      category: "Technology",
      currentStock: 25,
      minStock: 15,
      maxStock: 100,
      unitPrice: 1200,
      unit: "piece",
      supplier: "Tech Solutions",
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-14"),
    },
    {
      id: "3",
      name: "Printer Ink Cartridge",
      sku: "PRN-INK-003",
      description: "Black ink cartridge for HP printers",
      category: "Technology",
      currentStock: 8,
      minStock: 10,
      maxStock: 50,
      unitPrice: 2500,
      unit: "piece",
      supplier: "Print Solutions",
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-13"),
    },
  ]);

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your stock levels and track inventory movements.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Item
        </Button>
      </div>

      {/* Search and Filters */}
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
          <Button variant="outline">Filter</Button>
        </div>
      </Card>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item.currentStock, item.minStock);
          return (
            <Card key={item.id} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <div className="space-y-4">
                {/* Header */}
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

                {/* Stock Info */}
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
                    <span className="font-semibold">₹{item.unitPrice}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  {getStockBadge(stockStatus)}
                  <span className="text-sm text-muted-foreground">
                    Value: ₹{(item.currentStock * item.unitPrice).toLocaleString()}
                  </span>
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
                  <Button variant="accent" size="sm" className="flex-1 gap-1">
                    <Minus className="w-4 h-4" />
                    Use
                  </Button>
                </div>
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

export default Inventory;
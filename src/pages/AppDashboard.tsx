import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, FileText, Users, TrendingUp, AlertCircle, Plus, ArrowRight, Download } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const AppDashboard = () => {
  const navigate = useNavigate();
  const { items, purchaseOrders, suppliers, goodsReceipts, proformaInvoices } = useApp();

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalSuppliers = suppliers.length;
    const activePurchaseOrders = purchaseOrders.filter(
      po => po.status !== 'CANCELLED' && po.status !== 'RECEIVED'
    ).length;
    const lowStockItems = items.filter(
      item => item.currentStock <= item.minStock
    );

    return {
      totalItems,
      totalSuppliers,
      activePurchaseOrders,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.slice(0, 10), // Top 10 low stock items
    };
  }, [items, purchaseOrders, suppliers]);

  const recentActivity = useMemo(() => {
    const activities = [];
    
    // Get recent POs (last 5)
    const recentPOs = [...purchaseOrders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    
    recentPOs.forEach(po => {
      activities.push({
        type: 'PO',
        description: `Purchase Order ${po.poNumber} - ${po.supplier.name}`,
        date: po.date,
      });
    });

    // Get recent GRs (last 5)
    const recentGRs = [...goodsReceipts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    
    recentGRs.forEach(gr => {
      activities.push({
        type: 'GR',
        description: `Goods Receipt ${gr.grNumber} - ${gr.supplier.name}`,
        date: gr.date,
      });
    });

    // Get recent Proforma Invoices
    const recentPIs = [...proformaInvoices]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2);
    
    recentPIs.forEach(pi => {
      activities.push({
        type: 'PI',
        description: `Proforma Invoice ${pi.proformaNumber} - ${pi.buyerInfo.name}`,
        date: pi.date,
      });
    });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [purchaseOrders, goodsReceipts, proformaInvoices]);

  const exportLowStockItems = () => {
    const csvContent = [
      ['Item Name', 'Description', 'Category', 'Current Stock', 'Min Stock', 'Stock %', 'Status'].join(','),
      ...stats.lowStockItems.map(item => {
        const stockPercentage = ((item.currentStock / item.minStock) * 100).toFixed(0);
        const isCritical = item.currentStock < item.minStock * 0.5;
        return [
          `"${item.name}"`,
          `"${item.description || ''}"`,
          `"${item.category}"`,
          `${item.currentStock} ${item.unit}`,
          `${item.minStock} ${item.unit}`,
          `${stockPercentage}%`,
          isCritical ? 'Critical' : 'Low'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `low-stock-items-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: "Success", description: "Low stock items exported successfully!" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your inventory management system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Items in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePurchaseOrders}</div>
            <p className="text-xs text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">Registered suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items need restock</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Items Section */}
      {stats.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Low Stock Items</span>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{stats.lowStockCount} Items</Badge>
                <Button variant="outline" size="sm" onClick={exportLowStockItems}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead className="text-right">Stock %</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.lowStockItems.map((item) => {
                  const stockPercentage = ((item.currentStock / item.minStock) * 100).toFixed(0);
                  const isCritical = item.currentStock < item.minStock * 0.5;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.description || '-'}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">{item.currentStock} {item.unit}</TableCell>
                      <TableCell className="text-right">{item.minStock} {item.unit}</TableCell>
                      <TableCell className="text-right">{stockPercentage}%</TableCell>
                      <TableCell>
                        <Badge variant={isCritical ? "destructive" : "secondary"}>
                          {isCritical ? "Critical" : "Low"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No recent activity to display
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start justify-between border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="ml-2">
                      {activity.type === 'PO' && <ShoppingCart className="h-4 w-4 text-muted-foreground" />}
                      {activity.type === 'GR' && <FileText className="h-4 w-4 text-muted-foreground" />}
                      {activity.type === 'PI' && <FileText className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/inventory')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Inventory Item
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/purchase-orders')}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Create Purchase Order
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/goods-receipt')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Record Goods Receipt
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/proforma')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Proforma Invoice
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/suppliers')}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Suppliers
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppDashboard;

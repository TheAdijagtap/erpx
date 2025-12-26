import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, FileText, Users, TrendingUp, AlertCircle, Plus, ArrowRight, Download, DollarSign } from "lucide-react";
import { useData } from "@/store/SupabaseDataContext";
import { useMemo, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AppDashboard = memo(() => {
  const navigate = useNavigate();
  const { inventoryItems: items, purchaseOrders, goodsReceipts, proformaInvoices } = useData();

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalInventoryValue = items.reduce(
      (sum, item) => sum + (item.currentStock * item.unitPrice),
      0
    );
    const activePurchaseOrders = purchaseOrders.filter(
      po => po.status !== 'CANCELLED' && po.status !== 'RECEIVED'
    ).length;
    const lowStockItems = items.filter(
      item => item.currentStock <= item.minStock
    );

    return {
      totalItems,
      totalInventoryValue,
      activePurchaseOrders,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.slice(0, 10), // Top 10 low stock items
    };
  }, [items, purchaseOrders]);

  // Generate monthly purchase vs sales data
  const chartData = useMemo(() => {
    const months: { [key: string]: { name: string; purchases: number; sales: number } } = {};
    
    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('en-IN', { month: 'short' });
      months[key] = { name: monthName, purchases: 0, sales: 0 };
    }

    // Sum purchases from purchase orders
    purchaseOrders.forEach(po => {
      const date = new Date(po.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].purchases += po.total;
      }
    });

    // Sum sales from proforma invoices
    proformaInvoices.forEach(pi => {
      const date = new Date(pi.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].sales += pi.total;
      }
    });

    return Object.values(months);
  }, [purchaseOrders, proformaInvoices]);

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

  const exportLowStockItems = useCallback(() => {
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
  }, [stats.lowStockItems]);

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
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Items in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePurchaseOrders}</div>
            <p className="text-xs text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(stats.totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">Overall inventory price</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items need restock</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase vs Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            Purchase vs Sales Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => formatINR(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="purchases" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2 }}
                  name="Purchases"
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2 }}
                  name="Sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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
                      {activity.type === 'PO' && (
                        <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                          <ShoppingCart className="h-3 w-3 text-orange-600" />
                        </div>
                      )}
                      {activity.type === 'GR' && (
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                      {activity.type === 'PI' && (
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                          <FileText className="h-3 w-3 text-green-600" />
                        </div>
                      )}
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
              <Plus className="mr-2 h-4 w-4 text-blue-600" />
              Add New Inventory Item
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/purchase-orders')}
            >
              <ShoppingCart className="mr-2 h-4 w-4 text-orange-600" />
              Create Purchase Order
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/goods-receipt')}
            >
              <FileText className="mr-2 h-4 w-4 text-purple-600" />
              Record Goods Receipt
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/proforma')}
            >
              <FileText className="mr-2 h-4 w-4 text-green-600" />
              Generate Proforma Invoice
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/suppliers')}
            >
              <Users className="mr-2 h-4 w-4 text-cyan-600" />
              Manage Suppliers
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

AppDashboard.displayName = "AppDashboard";

export default AppDashboard;

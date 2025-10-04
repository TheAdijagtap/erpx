import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, FileText, Users, TrendingUp, AlertCircle } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { useMemo } from "react";

const AppDashboard = () => {
  const { items, purchaseOrders, suppliers, goodsReceipts, proformaInvoices } = useApp();

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalSuppliers = suppliers.length;
    const activePurchaseOrders = purchaseOrders.filter(
      po => po.status !== 'CANCELLED' && po.status !== 'RECEIVED'
    ).length;
    const lowStockItems = items.filter(
      item => item.currentStock <= item.minStock
    ).length;

    return {
      totalItems,
      totalSuppliers,
      activePurchaseOrders,
      lowStockItems,
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
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need restock</p>
          </CardContent>
        </Card>
      </div>

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
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Use the navigation menu to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Add new inventory items</li>
              <li>Create purchase orders</li>
              <li>Manage suppliers</li>
              <li>Generate proforma invoices</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppDashboard;

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, TrendingDown, AlertTriangle, ShoppingCart, FileText } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { formatINR } from "@/lib/format";

const Dashboard = () => {
  const { items, transactions, purchaseOrders, goodsReceipts } = useApp();

  // Calculate real analytics from actual data
  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Low stock items (current stock <= min stock)
    const lowStockItems = items.filter(item => item.currentStock <= item.minStock);
    
    // Pending purchase orders (DRAFT and SENT are considered pending)
    const pendingPOs = purchaseOrders.filter(po => po.status === 'DRAFT' || po.status === 'SENT');
    
    // This month's goods receipts
    const thisMonthGRs = goodsReceipts.filter(gr => {
      const grDate = new Date(gr.date);
      return grDate.getMonth() === currentMonth && grDate.getFullYear() === currentYear;
    });
    
    // Previous month for comparison
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthGRs = goodsReceipts.filter(gr => {
      const grDate = new Date(gr.date);
      return grDate.getMonth() === lastMonth && grDate.getFullYear() === lastMonthYear;
    });
    
    // Calculate changes
    const grChange = lastMonthGRs.length > 0 
      ? Math.round(((thisMonthGRs.length - lastMonthGRs.length) / lastMonthGRs.length) * 100)
      : thisMonthGRs.length > 0 ? 100 : 0;
    
    return {
      totalItems: items.length,
      lowStockCount: lowStockItems.length,
      pendingPOsCount: pendingPOs.length,
      thisMonthGRsCount: thisMonthGRs.length,
      grChange,
      lowStockItems,
      totalInventoryValue: items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0)
    };
  }, [items, purchaseOrders, goodsReceipts]);

  // Recent transactions (last 10)
  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(transaction => {
        const item = items.find(i => i.id === transaction.itemId);
        return {
          ...transaction,
          itemName: item?.name || 'Unknown Item'
        };
      });
  }, [transactions, items]);

  const stats = [
    {
      title: "Total Items",
      value: analytics.totalItems.toString(),
      change: `Value: ${formatINR(analytics.totalInventoryValue)}`,
      changeType: "positive" as const,
      icon: Package,
    },
    {
      title: "Low Stock Items",
      value: analytics.lowStockCount.toString(),
      change: analytics.lowStockCount > 0 ? "Needs attention" : "All good",
      changeType: analytics.lowStockCount > 0 ? "negative" as const : "positive" as const,
      icon: AlertTriangle,
    },
    {
      title: "Pending POs",
      value: analytics.pendingPOsCount.toString(),
      change: analytics.pendingPOsCount > 0 ? "Awaiting delivery" : "No pending orders",
      changeType: "positive" as const,
      icon: ShoppingCart,
    },
    {
      title: "This Month GR",
      value: analytics.thisMonthGRsCount.toString(),
      change: analytics.grChange > 0 ? `+${analytics.grChange}%` : analytics.grChange < 0 ? `${analytics.grChange}%` : "No change",
      changeType: analytics.grChange >= 0 ? "positive" as const : "negative" as const,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your inventory.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                  <div className={`flex items-center mt-2 text-sm ${
                    stat.changeType === "positive" ? "text-success" : "text-destructive"
                  }`}>
                    {stat.changeType === "positive" ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="p-3 bg-primary-light rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{transaction.itemName}</p>
                  <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString('en-IN')}</p>
                  {transaction.reason && (
                    <p className="text-xs text-muted-foreground">{transaction.reason}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === "IN" 
                      ? "bg-success-light text-success" 
                      : "bg-accent-light text-accent"
                  }`}>
                    {transaction.type === "IN" ? "+" : "-"}{transaction.quantity}
                  </span>
                  {transaction.totalValue && (
                    <p className="text-xs text-muted-foreground mt-1">{formatINR(transaction.totalValue)}</p>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center text-muted-foreground py-4">
                <p>No transactions yet</p>
                <p className="text-xs">Start by creating goods receipts or inventory transactions</p>
              </div>
            )}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Low Stock Alerts</h3>
            <Button variant="outline" size="sm">Manage Stock</Button>
          </div>
          <div className="space-y-3">
            {analytics.lowStockItems.length > 0 ? analytics.lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Min: {item.minStock} {item.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-destructive">
                    {item.currentStock} {item.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">Current stock</p>
                  <p className="text-xs text-muted-foreground">
                    Value: {formatINR(item.currentStock * item.unitPrice)}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center text-muted-foreground py-4">
                <p>No low stock items</p>
                <p className="text-xs">All items are above minimum stock levels</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, TrendingDown, AlertTriangle, ShoppingCart, FileText } from "lucide-react";

const Dashboard = () => {
  // Mock data - in real app this would come from API
  const stats = [
    {
      title: "Total Items",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Package,
    },
    {
      title: "Low Stock Items",
      value: "23",
      change: "+5",
      changeType: "negative" as const,
      icon: AlertTriangle,
    },
    {
      title: "Pending POs",
      value: "8",
      change: "-2",
      changeType: "positive" as const,
      icon: ShoppingCart,
    },
    {
      title: "This Month GR",
      value: "45",
      change: "+18%",
      changeType: "positive" as const,
      icon: FileText,
    },
  ];

  const recentTransactions = [
    { id: "1", item: "Office Paper A4", type: "IN", quantity: 100, date: "2024-01-15" },
    { id: "2", item: "Wireless Mouse", type: "OUT", quantity: 5, date: "2024-01-14" },
    { id: "3", item: "Printer Ink Cartridge", type: "IN", quantity: 20, date: "2024-01-13" },
    { id: "4", item: "USB Flash Drive", type: "OUT", quantity: 3, date: "2024-01-12" },
  ];

  const lowStockItems = [
    { id: "1", name: "Office Paper A4", currentStock: 15, minStock: 50, unit: "packs" },
    { id: "2", name: "Printer Ink Cartridge", currentStock: 2, minStock: 10, unit: "pieces" },
    { id: "3", name: "Wireless Mouse", currentStock: 3, minStock: 15, unit: "pieces" },
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
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{transaction.item}</p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === "IN" 
                      ? "bg-success-light text-success" 
                      : "bg-accent-light text-accent"
                  }`}>
                    {transaction.type === "IN" ? "+" : "-"}{transaction.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Low Stock Alerts</h3>
            <Button variant="outline" size="sm">Manage Stock</Button>
          </div>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Min: {item.minStock} {item.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-destructive">
                    {item.currentStock} {item.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">Current stock</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
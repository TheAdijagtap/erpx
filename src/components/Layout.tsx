import { Outlet, NavLink } from "react-router-dom";
import { Package, ShoppingCart, FileText, Users, Building, BarChart3, Receipt, Trash2, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

const Layout = () => {
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
    { name: "Goods Receipt", href: "/goods-receipt", icon: FileText },
    { name: "Proforma Invoice", href: "/proforma", icon: Receipt },
    { name: "Scrap Notes", href: "/scrap-notes", icon: Trash2 },
    { name: "Price Tracker", href: "/price-tracker", icon: LineChart },
    { name: "Suppliers", href: "/suppliers", icon: Users },
    { name: "Business Setup", href: "/business", icon: Building },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border shadow-[0_1px_3px_hsl(217_33%_17%_/_0.08)]">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-sidebar-border flex items-center justify-center">
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fc53d55d6e77f4fc3a0917324bbf678cd%2F327ce537ca7a4e5bb4b15a6a6569900e?format=webp&width=800" alt="CORS Logo" className="h-10 object-contain" />
          </div>
          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 px-3 pt-6 pb-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-[var(--transition-fast)]",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )
                  }
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8 bg-background min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

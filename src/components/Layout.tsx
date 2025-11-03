import { Outlet, NavLink } from "react-router-dom";
import { Package, ShoppingCart, FileText, Users, Building, BarChart3, Receipt, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Layout = () => {
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
    { name: "Goods Receipt", href: "/goods-receipt", icon: FileText },
    { name: "Proforma Invoice", href: "/proforma", icon: Receipt },
    { name: "Scrap Notes", href: "/scrap-notes", icon: Trash2 },
    { name: "Suppliers", href: "/suppliers", icon: Users },
    { name: "Business Setup", href: "/business", icon: Building },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-[var(--shadow-card)]">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="px-6 py-4 border-b flex items-center justify-center">
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fc53d55d6e77f4fc3a0917324bbf678cd%2F412d48dbf4c849de93f6467e12198818?format=webp&width=800" alt="CORS Logo" className="h-12 object-contain" />
          </div>
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 pt-6 pb-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-[var(--transition-fast)]",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

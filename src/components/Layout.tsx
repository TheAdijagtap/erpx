import { Outlet, NavLink } from "react-router-dom";
import { Package, ShoppingCart, FileText, Users, Building, BarChart3, Receipt, LogOut, Shield, HelpCircle, UserCheck, CalendarDays, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/store/SupabaseDataContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TrialBanner, TrialStatusBadge, TrialExpiredOverlay, calculateTrialStatus } from "@/components/TrialBanner";

const WHATSAPP_NUMBER = "919373751128";

// Map route paths to feature keys for permission checking
const ROUTE_TO_FEATURE: Record<string, string> = {
  
  "/inventory": "inventory",
  "/purchase-orders": "purchase-orders",
  "/goods-receipt": "goods-receipt",
  "/proforma": "proforma",
  "/suppliers": "suppliers",
  "/employees": "employees",
  "/attendance": "attendance",
  "/leaves": "leaves",
  "/payroll": "payroll",
  "/business": "business",
};

const Layout = () => {
  const { user, signOut } = useAuth();
  const { trialStartDate, subscriptionEndDate, isSubUser, subUserPermissions } = useData();
  const { isExpired } = calculateTrialStatus(trialStartDate, subscriptionEndDate);
  const { isAdmin } = useAdminCheck();

  const allNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
    { name: "Goods Receipt", href: "/goods-receipt", icon: FileText },
    { name: "Proforma Invoice", href: "/proforma", icon: Receipt },
    { name: "Suppliers", href: "/suppliers", icon: Users },
    { name: "Employees", href: "/employees", icon: UserCheck },
    { name: "Attendance", href: "/attendance", icon: CalendarDays },
    { name: "Leave Mgmt", href: "/leaves", icon: CalendarDays },
    { name: "Payroll", href: "/payroll", icon: IndianRupee },
    { name: "Business Setup", href: "/business", icon: Building },
    ...(isAdmin ? [{ name: "Admin Panel", href: "/admin", icon: Shield }] : []),
  ];

  // Filter navigation based on sub-user permissions
  // Dashboard is always accessible for sub-users
  const navigation = isSubUser
    ? allNavigation.filter(item => {
        if (item.href === "/dashboard") return true; // Always show dashboard
        const featureKey = ROUTE_TO_FEATURE[item.href];
        return featureKey ? subUserPermissions.includes(featureKey) : false;
      })
    : allNavigation;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const handleSubscribe = () => {
    const message = encodeURIComponent(
      "Hi! I would like to subscribe to OPIS app. Please share the subscription details."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Trial expired overlay */}
      {isExpired && <TrialExpiredOverlay />}
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="px-5 py-4 border-b border-sidebar-border flex items-center justify-center">
            <img src="/assets/opis-logo.png" alt="OPIS Logo" className="h-8 object-contain" />
          </div>
          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 px-2 pt-4 pb-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 text-[13px] font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )
                  }
                >
                  <Icon className="mr-2.5 h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
          
          {/* User section */}
          <div className="px-3 pb-3 border-t border-sidebar-border pt-3">
            <div className="px-2 mb-2">
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <TrialStatusBadge trialStartDate={trialStartDate} subscriptionEndDate={subscriptionEndDate} />
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const message = encodeURIComponent("Hi! I need support with OPIS app.");
                  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
                }}
                className="flex-1 justify-center text-muted-foreground hover:text-foreground h-8 text-xs"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex-1 justify-center text-muted-foreground hover:text-foreground h-8 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-60">
        {/* Trial warning banner */}
        <TrialBanner trialStartDate={trialStartDate} subscriptionEndDate={subscriptionEndDate} onSubscribe={handleSubscribe} />
        
        <main className="p-6 bg-background min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

import { Outlet, NavLink } from "react-router-dom";
import { Package, ShoppingCart, FileText, Users, Building, BarChart3, Receipt, LogOut, Shield, HelpCircle, TreePine, Gift, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/store/SupabaseDataContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TrialBanner, TrialStatusBadge, TrialExpiredOverlay, calculateTrialStatus } from "@/components/TrialBanner";
import Snowfall from "@/components/Snowfall";

const WHATSAPP_NUMBER = "919373751128";

const Layout = () => {
  const { user, signOut } = useAuth();
  const { trialStartDate, subscriptionEndDate } = useData();
  const { isExpired } = calculateTrialStatus(trialStartDate, subscriptionEndDate);
  const { isAdmin } = useAdminCheck();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
    { name: "Goods Receipt", href: "/goods-receipt", icon: FileText },
    { name: "Proforma Invoice", href: "/proforma", icon: Receipt },
    { name: "Suppliers", href: "/suppliers", icon: Users },
    { name: "Business Setup", href: "/business", icon: Building },
    ...(isAdmin ? [{ name: "Admin Panel", href: "/admin", icon: Shield }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const handleSubscribe = () => {
    const message = encodeURIComponent(
      "Hi! I would like to subscribe to CORS Inventory app. Please share the subscription details."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Christmas Snowfall Effect */}
      <Snowfall />
      
      {/* Christmas Banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-red-600 via-green-600 to-red-600 text-white py-2 px-4 text-center">
        <div className="flex items-center justify-center gap-3 text-sm font-medium">
          <TreePine className="w-4 h-4 animate-pulse" />
          <Gift className="w-3 h-3" />
          <span>🎄 Merry Christmas & Happy New Year 2025! 🎅</span>
          <Gift className="w-3 h-3" />
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      </div>

      {/* Trial expired overlay */}
      {isExpired && <TrialExpiredOverlay />}
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border shadow-[0_1px_3px_hsl(217_33%_17%_/_0.08)] pt-10">
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
          
          {/* User section */}
          <div className="px-3 pb-4 border-t border-sidebar-border pt-4">
            <div className="px-3 mb-3 space-y-2">
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <TrialStatusBadge trialStartDate={trialStartDate} subscriptionEndDate={subscriptionEndDate} />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const message = encodeURIComponent("Hi! I need support with CORS Inventory app.");
                  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
                }}
                className="justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Support
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open("mailto:necrus@yahoo.com?subject=Help Request - CORS Inventory", "_blank")}
                  className="flex-1 justify-start text-muted-foreground hover:text-foreground"
                >
                  <HelpCircle className="mr-3 h-4 w-4" />
                  Help
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex-1 justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64 pt-10">
        {/* Trial warning banner */}
        <TrialBanner trialStartDate={trialStartDate} subscriptionEndDate={subscriptionEndDate} onSubscribe={handleSubscribe} />
        
        <main className="p-8 bg-background min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

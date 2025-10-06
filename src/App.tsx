import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AppDashboard from "./pages/AppDashboard";
import Inventory from "./pages/Inventory";
import PurchaseOrders from "./pages/PurchaseOrders";
import GoodsReceiptPage from "./pages/GoodsReceipt";
import Suppliers from "./pages/Suppliers";
import BusinessSetup from "./pages/BusinessSetup";
import ProformaInvoice from "./pages/ProformaInvoice";
import CRM from "./pages/CRM";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AppProvider } from "./store/AppContext";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Homepage - redirect to dashboard if logged in */}
            <Route index element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />
            
            {/* Protected app routes with sidebar */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AppDashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="goods-receipt" element={<GoodsReceiptPage />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="proforma" element={<ProformaInvoice />} />
              <Route path="crm" element={<CRM />} />
              <Route path="business" element={<BusinessSetup />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

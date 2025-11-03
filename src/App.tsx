import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AppDashboard from "./pages/AppDashboard";
import Inventory from "./pages/Inventory";
import PurchaseOrders from "./pages/PurchaseOrders";
import GoodsReceiptPage from "./pages/GoodsReceipt";
import Suppliers from "./pages/Suppliers";
import BusinessSetup from "./pages/BusinessSetup";
import ProformaInvoice from "./pages/ProformaInvoice";
import ScrapNotes from "./pages/ScrapNotes";
import NotFound from "./pages/NotFound";
import { AppProvider } from "./store/AppContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes with sidebar */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<AppDashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/purchase-orders" element={<PurchaseOrders />} />
                <Route path="/goods-receipt" element={<GoodsReceiptPage />} />
                <Route path="/proforma" element={<ProformaInvoice />} />
                <Route path="/scrap-notes" element={<ScrapNotes />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/business" element={<BusinessSetup />} />
              </Route>
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

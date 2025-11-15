import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AppDashboard from "./pages/AppDashboard";
import Inventory from "./pages/Inventory";
import PurchaseOrders from "./pages/PurchaseOrders";
import GoodsReceiptPage from "./pages/GoodsReceipt";
import Suppliers from "./pages/Suppliers";
import BusinessSetup from "./pages/BusinessSetup";
import ProformaInvoice from "./pages/ProformaInvoice";
import ScrapNote from "./pages/ScrapNote";
import PriceTracker from "./pages/PriceTracker";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
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
            <Route path="/login" element={<Login />} />
            <Route index element={<Dashboard />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AppDashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="goods-receipt" element={<GoodsReceiptPage />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="proforma" element={<ProformaInvoice />} />
              <Route path="scrap-notes" element={<ScrapNote />} />
              <Route path="price-tracker" element={<PriceTracker />} />
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

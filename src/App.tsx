import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./store/SupabaseDataContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load heavy pages for faster initial load
const AppDashboard = lazy(() => import("./pages/AppDashboard"));
const Inventory = lazy(() => import("./pages/Inventory"));
const PurchaseOrders = lazy(() => import("./pages/PurchaseOrders"));
const GoodsReceiptPage = lazy(() => import("./pages/GoodsReceipt"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const BusinessSetup = lazy(() => import("./pages/BusinessSetup"));
const ProformaInvoice = lazy(() => import("./pages/ProformaInvoice"));
const PriceTracker = lazy(() => import("./pages/PriceTracker"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

// Optimized QueryClient with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Simple loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="auth" element={<Auth />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <DataProvider>
                  <Layout />
                </DataProvider>
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={
                <Suspense fallback={<PageLoader />}>
                  <AppDashboard />
                </Suspense>
              } />
              <Route path="inventory" element={
                <Suspense fallback={<PageLoader />}>
                  <Inventory />
                </Suspense>
              } />
              <Route path="purchase-orders" element={
                <Suspense fallback={<PageLoader />}>
                  <PurchaseOrders />
                </Suspense>
              } />
              <Route path="goods-receipt" element={
                <Suspense fallback={<PageLoader />}>
                  <GoodsReceiptPage />
                </Suspense>
              } />
              <Route path="suppliers" element={
                <Suspense fallback={<PageLoader />}>
                  <Suppliers />
                </Suspense>
              } />
              <Route path="proforma" element={
                <Suspense fallback={<PageLoader />}>
                  <ProformaInvoice />
                </Suspense>
              } />
              <Route path="price-tracker" element={
                <Suspense fallback={<PageLoader />}>
                  <PriceTracker />
                </Suspense>
              } />
              <Route path="business" element={
                <Suspense fallback={<PageLoader />}>
                  <BusinessSetup />
                </Suspense>
              } />
              <Route path="admin" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminPanel />
                </Suspense>
              } />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
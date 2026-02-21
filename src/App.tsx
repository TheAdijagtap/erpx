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

// Lazy load pages with preloading capability
const appDashboardImport = () => import("./pages/AppDashboard");
const inventoryImport = () => import("./pages/Inventory");
const purchaseOrdersImport = () => import("./pages/PurchaseOrders");
const goodsReceiptImport = () => import("./pages/GoodsReceipt");
const suppliersImport = () => import("./pages/Suppliers");
const businessSetupImport = () => import("./pages/BusinessSetup");
const proformaInvoiceImport = () => import("./pages/ProformaInvoice");
const adminPanelImport = () => import("./pages/AdminPanel");
const employeesImport = () => import("./pages/Employees");
const attendanceImport = () => import("./pages/Attendance");
const leaveManagementImport = () => import("./pages/LeaveManagement");
const payrollImport = () => import("./pages/Payroll");

const AppDashboard = lazy(appDashboardImport);
const Inventory = lazy(inventoryImport);
const PurchaseOrders = lazy(purchaseOrdersImport);
const GoodsReceiptPage = lazy(goodsReceiptImport);
const Suppliers = lazy(suppliersImport);
const BusinessSetup = lazy(businessSetupImport);
const ProformaInvoice = lazy(proformaInvoiceImport);
const AdminPanel = lazy(adminPanelImport);
const EmployeesPage = lazy(employeesImport);
const AttendancePage = lazy(attendanceImport);
const LeaveManagementPage = lazy(leaveManagementImport);
const PayrollPage = lazy(payrollImport);

// Preload all pages immediately for instant navigation
export const preloadAllPages = () => {
  appDashboardImport();
  inventoryImport();
  purchaseOrdersImport();
  goodsReceiptImport();
  suppliersImport();
  businessSetupImport();
  proformaInvoiceImport();
  adminPanelImport();
  employeesImport();
  attendanceImport();
  leaveManagementImport();
  payrollImport();
};

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
              <Route path="employees" element={
                <Suspense fallback={<PageLoader />}>
                  <EmployeesPage />
                </Suspense>
              } />
              <Route path="attendance" element={
                <Suspense fallback={<PageLoader />}>
                  <AttendancePage />
                </Suspense>
              } />
              <Route path="leaves" element={
                <Suspense fallback={<PageLoader />}>
                  <LeaveManagementPage />
                </Suspense>
              } />
              <Route path="payroll" element={
                <Suspense fallback={<PageLoader />}>
                  <PayrollPage />
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
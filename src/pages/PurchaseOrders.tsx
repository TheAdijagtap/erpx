import { useMemo, useState, memo, useCallback } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Eye, Edit, Printer, Trash2, Download } from "lucide-react";
import { useData } from "@/store/SupabaseDataContext";
import { downloadAsPdf } from "@/lib/downloadPdf";
import { formatDateIN, formatINR } from "@/lib/format";
import { printElementById } from "@/lib/print";
import { numberToWords } from "@/lib/numberToWords";
import { escapeHtml } from "@/lib/htmlEscape";
import { useDebounce } from "@/hooks/useDebounce";

interface PurchaseAggregateRow {
  key: string;
  label: string;
  total: number;
  count: number;
}

interface PurchaseOrderStatsSummary {
  totalOrders: number;
  totalValue: number;
  averageValue: number;
  pendingCount: number;
  pendingValue: number;
  receivedCount: number;
  receivedValue: number;
  uniqueSuppliers: number;
  monthlyTotals: PurchaseAggregateRow[];
  yearlyTotals: PurchaseAggregateRow[];
}

const isValidHsn = (value?: string) => {
  const v = (value ?? "").trim();
  return v.length > 0 && /^\d+$/.test(v);
};

const PurchaseOrders = () => {
  const { purchaseOrders } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "insights">("orders");

  const stats = useMemo<PurchaseOrderStatsSummary>(() => {
    const base: PurchaseOrderStatsSummary = {
      totalOrders: purchaseOrders.length,
      totalValue: 0,
      averageValue: 0,
      pendingCount: 0,
      pendingValue: 0,
      receivedCount: 0,
      receivedValue: 0,
      uniqueSuppliers: 0,
      monthlyTotals: [],
      yearlyTotals: [],
    };

    if (purchaseOrders.length === 0) {
      return base;
    }

    const supplierIds = new Set<string>();
    const monthlyMap = new Map<string, { year: number; month: number; total: number; count: number }>();
    const yearlyMap = new Map<number, { total: number; count: number }>();
    const pendingStatuses = new Set(["DRAFT", "SENT", "PARTIAL"]);

    purchaseOrders.forEach((order) => {
      const orderTotal = order.total ?? 0;
      base.totalValue += orderTotal;
      supplierIds.add(order.supplierId);

      if (order.status === "RECEIVED") {
        base.receivedCount += 1;
        base.receivedValue += orderTotal;
      } else if (pendingStatuses.has(order.status)) {
        base.pendingCount += 1;
        base.pendingValue += orderTotal;
      }

      const orderDate = order.date instanceof Date ? order.date : new Date(order.date);
      if (Number.isNaN(orderDate.getTime())) {
        return;
      }

      const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      const monthEntry = monthlyMap.get(monthKey) ?? {
        year: orderDate.getFullYear(),
        month: orderDate.getMonth(),
        total: 0,
        count: 0,
      };
      monthEntry.total += orderTotal;
      monthEntry.count += 1;
      monthlyMap.set(monthKey, monthEntry);

      const yearEntry = yearlyMap.get(orderDate.getFullYear()) ?? { total: 0, count: 0 };
      yearEntry.total += orderTotal;
      yearEntry.count += 1;
      yearlyMap.set(orderDate.getFullYear(), yearEntry);
    });

    base.uniqueSuppliers = supplierIds.size;
    base.averageValue = base.totalOrders ? base.totalValue / base.totalOrders : 0;

    base.monthlyTotals = Array.from(monthlyMap.values())
      .sort((a, b) => {
        const aDate = new Date(a.year, a.month, 1).getTime();
        const bDate = new Date(b.year, b.month, 1).getTime();
        return bDate - aDate;
      })
      .map((entry) => ({
        key: `${entry.year}-${entry.month}`,
        label: format(new Date(entry.year, entry.month, 1), "MMM yyyy"),
        total: entry.total,
        count: entry.count,
      }));

    base.yearlyTotals = Array.from(yearlyMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, entry]) => ({
        key: String(year),
        label: String(year),
        total: entry.total,
        count: entry.count,
      }));

    return base;
  }, [purchaseOrders]);

  const monthlyInsights = stats.monthlyTotals.slice(0, 12);
  const yearlyInsights = stats.yearlyTotals;

  const selectedMonthStats = useMemo(() => {
    if (!selectedMonth || monthlyInsights.length === 0) return null;
    return monthlyInsights.find((m) => m.key === selectedMonth) ?? null;
  }, [selectedMonth, monthlyInsights]);

  const monthlyOrdersFiltered = useMemo(() => {
    if (!selectedMonth) return purchaseOrders;
    const [yearStr, monthStr] = selectedMonth.split("-");
    const targetYear = parseInt(yearStr, 10);
    const targetMonth = parseInt(monthStr, 10);
    return purchaseOrders.filter((order) => {
      const orderDate = order.date instanceof Date ? order.date : new Date(order.date);
      return orderDate.getFullYear() === targetYear && orderDate.getMonth() === targetMonth;
    });
  }, [selectedMonth, purchaseOrders]);

  const monthlyStats = useMemo(() => {
    if (!selectedMonthStats) {
      return [
        {
          label: "Total Spend",
          value: formatINR(stats.totalValue),
          description: `${stats.totalOrders} ${stats.totalOrders === 1 ? "order" : "orders"} from ${stats.uniqueSuppliers} ${stats.uniqueSuppliers === 1 ? "supplier" : "suppliers"}`,
        },
        {
          label: "Average Order Value",
          value: formatINR(stats.averageValue),
          description: stats.totalOrders ? "Based on all purchase orders" : "Add purchase orders to calculate averages",
        },
        {
          label: "Received Orders Value",
          value: formatINR(stats.receivedValue),
          description: `${stats.receivedCount} ${stats.receivedCount === 1 ? "order" : "orders"} received`,
        },
        {
          label: "Pending Orders Value",
          value: formatINR(stats.pendingValue),
          description: `${stats.pendingCount} ${stats.pendingCount === 1 ? "order" : "orders"} in progress`,
        },
      ];
    }

    const monthlyReceived = monthlyOrdersFiltered.filter((o) => o.status === "RECEIVED").reduce((sum, o) => sum + o.total, 0);
    const monthlyPending = monthlyOrdersFiltered.filter((o) => ["DRAFT", "SENT", "PARTIAL"].includes(o.status)).reduce((sum, o) => sum + o.total, 0);
    const monthlyAvg = monthlyOrdersFiltered.length ? selectedMonthStats.total / monthlyOrdersFiltered.length : 0;

    return [
      {
        label: "Total Spend",
        value: formatINR(selectedMonthStats.total),
        description: `${selectedMonthStats.count} ${selectedMonthStats.count === 1 ? "order" : "orders"} in ${selectedMonthStats.label}`,
      },
      {
        label: "Average Order Value",
        value: formatINR(monthlyAvg),
        description: monthlyOrdersFiltered.length ? `Based on ${selectedMonthStats.label} orders` : "No orders this month",
      },
      {
        label: "Received Orders Value",
        value: formatINR(monthlyReceived),
        description: `${monthlyOrdersFiltered.filter((o) => o.status === "RECEIVED").length} orders received`,
      },
      {
        label: "Pending Orders Value",
        value: formatINR(monthlyPending),
        description: `${monthlyOrdersFiltered.filter((o) => ["DRAFT", "SENT", "PARTIAL"].includes(o.status)).length} orders pending`,
      },
    ];
  }, [selectedMonthStats, monthlyOrdersFiltered, stats]);

  const summaryTiles = monthlyStats;

  const filteredOrders = useMemo(() => {
    const baseOrders = selectedMonth ? monthlyOrdersFiltered : purchaseOrders;
    return baseOrders.filter(
      (order) =>
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchaseOrders, selectedMonth, monthlyOrdersFiltered, searchTerm]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and manage purchase orders for your suppliers.
          </p>
        </div>
        <CreatePODialog />
      </div>

      <div className="flex gap-2 sm:gap-4 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-2 px-1 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === "orders"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Purchase Orders
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`pb-2 px-1 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === "insights"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Purchase Insights
        </button>
      </div>

      {activeTab === "orders" ? (
        <PurchaseOrdersTab
          filteredOrders={filteredOrders}
          selectedMonthStats={selectedMonthStats}
        />
      ) : (
        <PurchaseInsightsTab
          stats={stats}
          monthlyInsights={monthlyInsights}
          yearlyInsights={yearlyInsights}
          summaryTiles={summaryTiles}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          filteredOrders={filteredOrders}
          selectedMonthStats={selectedMonthStats}
        />
      )}
    </div>
  );
};

interface PurchaseOrdersTabProps {
  filteredOrders: any[];
  selectedMonthStats: any;
}

function PurchaseOrdersTab({ filteredOrders, selectedMonthStats }: PurchaseOrdersTabProps) {
  const { businessInfo } = useData();
  const [searchTerm, setSearchTerm] = useState("");

  const ordersFiltered = useMemo(() => {
    return filteredOrders.filter(
      (order) =>
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredOrders, searchTerm]);

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by PO number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <ExportPurchaseDataButton
            orders={ordersFiltered}
            monthLabel={selectedMonthStats?.label || "All"}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ordersFiltered.map((order) => (
          <Card key={order.id} className="p-4 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{order.poNumber}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.supplier.name} · {formatDateIN(order.date)}
                  </p>
                </div>
                <div className="p-1.5 bg-primary-light rounded">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Items</p>
                  <p className="text-sm font-semibold">{order.items.length}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Qty</p>
                  <p className="text-sm font-semibold">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total</p>
                  <p className="text-sm font-semibold">{formatINR(order.total)}</p>
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <ViewPODialog id={order.id} />
                <EditPODialog id={order.id} />
                <PrintPOButton id={order.id} />
                <DownloadPOButton id={order.id} />
                <DeletePODialog id={order.id} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {ordersFiltered.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No purchase orders found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Create your first purchase order to get started"}
          </p>
          <CreatePODialog />
        </Card>
      )}
    </div>
  );
}

interface PurchaseInsightsTabProps {
  stats: PurchaseOrderStatsSummary;
  monthlyInsights: PurchaseAggregateRow[];
  yearlyInsights: PurchaseAggregateRow[];
  summaryTiles: any[];
  selectedMonth: string | null;
  setSelectedMonth: (month: string | null) => void;
  filteredOrders: any[];
  selectedMonthStats: any;
}

function PurchaseInsightsTab({
  stats,
  monthlyInsights,
  yearlyInsights,
  summaryTiles,
  selectedMonth,
  setSelectedMonth,
  filteredOrders,
  selectedMonthStats,
}: PurchaseInsightsTabProps) {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">Purchase Insights</h2>
          <p className="text-sm text-muted-foreground">
            Track your purchasing activity at a glance with totals, averages, and trend breakdowns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportPurchaseDataButton
            orders={filteredOrders}
            monthLabel={selectedMonthStats?.label || "All"}
          />
          {monthlyInsights.length > 0 && (
            <div className="flex items-center gap-3 ml-auto">
              <label className="text-sm font-medium text-muted-foreground">View by Month:</label>
              <Select value={selectedMonth || "all"} onValueChange={(value) => setSelectedMonth(value === "all" ? null : value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All Time</SelectItem>
                  {monthlyInsights.map((month) => (
                    <SelectItem key={month.key} value={month.key}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryTiles.map((tile) => (
          <div key={tile.label} className="rounded-lg border border-border/60 bg-muted/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{tile.label}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{tile.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{tile.description}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Monthly Purchase Amount</h3>
            {monthlyInsights.length > 0 && (
              <span className="text-xs text-muted-foreground">Latest {monthlyInsights.length} months</span>
            )}
          </div>
          {monthlyInsights.length ? (
            <div className="mt-4 space-y-3">
              {monthlyInsights.map((month) => (
                <div key={month.key} className="flex items-center justify-between rounded-md border border-border/60 bg-background px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{month.label}</p>
                    <p className="text-xs text-muted-foreground">{month.count} {month.count === 1 ? "order" : "orders"}</p>
                  </div>
                  <div className="text-sm font-semibold text-foreground">{formatINR(month.total)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Add purchase orders to see monthly trends.</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Yearly Purchase Amount</h3>
          </div>
          {yearlyInsights.length ? (
            <div className="mt-4 space-y-3">
              {yearlyInsights.map((year) => (
                <div key={year.key} className="flex items-center justify-between rounded-md border border-border/60 bg-background px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{year.label}</p>
                    <p className="text-xs text-muted-foreground">{year.count} {year.count === 1 ? "order" : "orders"}</p>
                  </div>
                  <div className="text-sm font-semibold text-foreground">{formatINR(year.total)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Yearly totals will appear once purchases are recorded.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "DRAFT":
      return <Badge className="bg-slate-400 text-slate-900">Draft</Badge>;
    case "SENT":
      return <Badge className="bg-yellow-400 text-yellow-900">Sent</Badge>;
    case "RECEIVED":
      return <Badge className="bg-green-500 text-white">Received</Badge>;
    case "PARTIAL":
      return <Badge className="bg-blue-400 text-blue-900">Partial</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
    default:
      return <Badge className="bg-gray-400 text-gray-900">{status}</Badge>;
  }
}

function CreatePODialog() {
  const { suppliers, inventoryItems: items, addPurchaseOrder, addItem } = useData();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string | null>(suppliers[0]?.id || null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState<string>("30 days from invoice date");
  const [applyGST, setApplyGST] = useState<boolean>(false);
  const [gstRate, setGstRate] = useState<number>(18);
  const [rows, setRows] = useState<Array<{ itemId: string; quantity: number; unitPrice: number; unit: string; hsnCode: string }>>([
    { itemId: items[0]?.id || "", quantity: 1, unitPrice: items[0]?.unitPrice || 0, unit: items[0]?.unit || "PCS", hsnCode: isValidHsn(items[0]?.sku) ? (items[0]?.sku || "") : "" },
  ]);
  const [additionalCharges, setAdditionalCharges] = useState<Array<{ name: string; amount: number }>>([]);
  
  // Quick-add item state
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("PCS");
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemCategory, setNewItemCategory] = useState("");

  const handleQuickAddItem = () => {
    if (!newItemName.trim()) return;
    addItem({
      name: newItemName.trim(),
      sku: "", // HSN is optional; don't auto-fill with a generated SKU
      description: "",
      unit: newItemUnit,
      unitPrice: newItemPrice,
      category: newItemCategory || "General",
      currentStock: 0,
      minStock: 0,
      maxStock: 1000,
    });
    setNewItemName("");
    setNewItemUnit("PCS");
    setNewItemPrice(0);
    setNewItemCategory("");
    setQuickAddOpen(false);
  };
  const [supplierSearch, setSupplierSearch] = useState("");
  const [itemSearches, setItemSearches] = useState<Record<number, string>>({});
  
  // Debounce search for better performance
  const debouncedSupplierSearch = useDebounce(supplierSearch, 150);

  const filteredSuppliers = useMemo(() => 
    suppliers.filter(s => s.name.toLowerCase().includes(debouncedSupplierSearch.toLowerCase())),
    [suppliers, debouncedSupplierSearch]
  );

  const getFilteredItems = useCallback((rowIndex: number) => {
    const search = (itemSearches[rowIndex] || "").toLowerCase().trim();
    if (!search) return items;
    return items.filter(i => 
      i.name.toLowerCase().includes(search) ||
      (i.description && i.description.toLowerCase().includes(search)) ||
      (i.category && i.category.toLowerCase().includes(search)) ||
      (i.sku && i.sku.toLowerCase().includes(search))
    );
  }, [items, itemSearches]);

  const onAddRow = () => setRows([...rows, { itemId: items[0]?.id || "", quantity: 1, unitPrice: items[0]?.unitPrice || 0, unit: items[0]?.unit || "PCS", hsnCode: isValidHsn(items[0]?.sku) ? (items[0]?.sku || "") : "" }]);
  const onSubmit = () => {
    if (!supplierId || rows.some(r => !r.itemId || r.quantity <= 0)) return;
    const poNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random()*999)+1).padStart(3, '0')}`;
    const supplier = suppliers.find(s => s.id === supplierId)!;
    const poItems = rows.map((r) => {
      const qty = Number(r.quantity) || 0;
      const price = Number(r.unitPrice) || 0;
      return {
        id: crypto.randomUUID(),
        itemId: r.itemId,
        item: items.find(i => i.id === r.itemId)!,
        quantity: qty,
        unitPrice: price,
        total: qty * price,
        hsnCode: r.hsnCode || undefined,
      };
    });
    
    addPurchaseOrder({
      poNumber,
      supplierId,
      supplier,
      items: poItems,
      additionalCharges: additionalCharges.map(charge => ({
        id: crypto.randomUUID(),
        name: charge.name,
        amount: charge.amount,
      })),
      status: "SENT",
      date: new Date(date),
      notes: "",
      expectedDelivery: undefined,
      paymentTerms,
      applyGST,
      gstRate: applyGST ? gstRate : undefined,
    });

    // Save price history to localStorage
    const priceRecords = rows.map(r => {
      const item = items.find(i => i.id === r.itemId);
      return {
        id: crypto.randomUUID(),
        itemId: r.itemId,
        itemName: item?.name || 'Unknown Item',
        unitPrice: r.unitPrice,
        poNumber,
        supplierName: supplier.name,
        recordedDate: new Date(date).toISOString(),
      };
    });

    const existingHistory = localStorage.getItem("priceHistory");
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    localStorage.setItem("priceHistory", JSON.stringify([...history, ...priceRecords]));

    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create New PO
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto p-4 sm:p-6">
        <SheetHeader>
          <SheetTitle>Create Purchase Order</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-1">Supplier</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Select value={supplierId || undefined} onValueChange={setSupplierId}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent className="z-50" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Search suppliers..."
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      />
                    </div>
                    {filteredSuppliers.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        No suppliers found
                      </div>
                    ) : (
                      filteredSuppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="mb-1">Date</div>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <div className="mb-1">Payment Terms</div>
              <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="e.g., 30 days from invoice date" />
            </div>
            <div className="flex items-end gap-2">
              <input id="applyGST" type="checkbox" checked={applyGST} onChange={(e) => setApplyGST(e.target.checked)} />
              <label htmlFor="applyGST">Apply GST</label>
            </div>
          </div>
          {applyGST && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-1">GST Rate (%)</div>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={gstRate} 
                  onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)} 
                  placeholder="e.g., 18"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Items</span>
            <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
                  <Plus className="w-3 h-3" /> Quick Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Quick Add Inventory Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Item Name *</label>
                    <Input 
                      value={newItemName} 
                      onChange={(e) => setNewItemName(e.target.value)} 
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Unit</label>
                      <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PCS">PCS</SelectItem>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="LTR">LTR</SelectItem>
                          <SelectItem value="MTR">MTR</SelectItem>
                          <SelectItem value="BOX">BOX</SelectItem>
                          <SelectItem value="SET">SET</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Unit Price</label>
                      <Input 
                        type="number" 
                        min="0"
                        value={newItemPrice} 
                        onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)} 
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input 
                      value={newItemCategory} 
                      onChange={(e) => setNewItemCategory(e.target.value)} 
                      placeholder="e.g., Raw Materials"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setQuickAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleQuickAddItem} disabled={!newItemName.trim()}>Add Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>HSN</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="min-w-[180px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                        <Select value={row.itemId} onValueChange={(v) => {
                          const it = items.find(i => i.id === v);
                          if (!it) return;
                          const next = [...rows];
                          next[idx] = { ...row, itemId: v, unitPrice: it.unitPrice || 0, unit: it.unit || "PCS", hsnCode: isValidHsn(it.sku) ? it.sku : "" };
                          setRows(next);
                        }}>
                          <SelectTrigger className="w-full pl-10">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent className="z-50 max-h-64" onCloseAutoFocus={(e) => e.preventDefault()}>
                            <div className="px-2 pb-2 sticky top-0 bg-background">
                              <Input
                                placeholder="Search items..."
                                value={itemSearches[idx] || ""}
                                onChange={(e) => setItemSearches(prev => ({ ...prev, [idx]: e.target.value }))}
                                className="h-8"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                              />
                            </div>
                            {getFilteredItems(idx).length === 0 ? (
                              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                No items found
                              </div>
                            ) : (
                              getFilteredItems(idx).map((i) => (
                                <SelectItem key={i.id} value={i.id}>
                                  <div className="flex flex-col">
                                    <span>{i.name}</span>
                                    {i.description && (
                                      <span className="text-xs text-muted-foreground">{i.description}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <Input 
                        value={row.hsnCode} 
                        onChange={(e) => {
                          const next = [...rows];
                          next[idx] = { ...row, hsnCode: e.target.value };
                          setRows(next);
                        }} 
                        placeholder="HSN"
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} step="0.01" value={row.quantity} onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, quantity: parseFloat(e.target.value) || 0 };
                        setRows(next);
                      }} className="w-20" />
                    </TableCell>
                    <TableCell>
                      <Input value={row.unit} onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, unit: e.target.value };
                        setRows(next);
                      }} className="w-16" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} step="0.01" value={row.unitPrice} onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, unitPrice: parseFloat(e.target.value) || 0 };
                        setRows(next);
                      }} className="w-24" />
                    </TableCell>
                    <TableCell className="font-medium">{formatINR(row.quantity * row.unitPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {rows.map((row, idx) => (
              <div key={idx} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-muted-foreground">Item #{idx + 1}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div>
                  <Label className="text-xs">Item</Label>
                  <Select value={row.itemId} onValueChange={(v) => {
                    const it = items.find(i => i.id === v);
                    if (!it) return;
                    const next = [...rows];
                    next[idx] = { ...row, itemId: v, unitPrice: it.unitPrice || 0, unit: it.unit || "PCS", hsnCode: isValidHsn(it.sku) ? it.sku : "" };
                    setRows(next);
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-64" onCloseAutoFocus={(e) => e.preventDefault()}>
                      <div className="px-2 pb-2 sticky top-0 bg-background">
                        <Input
                          placeholder="Search items..."
                          value={itemSearches[idx] || ""}
                          onChange={(e) => setItemSearches(prev => ({ ...prev, [idx]: e.target.value }))}
                          className="h-8"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                        />
                      </div>
                      {getFilteredItems(idx).length === 0 ? (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          No items found
                        </div>
                      ) : (
                        getFilteredItems(idx).map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            <div className="flex flex-col">
                              <span>{i.name}</span>
                              {i.description && (
                                <span className="text-xs text-muted-foreground">{i.description}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">HSN</Label>
                    <Input 
                      value={row.hsnCode} 
                      onChange={(e) => {
                        const next = [...rows];
                        next[idx] = { ...row, hsnCode: e.target.value };
                        setRows(next);
                      }} 
                      placeholder="HSN"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Unit</Label>
                    <Input value={row.unit} onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, unit: e.target.value };
                      setRows(next);
                    }} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input type="number" min={0} step="0.01" value={row.quantity} onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, quantity: parseFloat(e.target.value) || 0 };
                      setRows(next);
                    }} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Unit Price</Label>
                    <Input type="number" min={0} step="0.01" value={row.unitPrice} onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, unitPrice: parseFloat(e.target.value) || 0 };
                      setRows(next);
                    }} className="mt-1" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="font-medium">{formatINR(row.quantity * row.unitPrice)}</span>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="gap-2" onClick={onAddRow}><Plus className="w-4 h-4" /> Add Item</Button>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Additional Charges</h4>
            <div className="space-y-3">
              {additionalCharges.map((charge, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Charge name (e.g., Freight)"
                    value={charge.name}
                    onChange={(e) => {
                      const next = [...additionalCharges];
                      next[idx] = { ...charge, name: e.target.value };
                      setAdditionalCharges(next);
                    }}
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={charge.amount}
                      onChange={(e) => {
                        const next = [...additionalCharges];
                        next[idx] = { ...charge, amount: parseFloat(e.target.value) || 0 };
                        setAdditionalCharges(next);
                      }}
                      className="w-full sm:w-32"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const next = additionalCharges.filter((_, i) => i !== idx);
                        setAdditionalCharges(next);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdditionalCharges([...additionalCharges, { name: "", amount: 0 }])}
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> Add Charge
              </Button>
            </div>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button onClick={onSubmit} className="w-full sm:w-auto">Create Purchase Order</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ViewPODialog({ id }: { id: string }) {
  const { purchaseOrders, businessInfo, gstSettings } = useData();
  const order = purchaseOrders.find(p => p.id === id)!;
  const elId = `po-print-${id}`;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1"><Eye className="w-4 h-4" /> View</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Purchase Order</SheetTitle>
        </SheetHeader>
        <div id={elId} className="mt-4">
          <div className="section">
            <div className="header">
              {businessInfo.logo && <img src={businessInfo.logo} alt="Logo" />}
              <div>
                <div className="brand">{businessInfo.name}</div>
                <div className="muted">{businessInfo.address}</div>
                <div className="muted">{businessInfo.email} · {businessInfo.phone}</div>
                {businessInfo.gstNumber && <div className="muted">GST: {businessInfo.gstNumber}</div>}
              </div>
            </div>
          </div>
          
          <div className="section">
            <h2>Purchase Order {order.poNumber}</h2>
          </div>
          
          <div className="section">
            <div className="grid">
              <div>
                <strong>Supplier Details</strong>
                <div>{order.supplier.name}</div>
                <div className="muted">{order.supplier.address}</div>
                <div className="muted">{order.supplier.email} · {order.supplier.phone}</div>
                {order.supplier.gstNumber && <div className="muted">GST: {order.supplier.gstNumber}</div>}
              </div>
                <div>
                <strong>Order Details</strong>
                <div>Date: {formatDateIN(order.date)}</div>
                <div>Status: {order.status}</div>
                <div>Payment Terms: {order.paymentTerms || "30 days from invoice date"}</div>
                <div>GST: {order.sgst + order.cgst > 0 ? `${gstSettings.sgstRate + gstSettings.cgstRate}%` : 'Not Applied'}</div>
              </div>
            </div>
          </div>
          
          <div className="section">
            <p style={{marginBottom: '8px', fontStyle: 'italic'}}>Please supply following goods in accordance with terms and conditions prescribed hereunder :</p>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  {order.items.some(it => isValidHsn(it.hsnCode)) && <th>HSN</th>}
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div style={{fontWeight: '600'}}>{it.item.name}</div>
                      {it.item.description && <div style={{fontSize: '12px', color: '#64748b', marginTop: '2px'}}>{it.item.description}</div>}
                    </td>
                    {order.items.some(i => isValidHsn(i.hsnCode)) && <td>{isValidHsn(it.hsnCode) ? it.hsnCode : '-'}</td>}
                    <td>{it.quantity}</td>
                    <td>{it.item.unit}</td>
                    <td>{formatINR(it.unitPrice)}</td>
                    <td>{formatINR(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="section">
            <table className="totals">
              <tbody>
                <tr><td className="label">Subtotal</td><td className="value">{formatINR(order.subtotal)}</td></tr>
                {(order.additionalCharges ?? []).map((charge) => (
                  <tr key={charge.id}><td className="label">{charge.name}</td><td className="value">{formatINR(charge.amount)}</td></tr>
                ))}
                <tr><td className="label">SGST</td><td className="value">{formatINR(order.sgst)}</td></tr>
                <tr><td className="label">CGST</td><td className="value">{formatINR(order.cgst)}</td></tr>
                <tr><td className="label"><strong>Total Amount</strong></td><td className="value"><strong>{formatINR(order.total)}</strong></td></tr>
              </tbody>
            </table>
            <div className="amount-words">
              Amount in Words: {numberToWords(order.total)}
            </div>
          </div>
          
          <div className="section terms">
            <strong>Terms & Conditions:</strong>
            <div className="muted" style={{ marginTop: '8px', lineHeight: '1.4' }}>
              1. Payment terms: {order.paymentTerms || "30 days from invoice date"}<br />
              2. All disputes subject to local jurisdiction<br />
              3. Goods once sold will not be taken back<br />
              4. Late payment may attract penalty charges<br />
              5. All rates are inclusive of applicable taxes
            </div>
          </div>
          
          {businessInfo.signature && (
            <div className="signature-section">
              <div>Authorized Signatory</div>
              <img src={businessInfo.signature} alt="Authorized Signature" className="signature-image" style={{ marginTop: '8px' }} />
              <div className="muted">{businessInfo.name}</div>
            </div>
          )}
          
          {order.notes && <div className="footer">Notes: {order.notes}</div>}
        </div>
        <SheetFooter className="gap-2 mt-6 flex-wrap">
          <Button variant="outline" onClick={() => printElementById(elId, `PO ${order.poNumber}`)} className="gap-1"><Printer className="w-4 h-4" /> Print</Button>
          <DeletePODialog id={id} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function EditPODialog({ id }: { id: string }) {
  const { purchaseOrders, updatePurchaseOrder } = useData();
  const order = purchaseOrders.find(p => p.id === id)!;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || "");

  const onSave = () => { updatePurchaseOrder(id, { status, notes }); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1"><Edit className="w-4 h-4" /> Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit PO</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <div className="mb-1">Status</div>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="z-50">
                {['DRAFT','SENT','RECEIVED','PARTIAL','CANCELLED'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="mb-1">Notes</div>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PrintPOButton({ id }: { id: string }) {
  const { purchaseOrders, businessInfo, gstSettings } = useData();
  const order = purchaseOrders.find(p => p.id === id)!;
  const elId = `po-print-standalone-${id}`;
  
  const handlePrint = () => {
    const tempDiv = document.createElement('div');
    tempDiv.id = elId;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    tempDiv.innerHTML = `
      <div class="section">
        <div class="header">
          ${businessInfo.logo ? `<img src="${escapeHtml(businessInfo.logo)}" alt="Logo" />` : ''}
          <div>
            <div class="brand">${escapeHtml(businessInfo.name)}</div>
            <div class="muted">${escapeHtml(businessInfo.address)}</div>
            <div class="muted">${escapeHtml(businessInfo.email)} · ${escapeHtml(businessInfo.phone)}</div>
            ${businessInfo.gstNumber ? `<div class="muted">GST: ${escapeHtml(businessInfo.gstNumber)}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="section"><h2>Purchase Order ${escapeHtml(order.poNumber)}</h2></div>
      <div class="section">
        <div class="grid">
          <div>
            <strong>Supplier Details</strong>
            <div>${escapeHtml(order.supplier.name)}</div>
            <div class="muted">${escapeHtml(order.supplier.address)}</div>
            <div class="muted">${escapeHtml(order.supplier.email)} · ${escapeHtml(order.supplier.phone)}</div>
            ${order.supplier.gstNumber ? `<div class="muted">GST: ${escapeHtml(order.supplier.gstNumber)}</div>` : ''}
          </div>
          <div>
            <strong>Order Details</strong>
            <div>Date: ${formatDateIN(order.date)}</div>
            <div>Status: ${escapeHtml(order.status)}</div>
            <div>Payment Terms: ${escapeHtml(order.paymentTerms || "30 days from invoice date")}</div>
            <div>GST: ${order.sgst + order.cgst > 0 ? `${gstSettings.sgstRate + gstSettings.cgstRate}%` : 'Not Applied'}</div>
          </div>
        </div>
      </div>
      <div class="section">
        <p style="margin-bottom: 8px; font-style: italic">Please supply following goods in accordance with terms and conditions prescribed hereunder :</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              ${order.items.some(it => isValidHsn(it.hsnCode)) ? '<th>HSN</th>' : ''}
              <th>Qty</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <div style="font-weight: 600">${escapeHtml(it.item.name)}</div>
                  ${it.item.description ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px">${escapeHtml(it.item.description)}</div>` : ''}
                </td>
                ${order.items.some(i => isValidHsn(i.hsnCode)) ? `<td>${isValidHsn(it.hsnCode) ? escapeHtml(it.hsnCode) : '-'}</td>` : ''}
                <td>${it.quantity}</td>
                <td>${escapeHtml(it.item.unit)}</td>
                <td>${formatINR(it.unitPrice)}</td>
                <td>${formatINR(it.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="section">
        <table class="totals">
          <tbody>
            <tr><td class="label">Subtotal</td><td class="value">${formatINR(order.subtotal)}</td></tr>
            ${(order.additionalCharges ?? []).map(charge => `<tr><td class="label">${escapeHtml(charge.name)}</td><td class="value">${formatINR(charge.amount)}</td></tr>`).join('')}
            <tr><td class="label">SGST</td><td class="value">${formatINR(order.sgst)}</td></tr>
            <tr><td class="label">CGST</td><td class="value">${formatINR(order.cgst)}</td></tr>
            <tr><td class="label"><strong>Total Amount</strong></td><td class="value"><strong>${formatINR(order.total)}</strong></td></tr>
          </tbody>
        </table>
        <div class="amount-words">Amount in Words: ${numberToWords(order.total)}</div>
      </div>
      <div class="section terms">
        <strong>Terms & Conditions:</strong>
        <div class="muted" style="margin-top: 8px; line-height: 1.4">
          1. Payment terms: ${escapeHtml(order.paymentTerms || "30 days from invoice date")}<br />
          2. Furnish Transporter copy of the invoice at the time of delivery of material.<br />
          3. Please mentioned our GSTIN on your tax invoice.<br />
          4. Any damaged Due To Manufacturer Transit Needs To be Replace At Free Of Cost<br />
          5. Please mentioned PO Number & PO date all corrosponding documents
        </div>
      </div>
      ${businessInfo.signature ? `
        <div class="signature-section">
          <div>Authorized Signatory</div>
          <img src="${escapeHtml(businessInfo.signature)}" alt="Authorized Signature" class="signature-image" style="margin-top: 8px" />
          <div class="muted">${escapeHtml(businessInfo.name)}</div>
        </div>
      ` : ''}
      ${order.notes ? `<div class="footer">Notes: ${escapeHtml(order.notes)}</div>` : ''}
    `;
    
    printElementById(elId, `PO ${order.poNumber}`);
    setTimeout(() => document.body.removeChild(tempDiv), 500);
  };
  
  return (
    <Button variant="outline" size="sm" className="gap-1" onClick={handlePrint}>
      <Printer className="w-4 h-4" /> Print/PDF
    </Button>
  );
}

function DownloadPOButton({ id }: { id: string }) {
  const { purchaseOrders, businessInfo, gstSettings } = useData();
  const order = purchaseOrders.find(p => p.id === id)!;
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const htmlContent = `
        <div class="section">
          <div class="header">
            ${businessInfo.logo ? `<img src="${escapeHtml(businessInfo.logo)}" alt="Logo" />` : ''}
            <div>
              <div class="brand">${escapeHtml(businessInfo.name)}</div>
              <div class="muted">${escapeHtml(businessInfo.address)}</div>
              <div class="muted">${escapeHtml(businessInfo.email)} · ${escapeHtml(businessInfo.phone)}</div>
              ${businessInfo.gstNumber ? `<div class="muted">GST: ${escapeHtml(businessInfo.gstNumber)}</div>` : ''}
            </div>
          </div>
        </div>
        <div class="section"><h2>Purchase Order ${escapeHtml(order.poNumber)}</h2></div>
        <div class="section">
          <div class="grid">
            <div>
              <strong>Supplier Details</strong>
              <div>${escapeHtml(order.supplier.name)}</div>
              <div class="muted">${escapeHtml(order.supplier.address)}</div>
              <div class="muted">${escapeHtml(order.supplier.email)} · ${escapeHtml(order.supplier.phone)}</div>
              ${order.supplier.gstNumber ? `<div class="muted">GST: ${escapeHtml(order.supplier.gstNumber)}</div>` : ''}
            </div>
            <div>
              <strong>Order Details</strong>
              <div>Date: ${formatDateIN(order.date)}</div>
              <div>Status: ${escapeHtml(order.status)}</div>
              <div>Payment Terms: ${escapeHtml(order.paymentTerms || "30 days from invoice date")}</div>
            </div>
          </div>
        </div>
        <div class="section">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                ${order.items.some(it => isValidHsn(it.hsnCode)) ? '<th>HSN</th>' : ''}
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((it, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${escapeHtml(it.item.name)}</td>
                  ${order.items.some(i => isValidHsn(i.hsnCode)) ? `<td>${isValidHsn(it.hsnCode) ? escapeHtml(it.hsnCode) : '-'}</td>` : ''}
                  <td>${it.quantity}</td>
                  <td>${escapeHtml(it.item.unit)}</td>
                  <td>${formatINR(it.unitPrice)}</td>
                  <td>${formatINR(it.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="section">
          <table class="totals">
            <tbody>
              <tr><td class="label">Subtotal</td><td class="value">${formatINR(order.subtotal)}</td></tr>
              ${(order.additionalCharges ?? []).map(charge => `<tr><td class="label">${escapeHtml(charge.name)}</td><td class="value">${formatINR(charge.amount)}</td></tr>`).join('')}
              <tr><td class="label">SGST</td><td class="value">${formatINR(order.sgst)}</td></tr>
              <tr><td class="label">CGST</td><td class="value">${formatINR(order.cgst)}</td></tr>
              <tr><td class="label"><strong>Total Amount</strong></td><td class="value"><strong>${formatINR(order.total)}</strong></td></tr>
            </tbody>
          </table>
          <div class="amount-words">Amount in Words: ${numberToWords(order.total)}</div>
        </div>
      `;
      await downloadAsPdf(htmlContent, `PO-${order.poNumber}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button variant="outline" size="sm" className="gap-1 h-8 w-8 p-0" onClick={handleDownload} disabled={isLoading} title="Download PDF">
      <Download className="w-4 h-4" />
    </Button>
  );
}

function DeletePODialog({ id }: { id: string }) {
  const { purchaseOrders, removePurchaseOrder } = useData();
  const order = purchaseOrders.find(p => p.id === id)!;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete PO ${order.poNumber}?`)) {
      removePurchaseOrder(id);
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete} className="gap-1">
      <Trash2 className="w-4 h-4" /> Delete
    </Button>
  );
}

interface ExportPurchaseDataButtonProps {
  orders: typeof PurchaseOrders extends () => infer R ? R extends { purchaseOrders: (infer T)[] } ? T[] : never : never;
  monthLabel: string;
}

function ExportPurchaseDataButton({ orders, monthLabel }: { orders: any[]; monthLabel: string }) {
  const handleExport = () => {
    if (orders.length === 0) {
      alert("No purchase orders to export");
      return;
    }

    const csvRows: string[] = [];

    csvRows.push(["PO Number", "Supplier Name", "Item", "Amount"].join(","));

    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const poNumber = order.poNumber;
        const supplierName = order.supplier.name;
        const itemName = item.item.name;
        const amount = item.total;

        const csvRow = [
          `"${poNumber}"`,
          `"${supplierName}"`,
          `"${itemName}"`,
          amount
        ].join(",");

        csvRows.push(csvRow);
      });
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const filename = `purchase-data-${monthLabel.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="gap-2"
      disabled={orders.length === 0}
    >
      <Download className="w-4 h-4" /> Export
    </Button>
  );
}

export default PurchaseOrders;

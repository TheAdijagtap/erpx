import { useMemo, useRef, useState, memo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Search, Receipt, Eye, Edit, Printer, Trash2, Calendar, CheckCircle, Send, TrendingUp, Download } from "lucide-react";
import { useData } from "@/store/SupabaseDataContext";
import { formatDateIN, formatINR } from "@/lib/format";
import { printElementById } from "@/lib/print";
import { numberToWords } from "@/lib/numberToWords";
import { escapeHtml } from "@/lib/htmlEscape";
import { ProformaInvoice as ProformaInvoiceType, ProformaInvoiceItem, BuyerInfo, ProformaProduct } from "@/types/inventory";
import React from "react";
import { useDebounce } from "@/hooks/useDebounce";

const isValidHsn = (value?: string) => {
  const v = (value ?? "").trim();
  return v.length > 0 && /^\d+$/.test(v);
};

interface ProformaAggregateRow {
  key: string;
  label: string;
  total: number;
  count: number;
}

interface ProformaStatsSummary {
  totalInvoices: number;
  totalValue: number;
  averageValue: number;
  draftCount: number;
  draftValue: number;
  sentCount: number;
  sentValue: number;
  acceptedCount: number;
  acceptedValue: number;
  uniqueCustomers: number;
  monthlyTotals: ProformaAggregateRow[];
  yearlyTotals: ProformaAggregateRow[];
}

const ProformaInvoice = () => {
  const { proformaInvoices, proformaProducts } = useData();
  const [activeTab, setActiveTab] = useState<"invoices" | "insights" | "products">("invoices");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Calculate stats
  const stats = useMemo<ProformaStatsSummary>(() => {
    const base: ProformaStatsSummary = {
      totalInvoices: proformaInvoices.length,
      totalValue: 0,
      averageValue: 0,
      draftCount: 0,
      draftValue: 0,
      sentCount: 0,
      sentValue: 0,
      acceptedCount: 0,
      acceptedValue: 0,
      uniqueCustomers: 0,
      monthlyTotals: [],
      yearlyTotals: [],
    };

    if (proformaInvoices.length === 0) return base;

    const customerNames = new Set<string>();
    const monthlyMap = new Map<string, { year: number; month: number; total: number; count: number }>();
    const yearlyMap = new Map<number, { total: number; count: number }>();

    proformaInvoices.forEach((invoice) => {
      const invoiceTotal = invoice.total ?? 0;
      base.totalValue += invoiceTotal;
      customerNames.add(invoice.buyerInfo.name.toLowerCase());

      if (invoice.status === "DRAFT") {
        base.draftCount += 1;
        base.draftValue += invoiceTotal;
      } else if (invoice.status === "SENT") {
        base.sentCount += 1;
        base.sentValue += invoiceTotal;
      } else if (invoice.status === "ACCEPTED") {
        base.acceptedCount += 1;
        base.acceptedValue += invoiceTotal;
      }

      const invoiceDate = invoice.date instanceof Date ? invoice.date : new Date(invoice.date);
      if (Number.isNaN(invoiceDate.getTime())) return;

      const monthKey = `${invoiceDate.getFullYear()}-${invoiceDate.getMonth()}`;
      const monthEntry = monthlyMap.get(monthKey) ?? {
        year: invoiceDate.getFullYear(),
        month: invoiceDate.getMonth(),
        total: 0,
        count: 0,
      };
      monthEntry.total += invoiceTotal;
      monthEntry.count += 1;
      monthlyMap.set(monthKey, monthEntry);

      const yearEntry = yearlyMap.get(invoiceDate.getFullYear()) ?? { total: 0, count: 0 };
      yearEntry.total += invoiceTotal;
      yearEntry.count += 1;
      yearlyMap.set(invoiceDate.getFullYear(), yearEntry);
    });

    base.uniqueCustomers = customerNames.size;
    base.averageValue = base.totalInvoices ? base.totalValue / base.totalInvoices : 0;

    base.monthlyTotals = Array.from(monthlyMap.values())
      .sort((a, b) => new Date(b.year, b.month, 1).getTime() - new Date(a.year, a.month, 1).getTime())
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
  }, [proformaInvoices]);

  const monthlyInsights = stats.monthlyTotals.slice(0, 12);
  const yearlyInsights = stats.yearlyTotals;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Proforma Invoice</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and manage proforma invoices for your customers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`pb-2 px-1 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === "invoices"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Proforma Invoices
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`pb-2 px-1 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === "insights"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-2 px-1 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Products
        </button>
      </div>

      {activeTab === "invoices" ? (
        <ProformaInvoicesTab proformaProducts={proformaProducts} />
      ) : activeTab === "insights" ? (
        <ProformaInsightsTab 
          stats={stats} 
          monthlyInsights={monthlyInsights} 
          yearlyInsights={yearlyInsights}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />
      ) : (
        <ProductsTab proformaProducts={proformaProducts} />
      )}
    </div>
  );
};

// Insights Tab Component
interface ProformaInsightsTabProps {
  stats: ProformaStatsSummary;
  monthlyInsights: ProformaAggregateRow[];
  yearlyInsights: ProformaAggregateRow[];
  selectedMonth: string | null;
  setSelectedMonth: (month: string | null) => void;
}

function ProformaInsightsTab({ stats, monthlyInsights, yearlyInsights, selectedMonth, setSelectedMonth }: ProformaInsightsTabProps) {
  const { proformaInvoices } = useData();

  const selectedMonthStats = useMemo(() => {
    if (!selectedMonth || monthlyInsights.length === 0) return null;
    return monthlyInsights.find((m) => m.key === selectedMonth) ?? null;
  }, [selectedMonth, monthlyInsights]);

  const monthlyInvoicesFiltered = useMemo(() => {
    if (!selectedMonth) return proformaInvoices;
    const [yearStr, monthStr] = selectedMonth.split("-");
    const targetYear = parseInt(yearStr, 10);
    const targetMonth = parseInt(monthStr, 10);
    return proformaInvoices.filter((invoice) => {
      const invoiceDate = invoice.date instanceof Date ? invoice.date : new Date(invoice.date);
      return invoiceDate.getFullYear() === targetYear && invoiceDate.getMonth() === targetMonth;
    });
  }, [selectedMonth, proformaInvoices]);

  const summaryTiles = useMemo(() => {
    if (!selectedMonthStats) {
      return [
        {
          label: "Total Revenue",
          value: formatINR(stats.totalValue),
          description: `${stats.totalInvoices} ${stats.totalInvoices === 1 ? "invoice" : "invoices"} to ${stats.uniqueCustomers} ${stats.uniqueCustomers === 1 ? "customer" : "customers"}`,
        },
        {
          label: "Average Invoice Value",
          value: formatINR(stats.averageValue),
          description: stats.totalInvoices ? "Based on all proforma invoices" : "Add invoices to calculate averages",
        },
        {
          label: "Accepted Value",
          value: formatINR(stats.acceptedValue),
          description: `${stats.acceptedCount} ${stats.acceptedCount === 1 ? "invoice" : "invoices"} accepted`,
        },
        {
          label: "Pending Value",
          value: formatINR(stats.sentValue + stats.draftValue),
          description: `${stats.sentCount + stats.draftCount} ${(stats.sentCount + stats.draftCount) === 1 ? "invoice" : "invoices"} pending`,
        },
      ];
    }

    const monthlyAccepted = monthlyInvoicesFiltered.filter((i) => i.status === "ACCEPTED").reduce((sum, i) => sum + i.total, 0);
    const monthlyPending = monthlyInvoicesFiltered.filter((i) => ["DRAFT", "SENT"].includes(i.status)).reduce((sum, i) => sum + i.total, 0);
    const monthlyAvg = monthlyInvoicesFiltered.length ? selectedMonthStats.total / monthlyInvoicesFiltered.length : 0;

    return [
      {
        label: "Total Revenue",
        value: formatINR(selectedMonthStats.total),
        description: `${selectedMonthStats.count} ${selectedMonthStats.count === 1 ? "invoice" : "invoices"} in ${selectedMonthStats.label}`,
      },
      {
        label: "Average Invoice Value",
        value: formatINR(monthlyAvg),
        description: monthlyInvoicesFiltered.length ? `Based on ${selectedMonthStats.label} invoices` : "No invoices this month",
      },
      {
        label: "Accepted Value",
        value: formatINR(monthlyAccepted),
        description: `${monthlyInvoicesFiltered.filter((i) => i.status === "ACCEPTED").length} invoices accepted`,
      },
      {
        label: "Pending Value",
        value: formatINR(monthlyPending),
        description: `${monthlyInvoicesFiltered.filter((i) => ["DRAFT", "SENT"].includes(i.status)).length} invoices pending`,
      },
    ];
  }, [selectedMonthStats, monthlyInvoicesFiltered, stats]);

  const exportToCSV = () => {
    const data = proformaInvoices.map(inv => ({
      "Invoice Number": inv.proformaNumber,
      "Customer": inv.buyerInfo.name,
      "Date": formatDateIN(inv.date),
      "Status": inv.status,
      "Items": inv.items.length,
      "Total": inv.total,
    }));
    
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proforma-invoices-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Proforma Insights
          </h2>
          <p className="text-sm text-muted-foreground">
            Track your proforma invoice activity with totals, averages, and trend breakdowns.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2 w-full sm:w-auto">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          {monthlyInsights.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:ml-auto">
              <label className="text-sm font-medium text-muted-foreground">View by Month:</label>
              <Select value={selectedMonth || "all"} onValueChange={(value) => setSelectedMonth(value === "all" ? null : value)}>
                <SelectTrigger className="w-full sm:w-48">
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

      {/* Summary Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryTiles.map((tile) => (
          <div key={tile.label} className="rounded-lg border border-border/60 bg-muted/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{tile.label}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{tile.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{tile.description}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-background p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-gray-400 text-gray-900">Draft</Badge>
          </div>
          <p className="text-lg font-semibold">{formatINR(stats.draftValue)}</p>
          <p className="text-xs text-muted-foreground">{stats.draftCount} invoices</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-400 text-blue-900">Sent</Badge>
          </div>
          <p className="text-lg font-semibold">{formatINR(stats.sentValue)}</p>
          <p className="text-xs text-muted-foreground">{stats.sentCount} invoices</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-green-500 text-white">Accepted</Badge>
          </div>
          <p className="text-lg font-semibold">{formatINR(stats.acceptedValue)}</p>
          <p className="text-xs text-muted-foreground">{stats.acceptedCount} invoices</p>
        </div>
      </div>

      {/* Monthly & Yearly Breakdown */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Monthly Revenue</h3>
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
                    <p className="text-xs text-muted-foreground">{month.count} {month.count === 1 ? "invoice" : "invoices"}</p>
                  </div>
                  <div className="text-sm font-semibold text-foreground">{formatINR(month.total)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Add proforma invoices to see monthly trends.</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Yearly Revenue</h3>
          </div>
          {yearlyInsights.length ? (
            <div className="mt-4 space-y-3">
              {yearlyInsights.map((year) => (
                <div key={year.key} className="flex items-center justify-between rounded-md border border-border/60 bg-background px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{year.label}</p>
                    <p className="text-xs text-muted-foreground">{year.count} {year.count === 1 ? "invoice" : "invoices"}</p>
                  </div>
                  <div className="text-sm font-semibold text-foreground">{formatINR(year.total)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Add proforma invoices to see yearly trends.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

const ProformaInvoicesTab = ({ proformaProducts }: { proformaProducts: ProformaProduct[] }) => {
  const { proformaInvoices, businessInfo } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 150);

  const filteredInvoices = useMemo(() => proformaInvoices.filter(invoice =>
    invoice.proformaNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    invoice.buyerInfo.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  ), [proformaInvoices, debouncedSearch]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by proforma number or buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <CreateProformaDialog proformaProducts={proformaProducts} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="p-4 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{invoice.proformaNumber}</h3>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {invoice.buyerInfo.name} · {formatDateIN(invoice.date)}
                  </p>
                </div>
                <div className="p-1.5 bg-primary-light rounded">
                  <Receipt className="w-4 h-4 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Items</p>
                  <p className="text-sm font-semibold">{invoice.items.length}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Qty</p>
                  <p className="text-sm font-semibold">
                    {invoice.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total</p>
                  <p className="text-sm font-semibold">{formatINR(invoice.total)}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                  <QuickStatusChangeButton invoice={invoice} />
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <ViewProformaDialog invoice={invoice} />
                <EditProformaDialog invoice={invoice} proformaProducts={proformaProducts} />
                <PrintProformaButton id={invoice.id} />
                <DeleteProformaDialog id={invoice.id} />
              </div>
            </div>
          </Card>
        ))}

        {filteredInvoices.length === 0 && (
          <Card className="p-12 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No proforma invoices found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No invoices match your search criteria." : "Create your first proforma invoice to get started."}
            </p>
            {!searchTerm && <CreateProformaDialog proformaProducts={proformaProducts} />}
          </Card>
        )}
      </div>
    </div>
  );
};

const ProductsTab = ({ 
  proformaProducts,
}: { 
  proformaProducts: ProformaProduct[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => 
    proformaProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    ), [proformaProducts, searchTerm]
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <CreateProductDialog />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                  <Badge variant="outline">{product.unit}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Price: </span>
                    <span className="font-semibold">{formatINR(product.price)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Created: </span>
                    <span className="text-sm">{formatDateIN(product.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <EditProductDialog product={product} />
                <DeleteProductDialog productId={product.id} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-12 text-center">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Create your first product for proforma invoices"}
          </p>
          <CreateProductDialog />
        </Card>
      )}
    </div>
  );
};

function CreateProductDialog() {
  const { addProformaProduct } = useData();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("PCS");
  const [price, setPrice] = useState(0);
  const [hsnCode, setHsnCode] = useState("");

  const onSubmit = async () => {
    if (!name.trim() || price <= 0) return;
    
    try {
      await addProformaProduct({
        name: name.trim(),
        description: description.trim(),
        unit,
        price,
        hsnCode: hsnCode.trim() || undefined,
      });
      setOpen(false);
      setName("");
      setDescription("");
      setUnit("PCS");
      setPrice(0);
      setHsnCode("");
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hsn">HSN Code</Label>
              <Input
                id="hsn"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="e.g., 8539"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., PCS, KG"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="Enter price"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={!name.trim() || price <= 0}>
            Add Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditProductDialog({ product }: {
  product: ProformaProduct;
}) {
  const { updateProformaProduct } = useData();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [unit, setUnit] = useState(product.unit);
  const [price, setPrice] = useState(product.price);
  const [hsnCode, setHsnCode] = useState(product.hsnCode || "");

  const onSubmit = async () => {
    if (!name.trim() || price <= 0) return;
    
    try {
      await updateProformaProduct(product.id, {
        name: name.trim(),
        description: description.trim(),
        unit,
        price,
        hsnCode: hsnCode.trim() || undefined,
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Edit className="w-4 h-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hsn">HSN Code</Label>
              <Input
                id="hsn"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="e.g., 8539"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., PCS, KG"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="Enter price"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={!name.trim() || price <= 0}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProductDialog({ productId }: {
  productId: string;
}) {
  const { removeProformaProduct } = useData();
  const [open, setOpen] = useState(false);
  
  const onDelete = async () => {
    try {
      await removeProformaProduct(productId);
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Trash2 className="w-4 h-4" /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const getStatusBadge = (status: ProformaInvoiceType['status']) => {
  const config = {
    DRAFT: { label: "Draft", variant: "secondary" as const, className: "" },
    SENT: { label: "Sent", variant: "outline" as const, className: "" },
    ACCEPTED: { label: "Accepted", variant: "default" as const, className: "bg-green-600 hover:bg-green-700 text-white border-transparent shadow" },
    CANCELLED: { label: "Cancelled", variant: "destructive" as const, className: "" },
  };

  const { label, variant, className } = config[status];
  return <Badge variant={variant} className={className}>{label}</Badge>;
};

const QuickStatusChangeButton = ({ invoice }: { invoice: ProformaInvoiceType }) => {
  const { updateProformaInvoice } = useData();

  const statusOptions: Array<{ value: ProformaInvoiceType['status']; label: string; icon: React.ReactNode }> = [
    { value: 'DRAFT', label: 'Draft', icon: null },
    { value: 'SENT', label: 'Send', icon: <Send className="w-4 h-4" /> },
    { value: 'ACCEPTED', label: 'Accepted', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'CANCELLED', label: 'Cancel', icon: null },
  ];

  return (
    <Select value={invoice.status} onValueChange={(value: any) => updateProformaInvoice(invoice.id, { status: value })}>
      <SelectTrigger className="w-full text-xs h-8 px-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-50">
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const CreateProformaDialog = ({ proformaProducts }: { proformaProducts?: ProformaProduct[] }) => {
  const { addProformaInvoice, businessInfo } = useData();
  const [open, setOpen] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
  });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [items, setItems] = useState<ProformaInvoiceItem[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<Array<{ name: string; amount: number }>>([]);
  const [notes, setNotes] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [applyGST, setApplyGST] = useState<boolean>(false);
  const [gstRate, setGstRate] = useState<number>(18);

  const filteredProducts = useMemo(() => 
    proformaProducts?.filter(p => p.name.toLowerCase().includes(itemSearch.toLowerCase())) || [],
    [proformaProducts, itemSearch]
  );

  const addRow = () => {
    if (!proformaProducts || proformaProducts.length === 0) return;
    
    setItems([...items, {
      id: Date.now().toString(),
      itemId: proformaProducts[0].id,
      item: {
        id: proformaProducts[0].id,
        name: proformaProducts[0].name,
        sku: proformaProducts[0].hsnCode || "",
        description: proformaProducts[0].description,
        category: "Proforma Product",
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unitPrice: proformaProducts[0].price,
        unit: proformaProducts[0].unit,
        createdAt: proformaProducts[0].createdAt,
        updatedAt: proformaProducts[0].createdAt,
      },
      quantity: 1,
      unitPrice: proformaProducts[0].price,
      total: proformaProducts[0].price,
      hsnCode: proformaProducts[0].hsnCode || undefined,
    }]);
  };

  const updateItem = (index: number, field: keyof ProformaInvoiceItem, value: any) => {
    const newItems = [...items];
    if (field === 'itemId') {
      const selectedProduct = proformaProducts?.find(product => product.id === value);
      if (selectedProduct) {
        const selectedItem = {
          id: selectedProduct.id,
          name: selectedProduct.name,
          sku: selectedProduct.hsnCode || "",
          description: selectedProduct.description,
          category: "Proforma Product",
          currentStock: 0,
          minStock: 0,
          maxStock: 0,
          unitPrice: selectedProduct.price,
          unit: selectedProduct.unit,
          createdAt: selectedProduct.createdAt,
          updatedAt: selectedProduct.createdAt,
        };
        newItems[index] = {
          ...newItems[index],
          itemId: value,
          item: selectedItem,
          unitPrice: selectedProduct.price,
          total: newItems[index].quantity * selectedProduct.price,
          hsnCode: selectedProduct.hsnCode || undefined,
        };
      }
    } else if (field === 'quantity' || field === 'unitPrice') {
      newItems[index] = { ...newItems[index], [field]: value };
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calcTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const chargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const sgst = applyGST ? ((subtotal + chargesTotal) * gstRate) / 200 : 0;
    const cgst = applyGST ? ((subtotal + chargesTotal) * gstRate) / 200 : 0;
    const total = subtotal + chargesTotal + sgst + cgst;
    return { subtotal, sgst, cgst, total };
  };

  const handleSubmit = () => {
    if (!buyerInfo.name || items.length === 0) return;

    const proformaNumber = `PI-${Date.now()}`;

    addProformaInvoice({
      proformaNumber,
      buyerInfo,
      items,
      additionalCharges: additionalCharges.map(charge => ({
        id: crypto.randomUUID(),
        name: charge.name,
        amount: charge.amount,
      })),
      status: 'DRAFT',
      date: new Date(date),
      validUntil: validUntil ? new Date(validUntil) : undefined,
      paymentTerms,
      notes,
      applyGST,
      gstRate: applyGST ? gstRate : undefined,
    });

    setOpen(false);
    // Reset form
    setBuyerInfo({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
    });
    setDate(new Date().toISOString().split('T')[0]);
    setValidUntil("");
    setPaymentTerms("");
    setItems([]);
    setNotes("");
  };

  const { subtotal, sgst, cgst, total } = calcTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Proforma
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Proforma Invoice</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Buyer Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyerName">Company Name *</Label>
                <Input
                  id="buyerName"
                  value={buyerInfo.name}
                  onChange={(e) => setBuyerInfo({...buyerInfo, name: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={buyerInfo.contactPerson}
                  onChange={(e) => setBuyerInfo({...buyerInfo, contactPerson: e.target.value})}
                  placeholder="Enter contact person"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={buyerInfo.email}
                  onChange={(e) => setBuyerInfo({...buyerInfo, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={buyerInfo.phone}
                  onChange={(e) => setBuyerInfo({...buyerInfo, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={buyerInfo.address}
                  onChange={(e) => setBuyerInfo({...buyerInfo, address: e.target.value})}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={buyerInfo.gstNumber}
                  onChange={(e) => setBuyerInfo({...buyerInfo, gstNumber: e.target.value})}
                  placeholder="Enter GST number"
                />
              </div>
            </div>
          </Card>

          {/* Invoice Details */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g., 30 days"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <input 
                  id="applyGST" 
                  type="checkbox" 
                  checked={applyGST} 
                  onChange={(e) => setApplyGST(e.target.checked)} 
                />
                <label htmlFor="applyGST">Apply GST</label>
              </div>
              {applyGST && (
                <div>
                  <Label htmlFor="gstRate">GST Rate (%)</Label>
                  <Input
                    id="gstRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={gstRate}
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 18"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Items */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button onClick={addRow} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>HSN (Optional)</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                        <Select
                          value={item.itemId}
                          onValueChange={(value) => updateItem(index, 'itemId', value)}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-50">
                            <div className="px-2 pb-2 sticky top-0 bg-background">
                              <Input
                                placeholder="Search products..."
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                className="h-8"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            {filteredProducts.length === 0 ? (
                              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                No products found
                              </div>
                            ) : (
                              filteredProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.unit})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.hsnCode || ""}
                        onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
                        placeholder="HSN"
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>{formatINR(item.total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {items.length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {additionalCharges.map((charge, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{charge.name}:</span>
                    <span>{formatINR(charge.amount)}</span>
                  </div>
                ))}
                {applyGST && (
                  <>
                    <div className="flex justify-between">
                      <span>SGST ({(gstRate / 2).toFixed(2)}%):</span>
                      <span>{formatINR(sgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST ({(gstRate / 2).toFixed(2)}%):</span>
                      <span>{formatINR(cgst)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Additional Charges */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Additional Charges</h3>
              <Button
                onClick={() => setAdditionalCharges([...additionalCharges, { name: "", amount: 0 }])}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Charge
              </Button>
            </div>
            
            <div className="space-y-2">
              {additionalCharges.map((charge, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Charge name (e.g., Freight)"
                    value={charge.name}
                    onChange={(e) => {
                      const next = [...additionalCharges];
                      next[idx] = { ...charge, name: e.target.value };
                      setAdditionalCharges(next);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={charge.amount}
                    onChange={(e) => {
                      const next = [...additionalCharges];
                      next[idx] = { ...charge, amount: parseFloat(e.target.value) || 0 };
                      setAdditionalCharges(next);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = additionalCharges.filter((_, i) => i !== idx);
                      setAdditionalCharges(next);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!buyerInfo.name || items.length === 0 || !proformaProducts || proformaProducts.length === 0}>
            Create Proforma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ViewProformaDialog = ({ invoice }: { invoice: ProformaInvoiceType }) => {
  const { businessInfo } = useData();
  const [open, setOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      printElementById(`proforma-print-${invoice.id}`, `Quotation Cum Proforma ${invoice.proformaNumber}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quotation Cum Proforma Details</DialogTitle>
        </DialogHeader>
        
        <div id={`proforma-print-${invoice.id}`} ref={printRef}>
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
            <h2>Quotation Cum Proforma {invoice.proformaNumber}</h2>
          </div>
          
          <div className="section">
            <div className="grid">
              <div>
                <strong>Buyer Details</strong>
                <div>{invoice.buyerInfo.name}</div>
                {invoice.buyerInfo.contactPerson && <div>{invoice.buyerInfo.contactPerson}</div>}
                <div className="muted">{invoice.buyerInfo.address}</div>
                <div className="muted">{invoice.buyerInfo.email} · {invoice.buyerInfo.phone}</div>
                {invoice.buyerInfo.gstNumber && <div className="muted">GST: {invoice.buyerInfo.gstNumber}</div>}
              </div>
              <div>
                <strong>Invoice Details</strong>
                <div>Date: {formatDateIN(invoice.date)}</div>
                {invoice.validUntil && <div>Valid Until: {formatDateIN(invoice.validUntil)}</div>}
                <div>Status: {invoice.status}</div>
                {invoice.paymentTerms && <div>Payment Terms: {invoice.paymentTerms}</div>}
              </div>
            </div>
          </div>
          
          <div className="section">
            <p style={{marginBottom: '8px', fontStyle: 'italic'}}>We are pleased to submit our quotation for the following items :</p>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  {invoice.items.some(it => isValidHsn(it.hsnCode)) && <th>HSN</th>}
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div style={{fontWeight: '600'}}>{it.item.name}</div>
                      {it.item.description && <div style={{fontSize: '12px', color: '#64748b', marginTop: '2px'}}>{it.item.description}</div>}
                    </td>
                    {invoice.items.some(i => isValidHsn(i.hsnCode)) && <td>{isValidHsn(it.hsnCode) ? it.hsnCode : '-'}</td>}
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
                <tr><td className="label">Subtotal</td><td className="value">{formatINR(invoice.subtotal)}</td></tr>
                {(invoice.additionalCharges ?? []).map((charge) => (
                  <tr key={charge.id}><td className="label">{charge.name}</td><td className="value">{formatINR(charge.amount)}</td></tr>
                ))}
                {(invoice.sgst > 0 || invoice.cgst > 0) && (
                  <>
                    <tr><td className="label">SGST ({((invoice.sgst / (invoice.subtotal + (invoice.additionalCharges?.reduce((sum, c) => sum + c.amount, 0) ?? 0))) * 100).toFixed(2)}%)</td><td className="value">{formatINR(invoice.sgst)}</td></tr>
                    <tr><td className="label">CGST ({((invoice.cgst / (invoice.subtotal + (invoice.additionalCharges?.reduce((sum, c) => sum + c.amount, 0) ?? 0))) * 100).toFixed(2)}%)</td><td className="value">{formatINR(invoice.cgst)}</td></tr>
                  </>
                )}
                {invoice.sgst === 0 && invoice.cgst === 0 && (
                  <tr><td className="label">GST</td><td className="value">Not Applied</td></tr>
                )}
                <tr><td className="label"><strong>Total Amount</strong></td><td className="value"><strong>{formatINR(invoice.total)}</strong></td></tr>
              </tbody>
            </table>
            <div className="amount-words">
              Amount in Words: {numberToWords(invoice.total)}
            </div>
          </div>
          
          <div className="section terms">
            <strong>Terms & Conditions:</strong>
            <div className="muted" style={{ marginTop: '8px', lineHeight: '1.4' }}>
              1. Payment terms: {invoice.paymentTerms || "As agreed"}<br />
              2. Prices are valid until: {invoice.validUntil ? formatDateIN(invoice.validUntil) : "Further notice"}<br />
              3. All prices are subject to change without prior notice<br />
              4. This is a proforma invoice and not a tax invoice<br />
              5. All rates are inclusive of applicable taxes
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '24px' }}>
            {businessInfo.bankDetails && (
              <div className="section">
                <strong>Bank Details:</strong>
                <div className="muted" style={{ marginTop: '8px', lineHeight: '1.6' }}>
                  Bank Name: {businessInfo.bankDetails.bankName}<br />
                  Account No: {businessInfo.bankDetails.accountNumber}<br />
                  IFSC Code: {businessInfo.bankDetails.ifscCode}
                </div>
              </div>
            )}
            
            {businessInfo.signature && (
              <div className="signature-section">
                <div>Authorized Signatory</div>
                <img src={businessInfo.signature} alt="Authorized Signature" className="signature-image" style={{ marginTop: '8px' }} />
                <div className="muted">{businessInfo.name}</div>
              </div>
            )}
          </div>
          
          {invoice.notes && <div className="footer">Notes: {invoice.notes}</div>}
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditProformaDialog = ({ invoice, proformaProducts }: { invoice: ProformaInvoiceType; proformaProducts?: ProformaProduct[] }) => {
  const { updateProformaInvoice } = useData();
  const [open, setOpen] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>(invoice.buyerInfo);
  const [date, setDate] = useState(invoice.date instanceof Date ? invoice.date.toISOString().split('T')[0] : new Date(invoice.date).toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(invoice.validUntil ? (invoice.validUntil instanceof Date ? invoice.validUntil.toISOString().split('T')[0] : new Date(invoice.validUntil).toISOString().split('T')[0]) : "");
  const [paymentTerms, setPaymentTerms] = useState(invoice.paymentTerms || "");
  const [items, setItems] = useState<ProformaInvoiceItem[]>(invoice.items);
  const [additionalCharges, setAdditionalCharges] = useState<Array<{ name: string; amount: number }>>(
    (invoice.additionalCharges || []).map(charge => ({ name: charge.name, amount: charge.amount }))
  );
  const [notes, setNotes] = useState(invoice.notes || "");
  const [status, setStatus] = useState(invoice.status);
  const [applyGST, setApplyGST] = useState<boolean>(invoice.sgst > 0 || invoice.cgst > 0);
  const [itemSearch, setItemSearch] = useState("");
  
  // Calculate GST rate percentage from the stored SGST/CGST amounts
  const initialGstRate = useMemo(() => {
    if (invoice.sgst > 0 || invoice.cgst > 0) {
      const chargesTotal = (invoice.additionalCharges || []).reduce((sum, charge) => sum + charge.amount, 0);
      const taxableAmount = invoice.subtotal + chargesTotal;
      // Calculate percentage: (total tax / taxable amount) * 100
      return taxableAmount > 0 ? ((invoice.sgst + invoice.cgst) / taxableAmount) * 100 : 18;
    }
    return 18;
  }, [invoice.sgst, invoice.cgst, invoice.subtotal, invoice.additionalCharges]);
  
  const [gstRate, setGstRate] = useState<number>(initialGstRate);

  const filteredProducts = useMemo(() => {
    if (!proformaProducts) return [];
    if (!itemSearch) return proformaProducts;
    const searchLower = itemSearch.toLowerCase();
    return proformaProducts.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.unit.toLowerCase().includes(searchLower) ||
      (product.hsnCode && product.hsnCode.toLowerCase().includes(searchLower))
    );
  }, [proformaProducts, itemSearch]);

  const addRow = () => {
    if (!proformaProducts || proformaProducts.length === 0) return;

    setItems([...items, {
      id: Date.now().toString(),
      itemId: proformaProducts[0].id,
      item: {
        id: proformaProducts[0].id,
        name: proformaProducts[0].name,
        sku: proformaProducts[0].hsnCode || "",
        description: proformaProducts[0].description,
        category: "Proforma Product",
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unitPrice: proformaProducts[0].price,
        unit: proformaProducts[0].unit,
        createdAt: proformaProducts[0].createdAt,
        updatedAt: proformaProducts[0].createdAt,
      },
      quantity: 1,
      unitPrice: proformaProducts[0].price,
      total: proformaProducts[0].price,
      hsnCode: proformaProducts[0].hsnCode || undefined,
    }]);
  };

  const updateItem = (index: number, field: keyof ProformaInvoiceItem | 'itemName', value: any) => {
    const newItems = [...items];
    if (field === 'itemId') {
      const selectedProduct = proformaProducts?.find(product => product.id === value);
      if (selectedProduct) {
        const selectedItem = {
          id: selectedProduct.id,
          name: selectedProduct.name,
          sku: selectedProduct.hsnCode || "",
          description: selectedProduct.description,
          category: "Proforma Product",
          currentStock: 0,
          minStock: 0,
          maxStock: 0,
          unitPrice: selectedProduct.price,
          unit: selectedProduct.unit,
          createdAt: selectedProduct.createdAt,
          updatedAt: selectedProduct.createdAt,
        };
        newItems[index] = {
          ...newItems[index],
          itemId: value,
          item: selectedItem,
          unitPrice: selectedProduct.price,
          total: newItems[index].quantity * selectedProduct.price,
          hsnCode: selectedProduct.hsnCode || undefined,
        };
      }
    } else if (field === 'itemName') {
      // Update item name directly for existing items
      newItems[index] = {
        ...newItems[index],
        item: { ...newItems[index].item, name: value },
      };
    } else if (field === 'quantity' || field === 'unitPrice') {
      newItems[index] = { ...newItems[index], [field]: value };
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calcTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const chargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const sgst = applyGST ? ((subtotal + chargesTotal) * gstRate) / 200 : 0;
    const cgst = applyGST ? ((subtotal + chargesTotal) * gstRate) / 200 : 0;
    const total = subtotal + chargesTotal + sgst + cgst;
    return { subtotal, sgst, cgst, total };
  };

  const handleSubmit = () => {
    if (!buyerInfo.name || items.length === 0) return;

    const { subtotal, sgst, cgst, total } = calcTotals();

    updateProformaInvoice(invoice.id, {
      buyerInfo,
      items,
      additionalCharges: additionalCharges.map(charge => ({
        id: crypto.randomUUID(),
        name: charge.name,
        amount: charge.amount,
      })),
      status,
      date: new Date(date),
      validUntil: validUntil ? new Date(validUntil) : undefined,
      paymentTerms,
      notes,
      subtotal,
      sgst,
      cgst,
      total,
    });

    setOpen(false);
  };

  const { subtotal, sgst, cgst, total } = calcTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Proforma Invoice - {invoice.proformaNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Buyer Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-buyerName">Company Name *</Label>
                <Input
                  id="edit-buyerName"
                  value={buyerInfo.name}
                  onChange={(e) => setBuyerInfo({...buyerInfo, name: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label htmlFor="edit-contactPerson">Contact Person</Label>
                <Input
                  id="edit-contactPerson"
                  value={buyerInfo.contactPerson}
                  onChange={(e) => setBuyerInfo({...buyerInfo, contactPerson: e.target.value})}
                  placeholder="Enter contact person"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={buyerInfo.email}
                  onChange={(e) => setBuyerInfo({...buyerInfo, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={buyerInfo.phone}
                  onChange={(e) => setBuyerInfo({...buyerInfo, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={buyerInfo.address}
                  onChange={(e) => setBuyerInfo({...buyerInfo, address: e.target.value})}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-gstNumber">GST Number</Label>
                <Input
                  id="edit-gstNumber"
                  value={buyerInfo.gstNumber}
                  onChange={(e) => setBuyerInfo({...buyerInfo, gstNumber: e.target.value})}
                  placeholder="Enter GST number"
                />
              </div>
            </div>
          </Card>

          {/* Invoice Details */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="edit-date">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-validUntil">Valid Until</Label>
                <Input
                  id="edit-validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-paymentTerms">Payment Terms</Label>
                <Input
                  id="edit-paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g., 30 days"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <input
                  id="edit-applyGST"
                  type="checkbox"
                  checked={applyGST}
                  onChange={(e) => setApplyGST(e.target.checked)}
                />
                <label htmlFor="edit-applyGST">Apply GST</label>
              </div>
              {applyGST && (
                <div>
                  <Label htmlFor="edit-gstRate">GST Rate (%)</Label>
                  <Input
                    id="edit-gstRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={gstRate}
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 18"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Items */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button onClick={addRow} variant="outline" size="sm" disabled={!proformaProducts || proformaProducts.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>HSN (Optional)</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-[200px]">
                      <div className="space-y-2">
                        <Input
                          value={item.item?.name || ""}
                          onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                          placeholder="Item name"
                          className="w-full"
                        />
                        {proformaProducts && proformaProducts.length > 0 && (
                          <Select
                            value={item.itemId || ""}
                            onValueChange={(value) => updateItem(index, 'itemId', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Or select from products..." />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                              <div className="px-2 pb-2 sticky top-0 bg-background">
                                <Input
                                  placeholder="Search products..."
                                  value={itemSearch}
                                  onChange={(e) => setItemSearch(e.target.value)}
                                  className="h-8"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              {filteredProducts.length === 0 ? (
                                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                  No products found
                                </div>
                              ) : (
                                filteredProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.unit})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Input
                        value={item.hsnCode || ""}
                        onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
                        placeholder="HSN"
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell className="min-w-[100px]">{formatINR(item.total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {items.length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {additionalCharges.map((charge, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{charge.name}:</span>
                    <span>{formatINR(charge.amount)}</span>
                  </div>
                ))}
                {applyGST && (
                  <>
                    <div className="flex justify-between">
                      <span>SGST ({(gstRate / 2).toFixed(2)}%):</span>
                      <span>{formatINR(sgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST ({(gstRate / 2).toFixed(2)}%):</span>
                      <span>{formatINR(cgst)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Additional Charges */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Additional Charges</h3>
              <Button
                onClick={() => setAdditionalCharges([...additionalCharges, { name: "", amount: 0 }])}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Charge
              </Button>
            </div>

            <div className="space-y-2">
              {additionalCharges.map((charge, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Charge name (e.g., Freight)"
                    value={charge.name}
                    onChange={(e) => {
                      const next = [...additionalCharges];
                      next[idx] = { ...charge, name: e.target.value };
                      setAdditionalCharges(next);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={charge.amount}
                    onChange={(e) => {
                      const next = [...additionalCharges];
                      next[idx] = { ...charge, amount: parseFloat(e.target.value) || 0 };
                      setAdditionalCharges(next);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = additionalCharges.filter((_, i) => i !== idx);
                      setAdditionalCharges(next);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!buyerInfo.name || items.length === 0}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PrintProformaButton = ({ id }: { id: string }) => {
  const { proformaInvoices, businessInfo } = useData();
  const invoice = proformaInvoices.find(p => p.id === id)!;
  const elId = `proforma-print-standalone-${id}`;
  
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
      <div class="section"><h2>Quotation Cum Proforma ${escapeHtml(invoice.proformaNumber)}</h2></div>
      <div class="section">
        <div class="grid">
          <div>
            <strong>Buyer Details</strong>
            <div>${escapeHtml(invoice.buyerInfo.name)}</div>
            ${invoice.buyerInfo.contactPerson ? `<div>${escapeHtml(invoice.buyerInfo.contactPerson)}</div>` : ''}
            <div class="muted">${escapeHtml(invoice.buyerInfo.address)}</div>
            <div class="muted">${escapeHtml(invoice.buyerInfo.email)} · ${escapeHtml(invoice.buyerInfo.phone)}</div>
            ${invoice.buyerInfo.gstNumber ? `<div class="muted">GST: ${escapeHtml(invoice.buyerInfo.gstNumber)}</div>` : ''}
          </div>
          <div>
            <strong>Invoice Details</strong>
            <div>Date: ${formatDateIN(invoice.date)}</div>
            ${invoice.validUntil ? `<div>Valid Until: ${formatDateIN(invoice.validUntil)}</div>` : ''}
            <div>Status: ${escapeHtml(invoice.status)}</div>
            ${invoice.paymentTerms ? `<div>Payment Terms: ${escapeHtml(invoice.paymentTerms)}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="section">
        <p style="margin-bottom: 8px; font-style: italic">We are pleased to submit our quotation for the following items :</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              ${invoice.items.some(it => isValidHsn(it.hsnCode)) ? '<th>HSN</th>' : ''}
              <th>Qty</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <div style="font-weight: 600">${escapeHtml(it.item.name)}</div>
                  ${it.item.description ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px">${escapeHtml(it.item.description)}</div>` : ''}
                </td>
                ${invoice.items.some(i => isValidHsn(i.hsnCode)) ? `<td>${isValidHsn(it.hsnCode) ? escapeHtml(it.hsnCode) : '-'}</td>` : ''}
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
            <tr><td class="label">Subtotal</td><td class="value">${formatINR(invoice.subtotal)}</td></tr>
            ${(invoice.additionalCharges ?? []).map(charge => `<tr><td class="label">${escapeHtml(charge.name)}</td><td class="value">${formatINR(charge.amount)}</td></tr>`).join('')}
            ${invoice.sgst > 0 || invoice.cgst > 0 ? `
              <tr><td class="label">SGST (${((invoice.sgst / (invoice.subtotal + (invoice.additionalCharges?.reduce((sum, c) => sum + c.amount, 0) ?? 0))) * 100).toFixed(2)}%)</td><td class="value">${formatINR(invoice.sgst)}</td></tr>
              <tr><td class="label">CGST (${((invoice.cgst / (invoice.subtotal + (invoice.additionalCharges?.reduce((sum, c) => sum + c.amount, 0) ?? 0))) * 100).toFixed(2)}%)</td><td class="value">${formatINR(invoice.cgst)}</td></tr>
            ` : `<tr><td class="label">GST</td><td class="value">Not Applied</td></tr>`}
            <tr><td class="label"><strong>Total Amount</strong></td><td class="value"><strong>${formatINR(invoice.total)}</strong></td></tr>
          </tbody>
        </table>
        <div class="amount-words">Amount in Words: ${numberToWords(invoice.total)}</div>
      </div>
      <div class="section terms">
        <strong>Terms & Conditions:</strong>
        <div class="muted" style="margin-top: 8px; line-height: 1.4">
          1. Payment terms: ${escapeHtml(invoice.paymentTerms || "As agreed")}<br />
          2. Prices are valid until: ${invoice.validUntil ? formatDateIN(invoice.validUntil) : "Further notice"}<br />
          3. All prices are subject to change without prior notice<br />
          4. This is a proforma invoice and not a tax invoice<br />
          5. All rates are inclusive of applicable taxes
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 24px">
        ${businessInfo.bankDetails ? `
          <div class="section">
            <strong>Bank Details:</strong>
            <div class="muted" style="margin-top: 8px; line-height: 1.6">
              Bank Name: ${escapeHtml(businessInfo.bankDetails.bankName)}<br />
              Account No: ${escapeHtml(businessInfo.bankDetails.accountNumber)}<br />
              IFSC Code: ${escapeHtml(businessInfo.bankDetails.ifscCode)}
            </div>
          </div>
        ` : ''}
        ${businessInfo.signature ? `
          <div class="signature-section">
            <div>Authorized Signatory</div>
            <img src="${escapeHtml(businessInfo.signature)}" alt="Authorized Signature" class="signature-image" style="margin-top: 8px" />
            <div class="muted">${escapeHtml(businessInfo.name)}</div>
          </div>
        ` : ''}
      </div>
      ${invoice.notes ? `<div class="footer">Notes: ${escapeHtml(invoice.notes)}</div>` : ''}
    `;
    
    printElementById(elId, `Quotation Cum Proforma ${invoice.proformaNumber}`);
    setTimeout(() => document.body.removeChild(tempDiv), 500);
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="w-4 h-4 mr-2" />
      Print
    </Button>
  );
};

const DeleteProformaDialog = ({ id }: { id: string }) => {
  const { removeProformaInvoice } = useData();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    removeProformaInvoice(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Proforma Invoice</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete this proforma invoice? This action cannot be undone.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProformaInvoice;

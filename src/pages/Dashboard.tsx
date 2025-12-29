import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  TrendingUp,
  ShoppingCart,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Users,
  DollarSign,
  Lock,
  AlertCircle,
  Target,
  Layers,
  RefreshCw,
  Eye,
  Truck,
  FileCheck,
  Receipt,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatINR } from "@/lib/format";

const Dashboard = () => {
  // Demo statistics for showcase
  const stats = {
    totalItems: 156,
    totalInventoryValue: 2450000,
    lowStockItems: 8,
    totalPurchaseOrders: 47,
    pendingPOs: 12,
    totalPOValue: 1875000,
    totalGoodsReceipts: 38,
    pendingGRs: 3,
    totalProformaInvoices: 29,
    totalProformaValue: 980000,
    pendingProformas: 5
  };
  
  const features = [
    {
      icon: Package,
      title: "Smart Inventory Management",
      description: "Track stock levels in real-time with automatic low-stock alerts and detailed analytics"
    },
    {
      icon: ShoppingCart,
      title: "Purchase Orders",
      description: "Create and manage purchase orders with automated calculations and supplier tracking"
    },
    {
      icon: FileText,
      title: "Goods Receipt Notes",
      description: "Record incoming inventory with complete audit trails and automatic stock updates"
    },
    {
      icon: BarChart3,
      title: "Proforma Invoices",
      description: "Generate professional invoices with GST calculations and customizable templates"
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Monitor your business performance with comprehensive dashboards and reports"
    },
    {
      icon: Shield,
      title: "Complete Compliance",
      description: "Built-in GST support with automatic tax calculations and detailed records"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Boost Efficiency",
      stat: "3x Faster",
      description: "Streamline operations"
    },
    {
      icon: DollarSign,
      title: "Reduce Costs",
      stat: "40% Savings",
      description: "Optimize inventory"
    },
    {
      icon: Clock,
      title: "Save Time",
      stat: "10hrs/week",
      description: "Automate processes"
    },
    {
      icon: Users,
      title: "Scale Business",
      stat: "Unlimited",
      description: "Grow with confidence"
    }
  ];

  const workflows = [
    { step: "01", title: "Set Up", description: "Configure your business details and suppliers" },
    { step: "02", title: "Add Items", description: "Create your inventory catalog with details" },
    { step: "03", title: "Create Orders", description: "Generate purchase orders and track deliveries" },
    { step: "04", title: "Manage Stock", description: "Receive goods and monitor inventory levels" }
  ];

  const coreFeatures = [
    {
      icon: Package,
      title: "Inventory Tracking",
      points: [
        "Real-time stock level monitoring",
        "Automatic low stock alerts",
        "Multi-unit support (pcs, kg, liters, etc.)",
        "Historical inventory analytics"
      ]
    },
    {
      icon: ShoppingCart,
      title: "Purchase Management",
      points: [
        "Create and manage purchase orders",
        "Supplier relationship management",
        "Automated pricing calculations",
        "Order status tracking"
      ]
    },
    {
      icon: FileText,
      title: "Document Management",
      points: [
        "Goods receipt notes generation",
        "Proforma invoice creation",
        "Scrap note management",
        "Complete audit trails"
      ]
    },
    {
      icon: BarChart3,
      title: "Business Intelligence",
      points: [
        "Price tracking and analytics",
        "Inventory valuation reports",
        "Supplier performance metrics",
        "Business dashboard insights"
      ]
    }
  ];

  const indianBusinessFeatures = [
    {
      icon: Shield,
      title: "GST Compliance",
      description: "Automatic GST calculations and compliance ready for Indian tax requirements"
    },
    {
      icon: Lock,
      title: "Secure Data",
      description: "Enterprise-level security with encrypted data storage and regular backups"
    },
    {
      icon: DollarSign,
      title: "Cost Optimization",
      description: "Track supplier prices, manage discounts, and optimize purchase costs"
    },
    {
      icon: RefreshCw,
      title: "Automated Workflows",
      description: "Streamline repetitive tasks with automated purchase order and invoice generation"
    }
  ];

  const keyCapabilities = [
    { number: "15+", label: "Key Features" },
    { number: "100%", label: "GST Compliant" },
    { number: "24/7", label: "Support Ready" },
    { number: "∞", label: "Scalability" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20 px-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="mb-6">
              <img src="https://cdn.builder.io/api/v1/image/assets%2Fc53d55d6e77f4fc3a0917324bbf678cd%2F327ce537ca7a4e5bb4b15a6a6569900e?format=webp&width=800" alt="CORS Logo" className="h-20 mx-auto object-contain" />
            </div>
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <p>Corporate Operations Resource System </p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Manage Your Inventory
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Like Never Before
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your inventory operations with powerful tools for purchase orders, 
              goods receipts, and real-time tracking. Built for Indian businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg px-8 group">
                <Link to="/auth">
                  Sign In / Sign Up
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Statistics Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Business at a Glance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sample statistics showcasing system capabilities
            </p>
          </div>
          
          {/* Main Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Inventory Items</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalItems}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Value: {formatINR(stats.totalInventoryValue)}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Purchase Orders</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalPurchaseOrders}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.pendingPOs} pending
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Goods Receipts</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalGoodsReceipts}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.pendingGRs} in quality check
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Receipt className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Proforma Invoices</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalProformaInvoices}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.pendingProformas} pending
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Purchase Value</p>
                  <p className="text-2xl font-bold text-foreground">{formatINR(stats.totalPOValue)}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Across {stats.totalPurchaseOrders} orders</span>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Proforma Value</p>
                  <p className="text-2xl font-bold text-foreground">{formatINR(stats.totalProformaValue)}</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Across {stats.totalProformaInvoices} invoices</span>
              </div>
            </Card>
          </div>

          {/* Alert Section */}
          {stats.lowStockItems > 0 && (
            <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Low Stock Alert</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {stats.lowStockItems} {stats.lowStockItems === 1 ? 'item is' : 'items are'} below minimum stock level
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/inventory">View Inventory</Link>
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {keyCapabilities.map((metric) => (
              <Card key={metric.label} className="p-8 text-center hover:shadow-lg transition-[var(--transition-smooth)]">
                <div className="text-4xl font-bold text-primary mb-2">{metric.number}</div>
                <div className="text-sm text-muted-foreground font-medium">{metric.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose CORS?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the benefits of streamlined inventory management
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="p-6 text-center hover:shadow-lg transition-[var(--transition-smooth)]">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">{benefit.stat}</div>
                  <div className="text-sm font-medium text-foreground mb-1">{benefit.title}</div>
                  <div className="text-xs text-muted-foreground">{benefit.description}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive features designed to simplify your inventory management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)] animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Core Modules
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful modules to manage every aspect of your inventory
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {coreFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-8 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        {feature.title}
                      </h3>
                      <ul className="space-y-2">
                        {feature.points.map((point) => (
                          <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Indian Business Features */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Indian Businesses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Features specifically designed to meet Indian business requirements
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {indianBusinessFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-muted-foreground">
              Four simple steps to transform your inventory management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflows.map((workflow, index) => (
              <div key={workflow.step} className="relative">
                <Card className="p-6 h-full hover:shadow-lg transition-[var(--transition-smooth)]">
                  <div className="text-5xl font-bold text-primary/20 mb-4">{workflow.step}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{workflow.title}</h3>
                  <p className="text-muted-foreground text-sm">{workflow.description}</p>
                  <CheckCircle2 className="w-5 h-5 text-success absolute top-6 right-6" />
                </Card>
                {index < workflows.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-primary/30 w-6 h-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Workflows Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Essential Workflows
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamlined processes for your daily inventory operations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Purchase Order Management</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Create orders from supplier lists
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Track order status and deliveries
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Manage supplier communications
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Goods Receipt</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Record incoming inventory
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Quality check workflows
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Automatic stock updates
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Price Analytics</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Track price fluctuations
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Compare supplier pricing
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Optimize procurement costs
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileCheck className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Invoice Management</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Generate proforma invoices
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  GST calculations included
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Professional templates
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Inventory Alerts</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Low stock notifications
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Expiry date tracking
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Real-time monitoring
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Reports & Analytics</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Detailed inventory reports
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Supplier performance metrics
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Business KPI dashboard
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Quick Questions?
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know to get started
            </p>
          </div>
          <div className="space-y-4">
            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <details className="cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-foreground hover:text-primary transition-colors">
                  <span>How long does it take to set up?</span>
                  <span className="text-sm">+</span>
                </summary>
                <p className="text-muted-foreground text-sm mt-4">
                  CORS is designed for quick setup. You can start in minutes by configuring your business details, adding suppliers, and creating your first inventory items. Most businesses are fully operational within 30 minutes.
                </p>
              </details>
            </Card>

            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <details className="cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-foreground hover:text-primary transition-colors">
                  <span>Is it GST compliant?</span>
                  <span className="text-sm">+</span>
                </summary>
                <p className="text-muted-foreground text-sm mt-4">
                  Yes, CORS is fully GST compliant for Indian businesses. All invoices and receipts automatically calculate GST based on your configured rates, and you can generate compliant tax reports.
                </p>
              </details>
            </Card>

            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <details className="cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-foreground hover:text-primary transition-colors">
                  <span>What inventory limits do I have?</span>
                  <span className="text-sm">+</span>
                </summary>
                <p className="text-muted-foreground text-sm mt-4">
                  There are no limits on the number of items, suppliers, or transactions you can manage. CORS scales with your business from small operations to large enterprises.
                </p>
              </details>
            </Card>

            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <details className="cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-foreground hover:text-primary transition-colors">
                  <span>Can I import existing data?</span>
                  <span className="text-sm">+</span>
                </summary>
                <p className="text-muted-foreground text-sm mt-4">
                  Yes, you can manually add your existing inventory and supplier data through our intuitive interface. We're also working on bulk import features for easier data migration.
                </p>
              </details>
            </Card>

            <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <details className="cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-foreground hover:text-primary transition-colors">
                  <span>How is my data secured?</span>
                  <span className="text-sm">+</span>
                </summary>
                <p className="text-muted-foreground text-sm mt-4">
                  We employ enterprise-level security with encrypted data storage, regular backups, and secure access controls. Your business data is protected with industry-standard security practices.
                </p>
              </details>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Monthly Plan */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 border-border">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">Monthly</h3>
                <p className="text-sm text-muted-foreground mb-6">Pay as you go</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">₹250</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    All features included
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Unlimited transactions
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Priority support
                  </li>
                </ul>
                <Button asChild className="w-full" size="lg">
                  <a href="mailto:necrus@yahoo.com?subject=CORS%20Inventory%20Monthly%20Subscription&body=Hi%2C%20I%20would%20like%20to%20subscribe%20to%20the%20CORS%20Inventory%20Monthly%20Plan%20(%E2%82%B9250%2Fmonth).%20Please%20share%20the%20payment%20details.">Get Started</a>
                </Button>
              </div>
            </Card>

            {/* Yearly Plan */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                SAVE ₹500
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">Yearly</h3>
                <p className="text-sm text-muted-foreground mb-6">Best value</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-foreground">₹2,500</span>
                  <span className="text-muted-foreground">/year</span>
                </div>
                <p className="text-sm text-primary font-medium mb-6">
                  ₹208/month • Save ₹500
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    All features included
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Unlimited transactions
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Priority support
                  </li>
                </ul>
                <Button asChild className="w-full" size="lg">
                  <a href="mailto:necrus@yahoo.com?subject=CORS%20Inventory%20Yearly%20Subscription&body=Hi%2C%20I%20would%20like%20to%20subscribe%20to%20the%20CORS%20Inventory%20Yearly%20Plan%20(%E2%82%B92%2C500%2Fyear).%20Please%20share%20the%20payment%20details.">Get Started</a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of businesses using CORS to streamline their inventory management, reduce costs, and scale efficiently.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Get started in three easy steps:</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg" className="text-base px-8">
                    <Link to="/business">1. Configure Business</Link>
                  </Button>
                  <Button asChild size="lg" className="text-base px-8">
                    <Link to="/suppliers">2. Add Suppliers</Link>
                  </Button>
                  <Button asChild size="lg" className="text-base px-8">
                    <Link to="/inventory">3. Manage Inventory</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://cdn.builder.io/api/v1/image/assets%2Fc53d55d6e77f4fc3a0917324bbf678cd%2F327ce537ca7a4e5bb4b15a6a6569900e?format=webp&width=200" 
                alt="CORS Logo" 
                className="h-8 object-contain" 
              />
              <div className="h-6 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                A <span className="font-bold text-foreground">Necrus</span> Company
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CORS - Corporate Operations Resource System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

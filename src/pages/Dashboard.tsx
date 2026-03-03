import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  UserCheck,
  CalendarDays,
  IndianRupee,
  QrCode,
  Shield,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track stock levels in real-time with automatic low-stock alerts.",
    },
    {
      icon: ShoppingCart,
      title: "Purchase Orders",
      description: "Create and manage purchase orders with supplier tracking.",
    },
    {
      icon: FileText,
      title: "Goods Receipt",
      description: "Record incoming inventory with audit trails and stock updates.",
    },
    {
      icon: BarChart3,
      title: "Proforma Invoices",
      description: "Generate GST-compliant invoices with professional templates.",
    },
    {
      icon: UserCheck,
      title: "Employee Management",
      description: "Complete employee directory with profiles and salary details.",
    },
    {
      icon: IndianRupee,
      title: "Payroll & Payslips",
      description: "Auto-calculate salaries and generate downloadable PDF payslips.",
    },
  ];

  const highlights = [
    { label: "GST Compliant", value: "100%" },
    { label: "To Get Started", value: "₹0" },
    { label: "Cloud Access", value: "24/7" },
    { label: "Setup Time", value: "5 min" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <img src="/assets/opis-logo.png" alt="OPIS" className="h-9 object-contain" />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/8 border border-primary/15 rounded-full text-primary text-sm font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            Trusted by Indian businesses
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
            Simple Management for{" "}
            <span className="text-primary">Growing Businesses</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Manage inventory, purchase orders, invoices, employees & payroll — all in one platform built for Indian businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link to="/auth">
                Start Free Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 h-12">
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4">
            {["Free to get started", "No credit card required", "GST compliant", "Secure cloud storage"].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border bg-muted/30 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {highlights.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{item.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From inventory to payroll, OPIS has all the tools to run your business.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-6 hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Why Choose OPIS?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Zap, title: "Fast Setup", desc: "Get started in under 5 minutes. No complex configuration needed." },
              { icon: Shield, title: "GST Ready", desc: "Built-in GST calculations and compliance for all your documents." },
              { icon: Clock, title: "Save Time", desc: "Automate inventory, attendance, and payroll workflows." },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Simple Pricing
            </h2>
            <p className="text-lg text-muted-foreground">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-1">Monthly</h3>
              <p className="text-sm text-muted-foreground mb-6">Pay as you go</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">₹499</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                {["All features included", "Unlimited transactions", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <a href="mailto:necrus@yahoo.com?subject=OPIS%20Monthly%20Subscription">Get Started</a>
              </Button>
            </Card>

            <Card className="p-8 text-center border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                Best Value
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Yearly</h3>
              <p className="text-sm text-muted-foreground mb-6">Save ₹998</p>
              <div className="mb-2">
                <span className="text-4xl font-bold text-foreground">₹4,990</span>
                <span className="text-muted-foreground">/yr</span>
              </div>
              <p className="text-sm text-primary font-medium mb-6">₹416/month</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                {["All features included", "Unlimited transactions", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <a href="mailto:necrus@yahoo.com?subject=OPIS%20Yearly%20Subscription">Get Started</a>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join businesses using OPIS to streamline operations and grow efficiently.
          </p>
          <Button asChild size="lg" className="text-base px-10 h-12">
            <Link to="/auth">
              Start Free Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/assets/opis-logo.png" alt="OPIS" className="h-8 object-contain mb-3" />
              <p className="text-sm text-muted-foreground">Order, Purchase & Inventory System</p>
              <span className="text-xs text-muted-foreground mt-1 block">
                A <span className="font-semibold text-foreground">Necrus</span> Product
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} OPIS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

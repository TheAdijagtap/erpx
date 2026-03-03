import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Users,
  UserCheck,
  CalendarDays,
  IndianRupee,
  QrCode,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const modules = [
    {
      icon: Package,
      title: "Inventory",
      description: "Real-time stock tracking with low-stock alerts, batch management, and item categorization.",
    },
    {
      icon: ShoppingCart,
      title: "Purchase Orders",
      description: "Create, track, and manage purchase orders with automated GST calculations.",
    },
    {
      icon: FileText,
      title: "Goods Receipt",
      description: "Record incoming inventory with quality checks and automatic stock updates.",
    },
    {
      icon: BarChart3,
      title: "Proforma Invoices",
      description: "Generate professional GST-compliant invoices with customizable templates.",
    },
    {
      icon: UserCheck,
      title: "Employee Management",
      description: "Complete employee directory with profiles, departments, and salary details.",
    },
    {
      icon: CalendarDays,
      title: "Attendance & Leave",
      description: "Daily check-in/out tracking, leave approvals, and calendar overviews.",
    },
    {
      icon: QrCode,
      title: "QR Leave Requests",
      description: "Employees scan a QR code to submit leave requests — no login needed.",
    },
    {
      icon: IndianRupee,
      title: "Payroll & Payslips",
      description: "Auto-calculate salaries from attendance and generate downloadable PDF payslips.",
    },
  ];

  const metrics = [
    { value: "20+", label: "Features" },
    { value: "100%", label: "GST Compliant" },
    { value: "<30min", label: "Setup Time" },
    { value: "∞", label: "Scalability" },
  ];

  const steps = [
    { num: "01", title: "Configure Business", desc: "Add your business details, GST info, and branding." },
    { num: "02", title: "Add Suppliers & Items", desc: "Build your supplier list and inventory catalog." },
    { num: "03", title: "Start Operations", desc: "Create orders, receive goods, and generate invoices." },
    { num: "04", title: "Manage Workforce", desc: "Track attendance, process payroll, and download payslips." },
  ];

  const faqs = [
    { q: "How long does it take to set up?", a: "Most businesses are fully operational within 30 minutes. Just configure your business details, add suppliers, and start managing inventory." },
    { q: "Is OPIS GST compliant?", a: "Yes — all invoices, purchase orders, and receipts automatically calculate GST. Reports are compliance-ready for Indian tax requirements." },
    { q: "Are there any item or transaction limits?", a: "No limits. OPIS scales with your business from small operations to large enterprises — unlimited items, suppliers, and transactions." },
    { q: "How is my data secured?", a: "We use enterprise-grade encrypted storage, regular backups, and secure row-level access controls. Your business data is fully protected." },
  ];

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/opis-logo.png" alt="OPIS" className="h-7 object-contain" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">
                {l.label}
              </a>
            ))}
            <div className="pt-3 border-t border-border flex gap-3">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.03]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-4 py-1.5 rounded-full">
              Built for Indian MSMEs
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              The All-in-One ERP
              <br />
              <span className="text-primary">Your Business Needs</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Inventory, purchasing, HR, payroll & invoicing — unified in one GST-compliant platform. Set up in under 30 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild size="lg" className="text-base px-8">
                <Link to="/auth">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-1">No credit card required · 14-day free trial</p>
          </div>
        </div>
      </section>

      {/* ── Metrics Strip ── */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((m) => (
              <div key={m.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{m.value}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Modules</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Everything You Need, Nothing You Don't
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Eight powerful modules working together to run your entire business from one dashboard.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Card
                  key={mod.title}
                  className="group p-6 hover:shadow-md transition-all duration-300 hover:border-primary/30"
                >
                  <div className="p-2.5 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why OPIS ── */}
      <section className="py-20 md:py-28 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Why OPIS</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-6">
                Purpose-Built for Indian MSMEs
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Large ERPs are expensive and complex. Spreadsheets don't scale. OPIS bridges the gap — affordable, intuitive, and GST-ready from day one.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Shield, text: "100% GST compliant with automatic tax calculations" },
                  { icon: Zap, text: "Set up your entire business in under 30 minutes" },
                  { icon: Clock, text: "Save 10+ hours per week on manual processes" },
                  { icon: Users, text: "Scale from 1 to 1,000+ employees seamlessly" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-md mt-0.5">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "3×", label: "Faster Operations", sub: "vs manual tracking" },
                { num: "40%", label: "Cost Savings", sub: "inventory optimization" },
                { num: "10hrs", label: "Saved Weekly", sub: "automated workflows" },
                { num: "0", label: "Paper Required", sub: "fully digital" },
              ].map((stat) => (
                <Card key={stat.label} className="p-6 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.num}</div>
                  <div className="text-sm font-medium text-foreground">{stat.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Getting Started</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Up and Running in 4 Steps
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From sign-up to your first payslip — in under 30 minutes.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                <Card className="p-6 h-full">
                  <div className="text-4xl font-bold text-primary/15 mb-3">{step.num}</div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </Card>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-1/2 -right-3.5 -translate-y-1/2 w-5 h-5 text-primary/25" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 md:py-28 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" /> Simple Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Choose the Right Plan for Your Business
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free with a 14-day trial. Upgrade anytime via WhatsApp — no complicated checkout.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Free Trial */}
            <Card className="p-8 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Free Trial</h3>
                <p className="text-sm text-muted-foreground mb-6">Perfect to get started</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">₹0</span>
                  <span className="text-muted-foreground text-sm"> / 14 days</span>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8 text-left">
                  {["Full access to all features", "GST invoicing", "Expense tracking", "Up to 50 invoices", "Basic reports", "Email support"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground/50 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link to="/auth">Start Free Trial</Link>
              </Button>
            </Card>

            {/* Monthly - Most Popular */}
            <Card className="p-8 border-2 border-primary relative hover:shadow-lg transition-shadow shadow-md flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Most Popular
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Monthly</h3>
                <p className="text-sm text-muted-foreground mb-6">For growing businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">₹499</span>
                  <span className="text-muted-foreground text-sm"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8 text-left">
                  {["Everything in Free Trial", "Unlimited invoices", "Advanced GST reports", "Credit & Debit notes", "Priority WhatsApp support", "CSV & PDF exports"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button asChild className="w-full" size="lg">
                <a href={`https://wa.me/919373751128?text=${encodeURIComponent("Hi! I'd like to subscribe to the OPIS Monthly Plan (₹499/month). Please share the payment details.")}`} target="_blank" rel="noopener noreferrer">
                  Subscribe via WhatsApp
                </a>
              </Button>
            </Card>

            {/* Yearly */}
            <Card className="p-8 hover:shadow-md transition-shadow relative flex flex-col">
              <div className="absolute -top-3 right-4 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                Save 33%
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Yearly</h3>
                <p className="text-sm text-muted-foreground mb-6">Best value for committed teams</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">₹3,999</span>
                  <span className="text-muted-foreground text-sm"> / year</span>
                  <p className="text-xs text-muted-foreground line-through mt-1">₹5,988/year</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8 text-left">
                  {["Everything in Monthly", "Unlimited everything", "Dedicated account manager", "Custom invoice branding", "Data backup & export", "2 months free"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground/50 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button asChild variant="outline" className="w-full" size="lg">
                <a href={`https://wa.me/919373751128?text=${encodeURIComponent("Hi! I'd like to subscribe to the OPIS Yearly Plan (₹3,999/year). Please share the payment details.")}`} target="_blank" rel="noopener noreferrer">
                  Subscribe via WhatsApp
                </a>
              </Button>
            </Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            All plans include GST. Subscribe easily via WhatsApp — we activate your account instantly.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Common Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.q} className="overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-foreground hover:text-primary transition-colors text-sm">
                    {faq.q}
                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0 ml-4" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28 px-6 bg-primary/[0.04]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Streamline Your Business?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join hundreds of Indian MSMEs running smarter operations with OPIS. Start your free trial today.
          </p>
          <Button asChild size="lg" className="text-base px-10">
            <Link to="/auth">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-background py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <img src="/assets/opis-logo.png" alt="OPIS" className="h-7 object-contain mb-3" />
              <p className="text-sm text-muted-foreground mb-1">Order, Purchase & Inventory System</p>
              <span className="text-xs text-muted-foreground">
                A <span className="font-semibold text-foreground">Necrus</span> Product
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">Sign In</Link></li>
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
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

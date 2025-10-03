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
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20 px-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
              Professional Inventory Management System
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
                <Link to="/inventory">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link to="/business">Configure Business</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
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
      <section className="py-20 px-6">
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

      {/* How It Works */}
      <section className="py-20 px-6 bg-gradient-to-b from-muted/30 to-background">
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

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of businesses using our platform to streamline their inventory management
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/inventory">Start Managing Inventory</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/suppliers">Add Your First Supplier</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
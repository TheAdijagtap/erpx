import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Users, Shield, Zap, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/opis-logo.png" alt="OPIS Logo" className="h-8 object-contain" />
          </Link>
          <Button asChild size="sm">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">About OPIS</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built by Necrus, OPIS is India's purpose-built ERP for MSMEs — combining inventory, purchasing, HR, and payroll in one affordable platform.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                OPIS was born from a simple observation: Indian MSMEs deserve world-class business management tools without enterprise-level complexity or pricing.
              </p>
              <p className="text-muted-foreground mb-4">
                While large corporations have access to sophisticated ERP systems, small and medium businesses are often left with spreadsheets, paper registers, and disconnected tools that slow down growth.
              </p>
              <p className="text-muted-foreground">
                We built OPIS to bridge this gap — a comprehensive, GST-compliant, India-first platform that any business can set up in under 30 minutes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Businesses Served</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">20+</div>
                <div className="text-sm text-muted-foreground">Key Features</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">GST Compliant</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Support Ready</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Our Mission</h3>
              <p className="text-muted-foreground">
                To empower every Indian MSME with affordable, intuitive, and comprehensive business management tools that drive growth and efficiency.
              </p>
            </Card>
            <Card className="p-8">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Our Vision</h3>
              <p className="text-muted-foreground">
                A future where technology levels the playing field — where every small business has access to the same powerful tools as large enterprises.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Simplicity", desc: "Complex problems deserve simple solutions. Every feature in OPIS is designed to be intuitive." },
              { icon: Shield, title: "Reliability", desc: "Your business data is precious. We ensure enterprise-grade security and 99.9% uptime." },
              { icon: Heart, title: "Customer First", desc: "We build what MSMEs actually need, not what looks good in a feature list." },
            ].map((v) => (
              <Card key={v.title} className="p-6 text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Join the OPIS Community</h2>
          <p className="text-muted-foreground mb-6">Start your journey towards smarter business management.</p>
          <Button asChild size="lg">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to Home</Link>
        </div>
      </footer>
    </div>
  );
};

export default About;

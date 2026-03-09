import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const WHATSAPP_NUMBER = "919373751128";

const Contact = () => {
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about OPIS? We're here to help. Reach out to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8">
              <div className="p-3 bg-green-500/10 rounded-lg w-fit mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">WhatsApp Support</h3>
              <p className="text-muted-foreground mb-4">Get instant support via WhatsApp. We typically respond within minutes.</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I have a question about OPIS.")}`} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </Button>
            </Card>

            <Card className="p-8">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-4">Send us a detailed email and we'll get back to you within 24 hours.</p>
              <Button asChild variant="outline">
                <a href="mailto:necrus@yahoo.com?subject=OPIS Inquiry">necrus@yahoo.com</a>
              </Button>
            </Card>

            <Card className="p-8">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Phone</h3>
              <p className="text-muted-foreground mb-4">Call us during business hours for immediate assistance.</p>
              <p className="text-foreground font-medium">+91 93737 51128</p>
            </Card>

            <Card className="p-8">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Location</h3>
              <p className="text-muted-foreground mb-4">Based in India, serving MSMEs across the nation.</p>
              <p className="text-foreground font-medium">India</p>
            </Card>
          </div>
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

export default Contact;

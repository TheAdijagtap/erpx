import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy - OPIS ERP"
        description="Read the OPIS privacy policy. Learn how we collect, use, and protect your data when using our ERP platform."
        canonical="https://opis.in/privacy"
        keywords="OPIS privacy policy, data protection, ERP privacy"
      />
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

      <article className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: February 27, 2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p>When you use OPIS, we collect information you provide directly, including your name, email address, business details, and any data you enter into the system such as inventory items, supplier information, employee records, and financial data.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <p>We use your information to provide and improve OPIS services, including managing your inventory, generating invoices, processing payroll calculations, and providing customer support. We do not sell your data to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
              <p>Your data is stored securely with enterprise-level encryption. We use industry-standard security practices including encrypted data transmission (SSL/TLS), secure data storage, regular backups, and access controls to protect your business information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Sharing</h2>
              <p>We do not share your personal or business data with third parties except when required by law or with your explicit consent. Your business data remains yours — we are merely custodians.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies & Analytics</h2>
              <p>OPIS uses essential cookies for authentication and session management. We may use analytics to understand how our service is used and to improve the user experience.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal data at any time. You can export your data or request account deletion by contacting our support team.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact</h2>
              <p>For privacy-related inquiries, contact us at <a href="mailto:necrus@yahoo.com" className="text-primary underline">necrus@yahoo.com</a> or via WhatsApp at +91 93737 51128.</p>
            </section>
          </div>
        </div>
      </article>

      <footer className="py-8 px-6 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to Home</Link>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;

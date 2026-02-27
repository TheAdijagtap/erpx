import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: February 27, 2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using OPIS (Order, Purchase & Inventory System), you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Service Description</h2>
              <p>OPIS is a cloud-based business management platform providing inventory management, purchase order management, goods receipt tracking, proforma invoicing, employee management, attendance tracking, leave management, and payroll services for Indian businesses.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to update it as necessary. You may create sub-user accounts with limited permissions for your team members.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Subscription & Pricing</h2>
              <p>OPIS offers a free trial period followed by paid subscriptions. Current pricing is ₹250/month or ₹2,500/year. Prices are subject to change with prior notice. All payments are non-refundable unless otherwise stated.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Ownership</h2>
              <p>You retain full ownership of all data you enter into OPIS. We do not claim any intellectual property rights over your business data. You may export or delete your data at any time.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Acceptable Use</h2>
              <p>You agree not to use OPIS for any unlawful purpose, to attempt to gain unauthorized access to other users' data, or to interfere with the service's operation.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Service Availability</h2>
              <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance when possible.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
              <p>OPIS is provided "as is" without warranties of any kind. Necrus shall not be liable for any indirect, incidental, or consequential damages arising from the use of the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact</h2>
              <p>For questions about these terms, contact us at <a href="mailto:necrus@yahoo.com" className="text-primary underline">necrus@yahoo.com</a>.</p>
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

export default Terms;

import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

const blogContent: Record<string, { title: string; date: string; readTime: string; category: string; metaDescription: string; content: string }> = {
  "why-msme-need-erp": {
    title: "Why Every MSME Needs an ERP System in 2026",
    date: "February 25, 2026",
    readTime: "6 min read",
    category: "MSME Growth",
    metaDescription: "Discover why ERP systems are essential for MSMEs in India — streamline operations, cut costs, and scale efficiently with OPIS.",
    content: `
## The MSME Challenge in India

India's MSME sector contributes over 30% to the nation's GDP and employs more than 110 million people. Yet, a staggering 70% of MSMEs still rely on manual processes — spreadsheets, paper registers, and disconnected tools — to manage their daily operations.

This creates bottlenecks that slow growth:
- **Inventory mismatches** leading to stockouts or overstocking
- **Manual purchase orders** consuming hours every week
- **No real-time visibility** into business performance
- **GST compliance headaches** with manual calculations

## What is an ERP System?

An ERP (Enterprise Resource Planning) system integrates all your core business processes — inventory, purchasing, invoicing, HR, payroll — into a single platform. Instead of juggling 5 different tools, you manage everything from one dashboard.

## Why MSMEs Specifically Need ERP

### 1. Limited Workforce, Maximum Efficiency
MSMEs typically operate with lean teams. An ERP automates repetitive tasks like stock tracking, purchase order generation, and salary calculations — freeing your team to focus on growth.

### 2. Cost Optimization
With real-time inventory data, you avoid over-ordering and reduce waste. OPIS users report up to **40% reduction in inventory costs** within the first quarter.

### 3. GST Compliance Made Easy
For Indian MSMEs, GST compliance is non-negotiable. OPIS automatically calculates CGST, SGST, and IGST on every invoice and purchase order, ensuring you're always compliant.

### 4. Scalability Without Complexity
As your business grows from 50 items to 5,000, OPIS scales with you — no migration headaches, no data loss, no learning curve.

## How OPIS Solves This

OPIS is purpose-built for Indian MSMEs. Unlike enterprise ERPs that cost lakhs and require months of implementation, OPIS gets you started in **under 30 minutes** at just **₹499/month**.

Key advantages:
- **Inventory + HR + Payroll** in one platform
- **QR-based leave requests** — employees don't need logins
- **PDF payslip generation** with one click
- **Real-time dashboards** for instant business insights

## Getting Started

The best time to adopt an ERP was yesterday. The second best time is today. [Sign up for OPIS](/auth) and transform how you run your business.
    `,
  },
  "inventory-management-best-practices": {
    title: "Top 10 Inventory Management Best Practices for Small Businesses",
    date: "February 20, 2026",
    readTime: "8 min read",
    category: "Inventory",
    metaDescription: "Learn 10 proven inventory management best practices that help Indian small businesses reduce waste, save costs, and improve efficiency.",
    content: `
## Why Inventory Management Matters

Poor inventory management costs businesses thousands of rupees every month — through stockouts, overstocking, expired goods, and missed opportunities. Here are 10 best practices every MSME should follow.

## 1. Use Real-Time Tracking

Stop relying on weekly stock counts. Real-time inventory tracking with a tool like OPIS ensures you always know exactly what's in stock, what's running low, and what needs reordering.

## 2. Set Reorder Levels

Define minimum stock levels for each item. OPIS alerts you automatically when stock drops below the reorder point, preventing costly stockouts.

## 3. Categorize Your Inventory

Use ABC analysis to prioritize:
- **A items**: High-value, low-quantity — track closely
- **B items**: Moderate value — regular monitoring
- **C items**: Low-value, high-quantity — minimal attention

## 4. Track Supplier Performance

Monitor which suppliers deliver on time, offer the best prices, and maintain quality. OPIS maintains a complete supplier directory with price history tracking.

## 5. Implement FIFO (First In, First Out)

Ensure older stock gets used first. This is critical for businesses dealing with perishable goods or items with shelf lives.

## 6. Regular Audits

Even with digital tracking, conduct periodic physical audits. Compare actual stock with system records to catch discrepancies early.

## 7. Automate Purchase Orders

Manual PO creation is error-prone and time-consuming. OPIS lets you create purchase orders in minutes with automatic calculations and supplier auto-fill.

## 8. Use Batch Tracking

Track inventory by batch numbers for quality control and traceability. OPIS's goods receipt module supports batch-level tracking.

## 9. Monitor Price Fluctuations

Track how item prices change across suppliers and over time. OPIS's price history feature helps you negotiate better deals.

## 10. Integrate with Invoicing

Your inventory system should connect with your invoicing. When you create a proforma invoice in OPIS, stock levels are always visible, ensuring accurate quotes.

## Start Today

Implementing these practices doesn't require enterprise budgets. [Try OPIS](/auth) — built specifically for Indian MSMEs who want professional inventory management without the complexity.
    `,
  },
  "gst-compliance-erp": {
    title: "How ERP Software Simplifies GST Compliance for Indian Businesses",
    date: "February 15, 2026",
    readTime: "5 min read",
    category: "GST & Compliance",
    metaDescription: "Learn how OPIS ERP software automates GST calculations, generates compliant invoices, and simplifies tax reporting for Indian MSMEs.",
    content: `
## The GST Compliance Burden

Since its implementation in 2017, GST has unified India's tax landscape. But for MSMEs, compliance remains a challenge:
- Multiple tax slabs (5%, 12%, 18%, 28%)
- HSN code requirements
- CGST/SGST/IGST calculations
- Regular return filing

## How ERP Automates GST

### Automatic Tax Calculations
OPIS automatically calculates the correct GST amount on every purchase order and proforma invoice. Set your tax rates once, and the system handles the math.

### HSN Code Management
Every inventory item in OPIS can have an HSN code. When creating invoices, the HSN code automatically appears — no manual lookup needed.

### GST-Compliant Invoices
OPIS generates professional invoices with all mandatory GST fields:
- Supplier/Buyer GSTIN
- HSN codes
- Tax breakup (CGST + SGST or IGST)
- Place of supply

### Supplier GST Tracking
Store GST numbers for all your suppliers and customers. OPIS validates format and includes them automatically in documents.

## Why OPIS for GST Compliance

Unlike generic accounting tools, OPIS is built ground-up for Indian businesses. Every feature — from purchase orders to proforma invoices — is GST-aware by default.

**Start your GST-compliant journey** — [Sign up for OPIS today](/auth).
    `,
  },
  "purchase-order-automation": {
    title: "Automating Purchase Orders: A Guide for MSME Owners",
    date: "February 10, 2026",
    readTime: "7 min read",
    category: "Automation",
    metaDescription: "Stop wasting hours on manual purchase orders. Learn how OPIS automates PO creation, tracking, and supplier management for MSMEs.",
    content: `
## The Manual PO Problem

A typical MSME owner spends 3-5 hours per week creating and managing purchase orders manually. That's over **200 hours per year** — almost 25 working days lost to paperwork.

Common issues with manual POs:
- **Calculation errors** in quantities and amounts
- **No tracking** of order status
- **Lost records** and missing documentation
- **Duplicate orders** due to poor visibility

## How Automation Transforms PO Management

### 1. One-Click PO Creation
In OPIS, creating a purchase order takes minutes:
1. Select a supplier (auto-fills contact details and GST)
2. Add items from your inventory catalog
3. Quantities and rates auto-calculate amounts
4. Tax calculations happen automatically
5. Print or share the PO instantly

### 2. Status Tracking
Track every PO from creation to completion:
- **Draft** → **Sent** → **Partially Received** → **Completed**
- Link POs directly to Goods Receipt Notes

### 3. Supplier Management
Maintain a complete supplier directory with:
- Contact details and GST numbers
- Payment terms
- Price history for negotiation

### 4. Goods Receipt Integration
When goods arrive, create a Goods Receipt Note linked to the original PO. OPIS automatically:
- Compares ordered vs. received quantities
- Updates inventory stock levels
- Tracks batch numbers for traceability

## Real Impact

OPIS users report:
- **80% reduction** in PO creation time
- **Zero calculation errors** with auto-compute
- **Complete audit trail** for every transaction

## Try It Yourself

[Create your first automated purchase order with OPIS](/auth) — it's faster than filling out a spreadsheet.
    `,
  },
  "hr-payroll-msme": {
    title: "Managing HR & Payroll in MSMEs: The All-in-One Approach",
    date: "February 5, 2026",
    readTime: "6 min read",
    category: "HR & Payroll",
    metaDescription: "Learn why integrated HR and payroll management is essential for MSMEs, and how OPIS provides attendance, leaves, and payslips in one platform.",
    content: `
## The HR Challenge for Small Businesses

Most MSMEs manage HR manually:
- Attendance tracked in paper registers
- Leave records in Excel sheets
- Salary calculations done by hand
- No proper payslip documentation

This approach is error-prone, time-consuming, and creates compliance risks.

## Why Integrated HR Matters

### Attendance → Payroll Connection
When attendance data feeds directly into payroll calculations, you eliminate:
- Manual data transfer errors
- Salary miscalculations
- Disputes with employees

### The OPIS HR Suite

**Employee Management**
- Complete employee profiles with personal, professional, and bank details
- Department and designation tracking
- Active/inactive status management

**Attendance Tracking**
- Daily check-in and check-out recording
- Overtime hours tracking
- Monthly attendance summaries

**Leave Management**
- Leave request and approval workflows
- Multiple leave types (casual, sick, earned)
- **QR-based leave requests** — employees scan a QR code to submit leave requests without needing app login

**Payroll & Payslips**
- Automatic salary calculation based on:
  - Basic salary
  - Days worked vs. total working days
  - Allowances and deductions
  - Configurable payroll rules (PF, ESI, professional tax)
- PDF payslip generation and download
- Payment status tracking

## The QR Code Innovation

OPIS's QR-based leave request system is unique. Generate a QR code for each employee, print it, and place it in the workplace. Employees simply scan to submit leave requests — no app installation, no login credentials needed. Requests appear instantly in the manager's dashboard.

## Cost Comparison

| Solution | Monthly Cost | Features |
|----------|-------------|----------|
| Separate HR tool | ₹500-2000 | HR only |
| Separate Payroll tool | ₹300-1000 | Payroll only |
| OPIS (All-in-One) | ₹250 | Inventory + HR + Payroll |

## Get Started

[Sign up for OPIS](/auth) and manage your entire workforce — from hiring to payslips — alongside your inventory.
    `,
  },
  "choosing-right-erp-india": {
    title: "How to Choose the Right ERP for Your Indian MSME",
    date: "January 28, 2026",
    readTime: "9 min read",
    category: "Guides",
    metaDescription: "A practical guide to evaluating ERP solutions for Indian MSMEs — covering GST support, pricing, ease of use, scalability, and more.",
    content: `
## The ERP Landscape for Indian MSMEs

The ERP market in India is flooded with options — from SAP and Oracle (designed for large enterprises) to dozens of local players. Choosing the right one can make or break your digital transformation.

## The Evaluation Checklist

### 1. GST Compliance (Must-Have)
Any ERP for Indian businesses must handle:
- ✅ Automatic CGST/SGST/IGST calculations
- ✅ HSN code support
- ✅ GST-compliant invoice generation
- ✅ Supplier/Customer GSTIN management

**OPIS Score: ✅ Full GST compliance built-in**

### 2. Pricing That Fits MSME Budgets
Enterprise ERPs cost ₹5-50 lakhs for implementation alone. MSMEs need affordable solutions:
- ❌ High upfront costs
- ❌ Per-user licensing fees
- ✅ Simple monthly pricing
- ✅ No implementation charges

**OPIS: ₹499/month or ₹4,990/year — all features included**

### 3. Ease of Use
Your team shouldn't need weeks of training:
- Clean, intuitive interface
- Familiar workflows
- Quick onboarding (under 30 minutes)

### 4. Core Features Coverage
Essential features for MSMEs:
- **Inventory Management** — Stock tracking, reorder alerts
- **Purchase Orders** — Creation, tracking, supplier management
- **Goods Receipt** — Incoming stock recording, quality checks
- **Invoicing** — Professional, GST-compliant invoices
- **HR & Payroll** — Employee management, attendance, payslips

### 5. Scalability
Will it grow with your business?
- Unlimited items and transactions
- No performance degradation
- Feature additions over time

### 6. Data Security
- Encrypted data storage
- Regular backups
- Access controls and user management
- Sub-user permissions for team access

### 7. Mobile Accessibility
Modern ERPs should work on any device:
- Responsive web design
- No app installation required
- Access from anywhere

### 8. Support Quality
- WhatsApp support for quick queries
- Email support for detailed issues
- Regular feature updates

## Red Flags to Watch For

🚩 **No GST support** — Avoid any ERP not built for Indian tax requirements

🚩 **Complex pricing** — Hidden fees, per-module charges, implementation costs

🚩 **No trial period** — You should be able to test before committing

🚩 **Outdated interface** — If it looks like it was built in 2005, the technology probably matches

🚩 **No data export** — You should always own your data

## Why OPIS Stands Out

OPIS was built from scratch for Indian MSMEs. It's not a stripped-down enterprise tool or a rebranded international product. Every feature — from GST calculations to QR-based leave requests — is designed for how Indian small businesses actually operate.

### Quick Comparison

| Feature | Enterprise ERPs | Generic Tools | OPIS |
|---------|----------------|---------------|------|
| Price | ₹5-50 lakhs | ₹500-5000/mo | ₹250/mo |
| Setup Time | Months | Days | 30 mins |
| GST Support | Add-on | Partial | Built-in |
| HR + Payroll | Separate module | No | Included |
| Indian Focus | No | No | Yes |

## Make Your Decision

The best ERP is one you'll actually use. [Start your free trial with OPIS](/auth) and see the difference an India-first ERP makes.
    `,
  },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogContent[slug] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Blog post not found</h1>
          <Button asChild><Link to="/blog">Back to Blog</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/opis-logo.png" alt="OPIS Logo" className="h-8 object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/blog">All Posts</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary mb-8 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
            {post.category}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            <span className="flex items-center gap-1"><User className="w-4 h-4" />OPIS Team</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{post.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readTime}</span>
          </div>

          <div className="prose prose-slate max-w-none
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:space-y-2 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6
            [&_li]:text-muted-foreground
            [&_strong]:text-foreground [&_strong]:font-semibold
            [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse
            [&_th]:border [&_th]:border-border [&_th]:px-4 [&_th]:py-2 [&_th]:bg-muted [&_th]:text-foreground [&_th]:font-semibold [&_th]:text-left [&_th]:text-sm
            [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2 [&_td]:text-muted-foreground [&_td]:text-sm
            [&_a]:text-primary [&_a]:underline
          ">
            {post.content.split('\n').map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (trimmed.startsWith('## ')) return <h2 key={i}>{trimmed.slice(3)}</h2>;
              if (trimmed.startsWith('### ')) return <h3 key={i}>{trimmed.slice(4)}</h3>;
              if (trimmed.startsWith('- ')) {
                return <li key={i} dangerouslySetInnerHTML={{ __html: trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
              }
              if (trimmed.startsWith('|')) {
                // Handle tables
                const rows = [];
                let j = i;
                const allLines = post.content.split('\n').map(l => l.trim());
                while (j < allLines.length && allLines[j].startsWith('|')) {
                  rows.push(allLines[j]);
                  j++;
                }
                if (i > 0 && allLines[i - 1]?.startsWith('|')) return null; // skip non-first rows
                const headerCells = rows[0]?.split('|').filter(Boolean).map(c => c.trim()) || [];
                const dataRows = rows.slice(2); // skip header and separator
                return (
                  <table key={i}>
                    <thead>
                      <tr>{headerCells.map((c, ci) => <th key={ci}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {dataRows.map((row, ri) => (
                        <tr key={ri}>
                          {row.split('|').filter(Boolean).map((c, ci) => <td key={ci}>{c.trim()}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              }
              return <p key={i} dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') }} />;
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Ready to try OPIS?</h3>
            <p className="text-muted-foreground mb-4">Start managing your business smarter today.</p>
            <Button asChild size="lg">
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;

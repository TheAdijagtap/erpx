import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const blogPosts = [
  {
    slug: "why-msme-need-erp",
    title: "Why Every MSME Needs an ERP System in 2026",
    excerpt: "Discover how ERP systems help MSMEs streamline operations, reduce costs, and compete with larger enterprises in the Indian market.",
    date: "February 25, 2026",
    readTime: "6 min read",
    author: "OPIS Team",
    category: "MSME Growth",
  },
  {
    slug: "inventory-management-best-practices",
    title: "Top 10 Inventory Management Best Practices for Small Businesses",
    excerpt: "Learn proven inventory management strategies that can reduce waste by 40% and boost efficiency for Indian MSMEs.",
    date: "February 20, 2026",
    readTime: "8 min read",
    author: "OPIS Team",
    category: "Inventory",
  },
  {
    slug: "gst-compliance-erp",
    title: "How ERP Software Simplifies GST Compliance for Indian Businesses",
    excerpt: "Automatic GST calculations, compliant invoicing, and seamless tax reporting — see how OPIS makes GST easy.",
    date: "February 15, 2026",
    readTime: "5 min read",
    author: "OPIS Team",
    category: "GST & Compliance",
  },
  {
    slug: "purchase-order-automation",
    title: "Automating Purchase Orders: A Guide for MSME Owners",
    excerpt: "Stop wasting hours on manual purchase orders. Learn how automation can save 10+ hours per week for your business.",
    date: "February 10, 2026",
    readTime: "7 min read",
    author: "OPIS Team",
    category: "Automation",
  },
  {
    slug: "hr-payroll-msme",
    title: "Managing HR & Payroll in MSMEs: The All-in-One Approach",
    excerpt: "Why separate HR and payroll tools fail small businesses, and how an integrated system like OPIS solves the problem.",
    date: "February 5, 2026",
    readTime: "6 min read",
    author: "OPIS Team",
    category: "HR & Payroll",
  },
  {
    slug: "choosing-right-erp-india",
    title: "How to Choose the Right ERP for Your Indian MSME",
    excerpt: "A practical checklist for evaluating ERP solutions — from GST support to scalability, pricing, and ease of use.",
    date: "January 28, 2026",
    readTime: "9 min read",
    author: "OPIS Team",
    category: "Guides",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="OPIS Blog - MSME ERP Tips, Inventory & Business Growth"
        description="Expert articles on ERP, inventory management, GST compliance, HR, and payroll for Indian MSMEs. Learn how to grow your business with OPIS."
        canonical="https://opis.in/blog"
        keywords="MSME blog, ERP tips, inventory management blog, GST compliance, small business India, purchase order guide, payroll tips"
        breadcrumbs={[
          { name: "Home", url: "https://opis.in/" },
          { name: "Blog", url: "https://opis.in/blog" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "OPIS Blog",
          "url": "https://opis.in/blog",
          "description": "Expert articles on ERP, inventory management, and business growth for Indian MSMEs.",
          "publisher": { "@type": "Organization", "name": "Necrus Technologies" },
          "blogPost": blogPosts.map(post => ({
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "url": `https://opis.in/blog/${post.slug}`,
            "author": { "@type": "Person", "name": post.author },
            "datePublished": post.date
          }))
        }}
      />
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">OPIS Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights, tips, and guides on ERP, inventory management, HR, and growing your MSME business in India.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.slug} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-2 bg-gradient-to-r from-primary to-primary/70" />
                <div className="p-6">
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
                    {post.category}
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to Home</Link>
        </div>
      </footer>
    </div>
  );
};

export default Blog;

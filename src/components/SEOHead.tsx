import { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  author?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
  breadcrumbs?: BreadcrumbItem[];
}

const BASE_URL = "https://opis.in";

const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = `${BASE_URL}/og-image.jpg`,
  ogType = "website",
  keywords,
  author = "OPIS by Necrus Technologies",
  noindex = false,
  jsonLd,
  breadcrumbs,
}: SEOHeadProps) => {
  const fullTitle = title.includes("OPIS") ? title : `${title} | OPIS - Order, Purchase & Inventory System`;
  const canonicalUrl = canonical || window.location.origin + window.location.pathname;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Meta tags
    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    setMeta("author", author);
    if (noindex) setMeta("robots", "noindex, nofollow");
    else setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    // Open Graph
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:image", ogImage, "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("og:site_name", "OPIS - Order, Purchase & Inventory System", "property");
    setMeta("og:locale", "en_IN", "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);
    setMeta("twitter:image:alt", fullTitle);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalUrl);

    // JSON-LD (page-specific)
    const existingLd = document.querySelector('script[data-seo-jsonld]');
    if (existingLd) existingLd.remove();

    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // Breadcrumb JSON-LD
    const existingBreadcrumb = document.querySelector('script[data-seo-breadcrumb]');
    if (existingBreadcrumb) existingBreadcrumb.remove();

    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url,
        })),
      };
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-breadcrumb", "true");
      script.textContent = JSON.stringify(breadcrumbLd);
      document.head.appendChild(script);
    }

    return () => {
      const ld = document.querySelector('script[data-seo-jsonld]');
      if (ld) ld.remove();
      const bc = document.querySelector('script[data-seo-breadcrumb]');
      if (bc) bc.remove();
    };
  }, [fullTitle, description, canonicalUrl, ogImage, ogType, keywords, author, noindex, jsonLd, breadcrumbs]);

  return null;
};

export default SEOHead;

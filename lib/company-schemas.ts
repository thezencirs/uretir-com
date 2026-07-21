import type { Company } from "@/lib/companies";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";

export function companyOrganizationSchema(company: Company) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl(`/ne-uretir/${company.slug}`)}#organization`,
    name: company.name,
    url: company.website,
    description: company.description,
    foundingDate: String(company.foundedYear),
    numberOfEmployees: { "@type": "QuantitativeValue", value: company.employeeCount },
    address: { "@type": "PostalAddress", addressLocality: company.headquarters, addressCountry: "TR" },
    brand: company.brands.map((b) => ({ "@type": "Brand", name: b })),
    hasCredential: company.certifications.map((c) => ({ "@type": "EducationalOccupationalCredential", credentialCategory: "certification", name: c })),
    makesOffer: company.mainProducts.map((p) => ({ "@type": "Offer", itemOffered: { "@type": "Product", name: p } })),
  };
}

export function companyFaqSchema(company: Company) {
  if (!company.faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl(`/ne-uretir/${company.slug}`)}#faq`,
    mainEntity: company.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function companyArticleSchema(company: Company) {
  const url = absoluteUrl(`/ne-uretir/${company.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: `${company.name} Ne Üretir?`,
    description: company.description,
    image: [absoluteUrl("/opengraph-image")],
    datePublished: "2026-07-20T09:00:00+03:00",
    dateModified: "2026-07-20T09:00:00+03:00",
    inLanguage: "tr-TR",
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
    about: { "@id": `${url}#organization` },
    articleSection: company.sector,
    keywords: [company.name, company.sector, ...company.mainProducts.slice(0, 5)].join(", "),
  };
}

export function companyCollectionSchema() {
  const url = absoluteUrl("/ne-uretir");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: "Ne Üretir? — Türkiye'nin Üretim Rehberi",
    description: "Türkiye'nin önde gelen üretici şirketleri, faaliyet alanları, ürünleri ve ihracat bilgileri.",
    inLanguage: "tr-TR",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

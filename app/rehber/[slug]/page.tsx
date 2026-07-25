import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubGuidePage } from "@/components/hub-guide-page";
import { JsonLd } from "@/components/json-ld";
import { getContentHub, getHubGuide, hubGuides } from "@/lib/content-hubs";
import { createHubGuideDocument } from "@/lib/hub-guide-document";
import { isIndexableReference, isVisibleReference } from "@/lib/publication";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import { breadcrumbSchema, entityAboutSchema, faqPageSchema } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return hubGuides
    .filter((guide) => isVisibleReference(createHubGuideDocument(guide)))
    .map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = getHubGuide((await params).slug);
  if (!guide) return { title: "Rehber bulunamadı", robots: { index: false, follow: false } };
  const hub = getContentHub(guide.hubId);
  const document = createHubGuideDocument(guide);
  if (!isVisibleReference(document)) return { title: "Rehber bulunamadı", robots: { index: false, follow: false } };
  const indexable = isIndexableReference(document);
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/rehber/${guide.slug}` },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: indexable
      ? { title: guide.title, description: guide.description, url: `/rehber/${guide.slug}`, type: "article", publishedTime: `${document.publishedAt}T09:00:00+03:00`, modifiedTime: `${document.updatedAt}T09:00:00+03:00`, section: hub?.name }
      : { title: guide.title, description: guide.description, url: `/rehber/${guide.slug}`, type: "website" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getHubGuide((await params).slug);
  if (!guide) notFound();
  const hub = getContentHub(guide.hubId);
  const document = createHubGuideDocument(guide);
  if (!isVisibleReference(document)) notFound();
  const indexable = isIndexableReference(document);
  const url = absoluteUrl(`/rehber/${guide.slug}`);
  const about = entityAboutSchema(document.entityRelations);
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${url}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: guide.title,
      description: guide.description,
      datePublished: `${document.publishedAt}T09:00:00+03:00`,
      dateModified: `${document.updatedAt}T09:00:00+03:00`,
      inLanguage: "tr-TR",
      isAccessibleForFree: true,
      author: { "@type": "Organization", name: `${SITE_NAME} Editoryal` },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      articleSection: hub?.name,
      citation: document.sources.map((source) => ({ "@type": "CreativeWork", name: source.title, url: source.href })),
      ...(about.length ? { about } : {}),
    },
    breadcrumbSchema([
      { name: "Ana sayfa", path: "/" },
      { name: "Araçlar", path: "/araclar" },
      { name: hub?.name ?? "Rehberler", path: hub?.path ?? "/araclar" },
      { name: guide.title, path: `/rehber/${guide.slug}` },
    ]),
    faqPageSchema(guide.faq),
  ];

  return <>
    {indexable && <JsonLd data={schemas} />}
    <HubGuidePage guide={guide} document={document} />
  </>;
}

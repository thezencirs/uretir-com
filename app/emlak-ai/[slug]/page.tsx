import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink, Home, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdSlot } from "@/components/google-monetization";
import { JsonLd } from "@/components/json-ld";
import { EMLAK_GUIDES, getEmlakGuideBySlug } from "@/lib/insaat-emlak-data";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return EMLAK_GUIDES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getEmlakGuideBySlug(slug);
  if (!guide) {
    return { title: "Emlak rehberi bulunamadı", robots: { index: false, follow: false } };
  }
  const canonical = `/emlak-ai/${guide.slug}`;
  return {
    title: `${guide.title} — EmlakAI`,
    description: guide.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: `${guide.title} — EmlakAI`,
      description: guide.seoDescription,
      url: canonical,
      type: "article",
    },
  };
}

export default async function EmlakGuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getEmlakGuideBySlug(slug);
  if (!guide) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${guide.shortTitle} nasıl hesaplanır?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${guide.metricSummary}. ${guide.summary}`,
        },
      },
      {
        "@type": "Question",
        name: `${guide.shortTitle} resmî başvuru ve sorgulama adresi nedir?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Resmî işlemler ${guide.institution} (${guide.officialUrl}) üzerinden yürütülmektedir.`,
        },
      },
    ],
  };

  const otherGuides = EMLAK_GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <div className="page-reveal pb-16">
      <JsonLd data={faqSchema} />
      <div className="section-wrap py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: "EmlakAI · Kira, Tapu & Kredi", href: "/emlak-ai" },
            { label: guide.shortTitle },
          ]}
        />

        <Link
          href="/emlak-ai"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-muted hover:text-black dark:hover:text-white"
        >
          <ArrowLeft size={14} /> TÜFE Kira Zammı ve Tapu Harcı Robotuna Dön
        </Link>

        <article className="mt-4 rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-[#0c1222] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-extrabold text-rose-700 dark:text-rose-300">
              <ShieldCheck size={14} /> {guide.badge}
            </span>
            <span className="text-xs font-semibold text-muted">{guide.institution}</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">{guide.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{guide.summary}</p>

          <div className="mt-6 grid gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/[0.06] p-5 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-[#c8f560]">
                <Home size={16} /> Yasal Hesaplama Formülü &amp; Ölçüt
              </div>
              <p className="mt-1.5 text-base font-extrabold">{guide.metricSummary}</p>
            </div>
            <div className="flex flex-col justify-between gap-3 md:items-end">
              <span className="text-xs font-semibold text-muted">Resmî Kurum &amp; Sorgulama Ekranı</span>
              <a
                href={guide.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-extrabold text-[#c8f560] transition hover:opacity-90 dark:bg-[#c8f560] dark:text-[#090d16]"
              >
                Resmî Kurum Ekranını Aç <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="my-6">
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EMLAK_TOP || "emlak-detail"} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section aria-labelledby="highlights-heading" className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
              <h2 id="highlights-heading" className="font-display text-xl font-bold">
                Temel Yasal Kurallar ve Muafiyetler
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {guide.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="steps-heading" className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
              <h2 id="steps-heading" className="font-display text-xl font-bold">
                Adım Adım İşlem Rehberi
              </h2>
              <ol className="mt-4 space-y-3 text-sm">
                {guide.steps.map((step, idx) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-extrabold text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </article>

        <section className="mt-10" aria-labelledby="other-emlak-heading">
          <h2 id="other-emlak-heading" className="font-display text-2xl font-bold">
            Diğer Emlak, Kira, Tapu ve Milli Emlak Rehberleri
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherGuides.map((item) => (
              <Link
                key={item.id}
                href={`/emlak-ai/${item.slug}`}
                className="rounded-2xl border border-black/10 bg-white/80 p-4 transition hover:border-black/30 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#c8f560]/60"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-[#c8f560]">
                  {item.badge}
                </span>
                <h3 className="mt-1.5 font-display text-base font-bold">{item.shortTitle}</h3>
                <p className="mt-1 text-xs text-muted">{item.metricSummary}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink, HardHat, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdSlot } from "@/components/google-monetization";
import { JsonLd } from "@/components/json-ld";
import { WhatsAppGrowthBanner } from "@/components/whatsapp-growth-banner";
import { INSAAT_GUIDES, getInsaatGuideBySlug } from "@/lib/insaat-emlak-data";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return INSAAT_GUIDES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getInsaatGuideBySlug(slug);
  if (!guide) {
    return { title: "İnşaat rehberi bulunamadı", robots: { index: false, follow: false } };
  }
  const canonical = `/insaat-ai/${guide.slug}`;
  return {
    title: `${guide.title} — İnşaatAI`,
    description: guide.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: `${guide.title} — İnşaatAI`,
      description: guide.seoDescription,
      url: canonical,
      type: "article",
    },
  };
}

export default async function InsaatGuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getInsaatGuideBySlug(slug);
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
        name: `${guide.shortTitle} için resmî kurum ve mevzuat kaynağı nedir?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Resmî kriterler ${guide.institution} (${guide.officialUrl}) verilerine dayanmaktadır.`,
        },
      },
    ],
  };

  const otherGuides = INSAAT_GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <div className="page-reveal pb-16">
      <JsonLd data={faqSchema} />
      <div className="section-wrap py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: "İnşaatAI · Maliyet & İmar", href: "/insaat-ai" },
            { label: guide.shortTitle },
          ]}
        />

        <Link
          href="/insaat-ai"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-muted hover:text-black dark:hover:text-white"
        >
          <ArrowLeft size={14} /> İnşaat Maliyeti ve TAKS/KAKS Robotuna Dön
        </Link>

        <article className="mt-4 rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-[#0c1222] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-extrabold text-orange-700 dark:text-orange-300">
              <ShieldCheck size={14} /> {guide.badge}
            </span>
            <span className="text-xs font-semibold text-muted">{guide.institution}</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">{guide.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{guide.summary}</p>

          <div className="mt-6 grid gap-4 rounded-2xl border border-orange-500/30 bg-orange-500/[0.06] p-5 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-orange-700 dark:text-[#c8f560]">
                <HardHat size={16} /> Temel Hesaplama &amp; Birim Ölçüt
              </div>
              <p className="mt-1.5 text-base font-extrabold">{guide.metricSummary}</p>
            </div>
            <div className="flex flex-col justify-between gap-3 md:items-end">
              <span className="text-xs font-semibold text-muted">Resmî Mevzuat &amp; Başvuru Portalı</span>
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
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INSAAT_TOP || "insaat-detail"} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section aria-labelledby="highlights-heading" className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
              <h2 id="highlights-heading" className="font-display text-xl font-bold">
                Kritik Maliyet ve İmar Kuralları
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
                Adım Adım Uygulama ve Başvuru Süreci
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

        <div className="mt-8">
          <WhatsAppGrowthBanner
            toolSlug="insaat-ai"
            customHeading={`${guide.shortTitle} Duyuru ve Başvuru Takvimini WhatsApp'tan Takip Edin`}
            customSubheading={`${guide.summary} Yeni başvuru tarihleri açıklandığında bildirim almak için resmî WhatsApp kanalımıza katılın veya bu rehberi arkadaşınıza gönderin.`}
            shareSummary={`📌 *${guide.title}*\n${guide.summary}`}
            pagePath={`/insaat-ai/${guide.slug}`}
            sectionId={`wa-subpage-${guide.slug}`}
          />
        </div>

        <section className="mt-10" aria-labelledby="other-insaat-heading">
          <h2 id="other-insaat-heading" className="font-display text-2xl font-bold">
            Diğer İnşaat, TOKİ ve Kentsel Dönüşüm Rehberleri
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherGuides.map((item) => (
              <Link
                key={item.id}
                href={`/insaat-ai/${item.slug}`}
                className="rounded-2xl border border-black/10 bg-white/80 p-4 transition hover:border-black/30 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#c8f560]/60"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-[#c8f560]">
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

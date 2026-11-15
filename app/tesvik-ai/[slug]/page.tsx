import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink, HandCoins, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdSlot } from "@/components/google-monetization";
import { JsonLd } from "@/components/json-ld";
import { SUPPORT_PROGRAMS, getSupportProgramBySlug } from "@/lib/tesvik-memur-data";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORT_PROGRAMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = getSupportProgramBySlug(slug);
  if (!program) {
    return { title: "Destek programı bulunamadı", robots: { index: false, follow: false } };
  }
  const canonical = `/tesvik-ai/${program.slug}`;
  return {
    title: `${program.title} — TeşvikAI`,
    description: program.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: `${program.title} — TeşvikAI`,
      description: program.seoDescription,
      url: canonical,
      type: "article",
    },
  };
}

export default async function TesvikProgramDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const program = getSupportProgramBySlug(slug);
  if (!program) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${program.shortTitle} ne kadar ve ödeme sıklığı nedir?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${program.amountSummary}. Ödeme planı: ${program.paymentFrequency}.`,
        },
      },
      {
        "@type": "Question",
        name: `${program.shortTitle} başvurusu nereden yapılır?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Başvurular ${program.institution} bünyesinde ${program.applicationChannel} üzerinden (${program.officialUrl}) kabul edilmektedir.`,
        },
      },
    ],
  };

  const otherPrograms = SUPPORT_PROGRAMS.filter((p) => p.slug !== program.slug);

  return (
    <div className="page-reveal pb-16">
      <JsonLd data={faqSchema} />
      <div className="section-wrap py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: "TeşvikAI · Aile Yardımları", href: "/tesvik-ai" },
            { label: program.shortTitle },
          ]}
        />

        <Link
          href="/tesvik-ai"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-muted hover:text-black dark:hover:text-white"
        >
          <ArrowLeft size={14} /> Hane Geliri Hesaplama Robotuna Dön
        </Link>

        <article className="mt-4 rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-[#0c1222] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck size={14} /> {program.badge}
            </span>
            <span className="text-xs font-semibold text-muted">Yetkili Kurum: {program.institution}</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">{program.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{program.summary}</p>

          <div className="mt-6 grid gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-[#c8f560]">
                <HandCoins size={16} /> Destek &amp; Ödeme Tutarı
              </div>
              <p className="mt-1.5 text-base font-extrabold">{program.amountSummary}</p>
              <p className="mt-1 text-xs text-muted">{program.paymentFrequency}</p>
            </div>
            <div className="flex flex-col justify-between gap-3 md:items-end">
              <span className="text-xs font-semibold text-muted">Başvuru Kanalı: {program.applicationChannel}</span>
              <a
                href={program.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-extrabold text-[#c8f560] transition hover:opacity-90 dark:bg-[#c8f560] dark:text-[#090d16]"
              >
                e-Devlet / Resmî Başvuru Ekranını Aç <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="my-6">
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TESVIK_TOP || "tesvik-detail"} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section aria-labelledby="req-heading" className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
              <h2 id="req-heading" className="font-display text-xl font-bold">
                Başvuru Şartları ve Gelir Kriteri
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {program.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="steps-heading" className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
              <h2 id="steps-heading" className="font-display text-xl font-bold">
                Adım Adım e-Devlet Başvuru Süreci
              </h2>
              <ol className="mt-4 space-y-3 text-sm">
                {program.steps.map((step, idx) => (
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

        {/* Diğer Aile Yardımları İç Link Ağı */}
        <section className="mt-10" aria-labelledby="other-supports-heading">
          <h2 id="other-supports-heading" className="font-display text-2xl font-bold">
            Diğer Aile Yardımları ve Devlet Destekleri
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherPrograms.map((item) => (
              <Link
                key={item.id}
                href={`/tesvik-ai/${item.slug}`}
                className="rounded-2xl border border-black/10 bg-white/80 p-4 transition hover:border-black/30 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#c8f560]/60"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-[#c8f560]">
                  {item.badge}
                </span>
                <h3 className="mt-1.5 font-display text-base font-bold">{item.shortTitle}</h3>
                <p className="mt-1 text-xs text-muted">{item.amountSummary}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

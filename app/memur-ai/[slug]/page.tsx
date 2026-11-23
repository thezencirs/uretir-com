import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdSlot } from "@/components/google-monetization";
import { JsonLd } from "@/components/json-ld";
import { WhatsAppGrowthBanner } from "@/components/whatsapp-growth-banner";
import { RECRUITMENT_TRACKS, getRecruitmentTrackBySlug } from "@/lib/tesvik-memur-data";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return RECRUITMENT_TRACKS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const track = getRecruitmentTrackBySlug(slug);
  if (!track) {
    return { title: "Kamu alım rehberi bulunamadı", robots: { index: false, follow: false } };
  }
  const canonical = `/memur-ai/${track.slug}`;
  return {
    title: `${track.title} — MemurAI`,
    description: track.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: `${track.title} — MemurAI`,
      description: track.seoDescription,
      url: canonical,
      type: "article",
    },
  };
}

export default async function MemurTrackDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const track = getRecruitmentTrackBySlug(slug);
  if (!track) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${track.shortTitle} için KPSS taban puan şartı kaçtır?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            track.minKpssScore === 0
              ? `${track.shortTitle} kapsamında KPSS puan şartı aranmaksızın noter kurası veya ilgili kurum kriterleriyle başvuru alınmaktadır.`
              : `${track.shortTitle} ilanlarında ilgili KPSS puan türünden en az ${track.minKpssScore} ve üzeri puan şartı uygulanmaktadır.`,
        },
      },
      {
        "@type": "Question",
        name: `${track.shortTitle} başvuruları nereden yapılır?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Resmî başvurular ${track.applicationPortal} (${track.officialUrl}) üzerinden e-Devlet şifresiyle gerçekleştirilir.`,
        },
      },
    ],
  };

  const otherTracks = RECRUITMENT_TRACKS.filter((t) => t.slug !== track.slug);

  return (
    <div className="page-reveal pb-16">
      <JsonLd data={faqSchema} />
      <div className="section-wrap py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: "MemurAI · Kamu İlan & Maaş", href: "/memur-ai" },
            { label: track.shortTitle },
          ]}
        />

        <Link
          href="/memur-ai"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-muted hover:text-black dark:hover:text-white"
        >
          <ArrowLeft size={14} /> KPSS Puan Robotuna ve Maaş Hesaplayıcıya Dön
        </Link>

        <article className="mt-4 rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-[#0c1222] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-700 dark:text-amber-300">
              <ShieldCheck size={14} /> {track.badge}
            </span>
            <span className="text-xs font-semibold text-muted">{track.quotaType}</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">{track.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{track.summary}</p>

          <div className="mt-6 grid gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-5 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-[#c8f560]">
                <Briefcase size={16} /> Alım Yapan Kurumlar &amp; Kadro Statüsü
              </div>
              <p className="mt-1.5 text-base font-extrabold">{track.institution}</p>
              <p className="mt-1 text-xs text-muted">
                KPSS Taban Barajı:{" "}
                {track.minKpssScore === 0 ? "KPSS Şartsız (Noter Kurası / Doğrudan Başvuru)" : `En Az ${track.minKpssScore} KPSS`}
              </p>
            </div>
            <div className="flex flex-col justify-between gap-3 md:items-end">
              <span className="text-xs font-semibold text-muted">Başvuru Kanalı: {track.applicationPortal}</span>
              <a
                href={track.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-extrabold text-[#c8f560] transition hover:opacity-90 dark:bg-[#c8f560] dark:text-[#090d16]"
              >
                Resmî Başvuru Portalını Aç <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="my-6">
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MEMUR_TOP || "memur-detail"} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section aria-labelledby="positions-heading" className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
              <h2 id="positions-heading" className="font-display text-xl font-bold">
                Alım Yapılan Kadro ve Unvanlar
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {track.positions.map((pos) => (
                  <li key={pos} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-amber-500" />
                    <span className="font-semibold">{pos}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="reqs-heading" className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
              <h2 id="reqs-heading" className="font-display text-xl font-bold">
                Genel ve Özel Başvuru Şartları
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {track.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>

        <div className="mt-8">
          <WhatsAppGrowthBanner
            toolSlug="memur-ai"
            customHeading={`${track.shortTitle} Duyuru ve Başvuru Takvimini WhatsApp'tan Takip Edin`}
            customSubheading={`${track.summary} Yeni başvuru tarihleri açıklandığında bildirim almak için resmî WhatsApp kanalımıza katılın veya bu rehberi arkadaşınıza gönderin.`}
            shareSummary={`📌 *${track.title}*\n${track.summary}`}
            pagePath={`/memur-ai/${track.slug}`}
            sectionId={`wa-subpage-${track.slug}`}
          />
        </div>

        {/* Diğer Kamu Alım Rehberleri */}
        <section className="mt-10" aria-labelledby="other-tracks-heading">
          <h2 id="other-tracks-heading" className="font-display text-2xl font-bold">
            Diğer Kamu Personeli Alımı, Maaş ve Promosyon Rehberleri
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherTracks.map((item) => (
              <Link
                key={item.id}
                href={`/memur-ai/${item.slug}`}
                className="rounded-2xl border border-black/10 bg-white/80 p-4 transition hover:border-black/30 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#c8f560]/60"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#c8f560]">
                  {item.badge}
                </span>
                <h3 className="mt-1.5 font-display text-base font-bold">{item.shortTitle}</h3>
                <p className="mt-1 text-xs text-muted">{item.institution}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

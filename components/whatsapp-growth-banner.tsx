"use client";

import Link from "next/link";
import { ArrowUpRight, BellRing, CalendarClock, Lock, Share2, Sparkles } from "lucide-react";
import {
  buildWhatsAppShareUrl,
  getChannelForTool,
  getDailyAgendaContext,
  OFFICIAL_WHATSAPP_CHANNELS,
} from "@/lib/agenda-engine";

export function WhatsAppGrowthBanner({
  toolSlug,
  customHeading,
  customSubheading,
  shareSummary,
  pagePath,
  sectionId,
}: {
  toolSlug: string;
  customHeading?: string;
  customSubheading?: string;
  shareSummary?: string;
  pagePath?: string;
  sectionId?: string;
}) {
  const agenda = getDailyAgendaContext();
  const primaryChannel = getChannelForTool(toolSlug);
  const defaultShareText =
    shareSummary ||
    `📌 *Üretir (${agenda.formattedDateTR}) Güncel Hesaplama & Rehber:*\n${primaryChannel.description}\n\n📲 *Resmî WhatsApp Kanalı:* ${primaryChannel.channelUrl}`;
  const shareUrl = buildWhatsAppShareUrl(defaultShareText, pagePath || primaryChannel.primaryToolHref);

  return (
    <section
      id={sectionId || `wa-growth-${toolSlug}`}
      className="rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-[#071a12] via-[#0b1719] to-[#0f172a] p-6 text-white shadow-xl md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-1 text-xs font-extrabold tracking-wider text-emerald-300">
          <BellRing className="h-3.5 w-3.5 animate-bounce" />
          <span>{primaryChannel.badge} · RESMÎ WHATSAPP KANALI</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-emerald-200">
          <Lock className="h-3 w-3 text-emerald-400" />
          <span>Telefon numaranız ve profiliniz kimseye görünmez (%100 Gizli)</span>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            📅 {agenda.formattedDateTR} · Gündem &amp; Bildirim Hattı
          </p>
          <h2 className="mt-1.5 font-display text-xl font-extrabold leading-snug text-white md:text-2xl">
            {customHeading ||
              `${primaryChannel.name} Kanalına Katılın; Yeni Duyuru ve Fırsatları Kaçırmayın`}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-300 md:text-sm">
            {customSubheading ||
              `${primaryChannel.description} WhatsApp gruplarının aksine kanalda telefon numaranız gizli kalır, yalnızca doğrulanmış resmî özetler paylaşılır.`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:flex-col xl:flex-row">
          <a
            href={primaryChannel.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-center text-xs font-extrabold text-slate-950 shadow-lg shadow-[#25D366]/25 transition hover:bg-[#20bd5a] md:text-sm"
          >
            <BellRing className="h-4 w-4 shrink-0" />
            <span>WhatsApp Kanalını Takip Et</span>
            <ArrowUpRight className="h-4 w-4 shrink-0" />
          </a>

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-center text-xs font-extrabold text-white transition hover:bg-white/20"
          >
            <Share2 className="h-4 w-4 shrink-0 text-emerald-300" />
            <span>Arkadaşına Gönder</span>
          </a>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
          <span className="font-bold uppercase tracking-wider text-emerald-300">
            🌐 Üretir 6 Resmî WhatsApp Kanal Ağı (Tek Tıkla Katıl):
          </span>
          <div className="flex flex-wrap gap-2">
            {OFFICIAL_WHATSAPP_CHANNELS.map((ch) => (
              <a
                key={ch.key}
                href={ch.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
                  ch.key === primaryChannel.key
                    ? "bg-emerald-400/25 text-emerald-200 border border-emerald-400/50"
                    : "bg-white/5 text-slate-200 hover:bg-white/15 border border-white/10"
                }`}
              >
                <span>{ch.name.split(" · ")[0]}</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DailyAgendaCommandBar() {
  const agenda = getDailyAgendaContext();

  return (
    <section
      id="gunun-canli-gundem-vaziyeti"
      className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-[#0b111e] md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f560]/30 px-3.5 py-1 text-xs font-extrabold text-black dark:bg-[#c8f560]/20 dark:text-[#c8f560]">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>{agenda.periodBadge}</span>
          </span>
          <span className="text-xs font-bold text-muted">{agenda.formattedDateTR}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Tarihe &amp; Gündeme Göre Otomatik Güncellenir</span>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="font-display text-xl font-extrabold md:text-2xl">{agenda.periodTitle}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted md:text-sm">{agenda.periodSummary}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agenda.hotTopics.map((topic) => (
          <article
            key={topic.id}
            className="flex flex-col justify-between rounded-2xl border border-black/10 bg-black/[0.02] p-4 transition hover:border-black/25 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#c8f560]/50"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-lg bg-black/10 px-2.5 py-0.5 text-[10px] font-extrabold dark:bg-white/10 dark:text-[#c8f560]">
                  {topic.badge}
                </span>
                <a
                  href={topic.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  📲 {topic.channelName}
                </a>
              </div>
              <h3 className="mt-2.5 font-display text-sm font-bold leading-snug">
                <Link href={topic.href} className="hover:underline">
                  {topic.title}
                </Link>
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{topic.summary}</p>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-2.5 text-[11px] font-extrabold dark:border-white/10">
              <Link href={topic.href} className="inline-flex items-center gap-1 hover:underline">
                <span>Hesapla &amp; İncele</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href={topic.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#25D366]/20 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300"
              >
                Kanala Katıl →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

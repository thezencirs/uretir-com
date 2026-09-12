import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import { analyticsAttributes } from "@/lib/analytics";

export function NewsletterForm({ compact = false, language = "tr" }: { compact?: boolean; language?: "tr" | "en" }) {
  return <div className={compact ? "max-w-sm" : "mt-7 max-w-md"}>
    <div className="flex items-start gap-2 text-sm leading-6">
      <CircleAlert size={16} className="mt-1 shrink-0" aria-hidden="true" />
      <p>{language === "en" ? "Newsletter subscriptions are not open yet; this page does not collect email addresses." : "Bülten kaydı henüz açık değil; bu yüzey e-posta adresi toplamaz."}</p>
    </div>
    <Link href="/feed.xml" className="focus-ring mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-current px-4 text-xs font-bold" {...analyticsAttributes({ event: "rss_select", surface: "newsletter", target: "feed" })}>
      {language === "en" ? "Follow the RSS feed" : "RSS akışını takip et"} <ArrowRight size={15} aria-hidden="true" />
    </Link>
  </div>;
}

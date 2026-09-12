import { AdSlot as GoogleAdSlot } from "@/components/google-monetization";

export type AdSlotFormat = "leaderboard" | "infeed" | "sidebar";

const slotByFormat: Record<AdSlotFormat, string | undefined> = {
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  infeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
};

export function AdSlot({ format = "infeed", label = "Reklam alanı (etkin değil)" }: { format?: AdSlotFormat; label?: string }) {
  const slot = slotByFormat[format];
  if (slot && process.env.NEXT_PUBLIC_ADSENSE_CLIENT) {
    return <div className={`ad-slot ad-slot--${format}`} aria-label="Reklam">
      <GoogleAdSlot slot={slot} format={format === "infeed" ? "fluid" : "auto"} />
    </div>;
  }
  return <aside className={`ad-slot ad-slot--${format}`} data-ad-format={format} aria-label={label}>
    <span className="ad-slot__label">{label}</span>
    <span className="ad-slot__note">Reklam entegrasyonu açıldığında yalnızca açıkça etiketlenmiş iş ortaklıkları burada gösterilir.</span>
  </aside>;
}
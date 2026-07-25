export type AdSlotFormat = "leaderboard" | "infeed" | "sidebar";

export function AdSlot({ format = "infeed", label = "Reklam alanı (etkin değil)" }: { format?: AdSlotFormat; label?: string }) {
  return <aside className={`ad-slot ad-slot--${format}`} data-ad-format={format} aria-label={label}>
    <span className="ad-slot__label">{label}</span>
    <span className="ad-slot__note">Reklam entegrasyonu açıldığında yalnızca açıkça etiketlenmiş iş ortaklıkları burada gösterilir.</span>
  </aside>;
}

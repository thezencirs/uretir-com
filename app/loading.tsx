export default function Loading() {
  return <div className="section-wrap py-14 md:py-20" role="status" aria-live="polite" aria-label="İçerik yükleniyor">
    <span className="sr-only">İçerik yükleniyor</span>
    <div className="animate-pulse">
      <div className="h-3 w-28 rounded bg-[color:var(--surface-strong)]" />
      <div className="mt-12 h-20 max-w-3xl rounded bg-[color:var(--surface)] md:h-32" />
      <div className="mt-8 h-5 max-w-xl rounded bg-[color:var(--surface)]" />
      <div className="mt-16 grid gap-5 md:grid-cols-3">
        <div className="h-52 rounded bg-[color:var(--surface)]" />
        <div className="h-52 rounded bg-[color:var(--surface)]" />
        <div className="h-52 rounded bg-[color:var(--surface)]" />
      </div>
    </div>
  </div>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { makers, products } from "@/lib/marketplace";
export function generateStaticParams() { return products.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const p = products.find((p) => p.slug === slug);
  return p ? { title: p.name + " — " + makers[p.maker].name, description: p.description, alternates: { canonical: "/urun/" + p.slug }, openGraph: { url: "/urun/" + p.slug } } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  const m = makers[p.maker];
  const related = products.filter((other) => other.slug !== p.slug && other.task === p.task).slice(0, 4);
  return <div className="section-wrap py-14 md:py-24">
    <Link href="/kesfet" className="text-sm text-muted">← Bütün ürünler</Link>
    <div className="mt-10 grid gap-10 md:grid-cols-[1.3fr_.7fr]">
      <div><p className="eyebrow">{p.category} / {p.task}</p><h1 className="mt-5 text-5xl font-bold tracking-tight md:text-7xl">{p.name}</h1><p className="mt-6 max-w-xl text-xl leading-8 text-muted">{p.description}</p><p className="mt-6">{m.name} · {m.city}, Türkiye</p><a className="mt-8 inline-flex rounded-lg bg-[#28452f] px-6 py-4 text-sm text-white" href={p.url} target="_blank" rel="noreferrer">Resmî ürün kataloğu / mağaza bağlantıları ↗</a><p className="mt-3 text-xs text-muted">İndirme, fiyat ve platform bilgilerini üreticinin sayfasından kontrol edebilirsin.</p></div>
      <aside className="rounded-xl border hairline p-7"><h2 className="text-lg font-semibold">Kaynağından keşfet</h2><p className="mt-4 text-sm leading-7 text-muted">Bu kayıt 06 Eylül 2026 tarihinde resmî ürün kaynakları incelenerek eklendi. Üretici bağlantısı Türkiye&apos;deki ekibi gösterir; sahiplik veya merkez ülke iddiası değildir.</p><a className="mt-5 block text-sm underline" href={m.source} target="_blank" rel="noreferrer">Ürün kaynağı ↗</a><a className="mt-4 block text-sm underline" href={m.locationSource} target="_blank" rel="noreferrer">Türkiye / şehir kaynağı ↗</a><Link className="mt-5 block text-sm underline" href={"/map?sehir=" + encodeURIComponent(m.city) + "&q=" + encodeURIComponent(m.name)}>Üreticiyi haritada göster ↗</Link><Link href="/urun-gonder" className="mt-5 block text-xs text-muted underline">Kayıt düzeltmesi öner</Link></aside>
    </div>
    {related.length > 0 && <section className="mt-20"><h2 className="text-2xl font-semibold">Aynı ihtiyaç, başka ürünler</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{related.map((other) => <Link className="rounded-lg border hairline p-6" key={other.slug} href={"/urun/" + other.slug}><h3 className="font-semibold">{other.name} ↗</h3><p className="mt-2 text-sm text-muted">{other.description}</p></Link>)}</div></section>}
  </div>;
}

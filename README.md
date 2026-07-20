# Üretir.com

Üretim, teknoloji, yapay zekâ, mühendislik, mimarlık ve üretkenlik üzerine modern bir frontend yayın platformu.

## Teknoloji

- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide React ikonları
- Responsive ve dark/light tema desteği
- SEO metadata ve statik içerik üretimi
- JSON-LD structured data: Organization, WebSite, Article, CollectionPage, BreadcrumbList
- Dinamik canonical URL, OpenGraph, Twitter Card ve OG image üretimi
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest` ve `icon.svg`

## Yerelde çalıştırma

Node.js 20+ kurulu bir terminalde proje klasöründe:

```bash
npm install
npm run dev
```

Tarayıcıdan `http://localhost:3000` adresini açın.

Üretim build'i için:

```bash
npm run lint
npm run build
npm run start
```

Bu çalışma ortamında doğrulama için pnpm de kullanılabilir:

```bash
pnpm install
pnpm dev
```

## Sayfalar

- `/` — Ana sayfa
- `/blog` — Yazı arşivi
- `/blog/[slug]` — Makale detay sayfası
- `/kategori/[category]` — Kategori arşivi
- `/hakkimizda` — Hakkımızda
- `/iletisim` — İletişim formu
- `/gizlilik-politikasi` — Gizlilik politikası

## İçerik

Örnek yazılar `lib/posts.ts` içinde tutuluyor. İlerleyen aşamada bu dosya bir CMS veya API katmanıyla değiştirilebilir.

Blog araması ve kategori filtreleri URL ile senkron çalışır: `/blog?q=prototip` veya `/blog?category=yapay-zeka` gibi bağlantılar paylaşılabilir.

SEO yüzeyleri:

- `/sitemap.xml`
- `/robots.txt`
- `/opengraph-image`
- `/manifest.webmanifest`

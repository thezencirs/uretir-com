import { formatNewsDate, newsStatus, publicNews, type SiteContent } from "@/lib/site-content-model";

export function Developments({ content, category = "", preview = false }: { content: SiteContent; category?: string; preview?: boolean }) {
  const all = publicNews(content.news);
  const items = category ? all.filter(item => item.category === category) : all;
  const latestCheck = all.map(item => item.checkedAt).sort().at(-1);
  return <div className="news-desk">
    <div className="news-masthead"><span>ÜRETİR / GÜNDEM</span><span>{latestCheck ? "Kaynak kontrolü · " + formatNewsDate(latestCheck) : "Henüz haber yok"}</span></div>
    <div className="news-intro"><h1>{content.developmentsTitle}<span aria-hidden="true">.</span></h1><p>Türkiye’den ve dünyadan üretimi değiştiren haberler, teknoloji girişimleri ve buluşmalar.</p></div>
    <nav className="news-tabs" aria-label="Gelişme kategorileri"><a aria-current={!category ? "page" : undefined} href={preview ? "#" : "/gelismeler"}>Tümü <span>{all.length}</span></a>{content.categories.map(item => <a key={item.id} href={preview ? "#" : "/gelismeler?kategori=" + item.id} aria-current={category === item.id ? "page" : undefined}>{item.label} <span>{all.filter(news => news.category === item.id).length}</span></a>)}</nav>
    <div className="news-note">Kaynaklı haber seçkisi · Her kayıtta haber, kontrol ve etkinlik tarihleri ayrı belirtilir.</div>
    <div className="news-list">{items.map((item, index) => <article className="news-row" key={item.id} id={item.id}>
      <div className="news-index"><span>{String(index + 1).padStart(2, "0")}</span><p>{content.categories.find(cat => cat.id === item.category)?.label}</p></div>
      <div className="news-story"><div className="news-meta"><span>{newsStatus(item)}</span><span>{item.location}</span></div><h2>{item.title}</h2><p>{item.summary}</p><details><summary>Haberi oku <span aria-hidden="true">+</span></summary><p className="news-body">{item.body}</p><a className="news-source" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Kaynak: {item.sourceName} ↗</a></details></div>
      <aside className="news-dates">{item.eventStart && <p><strong>Etkinlik</strong>{formatNewsDate(item.eventStart)}{item.eventEnd && item.eventEnd !== item.eventStart ? " – " + formatNewsDate(item.eventEnd) : ""}</p>}{item.deadline && <p><strong>Son başvuru</strong>{formatNewsDate(item.deadline)}</p>}<p><strong>{item.publishedAt ? "Kaynak yayın tarihi" : "Kaynak yayın tarihi belirtilmemiş"}</strong>{item.publishedAt ? formatNewsDate(item.publishedAt) : null}</p><p><strong>Kaynak kontrolü</strong>{formatNewsDate(item.checkedAt)}</p><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.sourceName} ↗</a></aside>
    </article>)}</div>
    {!items.length && <p className="news-empty">Bu kategoride henüz yayımlanmış haber yok. Diğer kategorilere göz atabilirsiniz.</p>}
  </div>;
}

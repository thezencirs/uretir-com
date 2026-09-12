"use client";
import {MemberReview} from "./member-review";
import {HaberEditor} from "./haber-editor";

import { useEffect, useState, type FormEvent } from "react";
import {siteNavigation} from "@/lib/site-navigation";
import { useRouter } from "next/navigation";
import { Developments } from "@/components/developments";
import { todayInTurkey, type NewsItem, type SiteContent } from "@/lib/site-content-model";

type EditorData = { content: SiteContent; revision: number; canRestore: boolean };
type Section = "headings" | "home" | "news" | "preview";
const sessionUrl = "/api/puan-ai/admin/session";
async function call(url: string, options?: RequestInit) {
  const response = await fetch(url, { ...options, cache: "no-store", headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "İşlem tamamlanamadı.");
  return data;
}
function Field({ label, value, onChange, multiline = false, type = "text", maxLength = 500, required = true }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string; maxLength?: number; required?: boolean }) {
  return <label className="editor-field"><span>{label}</span>{multiline ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} maxLength={maxLength} required={required} /> : <input type={type} value={value} onChange={e => onChange(e.target.value)} maxLength={maxLength} required={required} />}</label>;
}

export function SiteEditor() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [data, setData] = useState<EditorData | null>(null);
  const [section, setSection] = useState<Section>("headings");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  async function load() { const next = await call("/api/site-editor"); setData(next); setDirty(false); }
  useEffect(() => { let active = true; (async () => {
    try { const session = await call(sessionUrl); if (!active) return; setConfigured(session.configured); setAuthenticated(session.authenticated); if (session.authenticated) { const next = await call("/api/site-editor"); if (active) setData(next); } }
    catch (err) { if (active) setError((err as Error).message); }
    finally { if (active) setLoading(false); }
  })(); return () => { active = false; }; }, []);
  useEffect(() => { if (!dirty) return; const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  function change(content: SiteContent) { if (!data) return; setData({ ...data, content }); setDirty(true); setMessage(""); }
  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await call(sessionUrl, { method: "POST", body: JSON.stringify({ password }) }); setPassword(""); setAuthenticated(true); await load(); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  async function logout() {
    if (dirty && !window.confirm("Kaydedilmemiş değişiklikler var. Çıkılsın mı?")) return;
    setBusy(true); setError("");
    try { await call(sessionUrl, { method: "DELETE" }); setAuthenticated(false); setData(null); setDirty(false); setMessage(""); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  async function save(action: "draft" | "publish" | "restore") {
    if (!data) return;
    if (action === "restore" && !window.confirm("Önceki yayına dönülsün mü? Mevcut taslak da bu sürümle değiştirilecek.")) return;
    setBusy(true); setError(""); setMessage("");
    try { const next = await call("/api/site-editor", { method: "PUT", body: JSON.stringify({ content: data.content, revision: data.revision, action }) }); setData(next); setDirty(false); setMessage(action === "draft" ? "Taslak kaydedildi. Ziyaretçilere gösterilmez." : action === "restore" ? "Önceki yayın geri yüklendi." : "Değişiklikler yayımlandı."); if (action !== "draft") router.refresh(); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  if (loading) return <div className="editor-wrap" role="status">Editör yükleniyor…</div>;
  if (!authenticated) return <div className="editor-wrap"><div className="editor-login"><p className="editor-kicker">ÜRETİR / YÖNETİM</p><h1>Editör girişi</h1><p>Menü isimlerini, ana sayfa başlıklarını ve haberleri buradan yönetin.</p>{!configured ? <p role="alert">Yönetici girişi henüz kurulmamış. Sunucuda yönetici parolası ve oturum anahtarı tanımlanmalı.</p> : <form onSubmit={login}><label className="editor-field"><span>Yönetici parolası</span><input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={256} /></label><button className="editor-primary" disabled={busy}>{busy ? "Giriş yapılıyor…" : "Giriş yap"}</button><p className="editor-help">PuanAI yönetici parolanızla giriş yapabilirsiniz.</p></form>}{error && <p role="alert" className="editor-error">{error}</p>}</div></div>;
  return <div className="editor-wrap">
    <div className="editor-top"><div><p className="editor-kicker">ÜRETİR / YÖNETİM</p><h1>Site editörü<span>.</span></h1><p>İsmi değiştirin. Önizleyin. Yayımlayın.</p></div><button disabled={busy} onClick={logout}>Çıkış yap</button></div>
    <div className="editor-toolbar"><div className="editor-sections" aria-label="Editör bölümleri">{([["headings","Üst başlıklar"],["home","Ana sayfa"],["news","Haberler"],["preview","Önizleme"]] as const).map(([id,label]) => <button key={id} onClick={() => setSection(id)} aria-pressed={section === id}>{label}</button>)}</div><span>{dirty ? "Kaydedilmemiş değişiklikler" : "Kayıtlı taslak"}</span></div>
    {error && <p role="alert" className="editor-error">{error} <button disabled={busy} onClick={async () => { if (dirty && !window.confirm("Değişiklikleriniz bırakılıp kayıtlı taslak yüklensin mi?")) return; try { await load(); setError(""); } catch (err) { setError((err as Error).message); } }}>Kayıtlı taslağı yeniden yükle</button></p>}
    {message && <p role="status" className="editor-success">{message}</p>}
    <details className="editor-news"><summary>Üretir ID · Girişim, yazı ve yorum incelemesi</summary><MemberReview/></details><details className="editor-news"><summary>HaberAI · Harita haberlerini düzenle</summary><HaberEditor/></details>{data && <><fieldset disabled={busy} className="editor-content">
      {section === "headings" && <><h2>Site kategorileri</h2><p>Üst menü: Gelişmeler, Ekosistem, Çözümler, Girişimler ve Kaynaklar. Alt menüler sayfa yapısıyla birlikte yönetilir.</p><h2>Gelişmeler ve kategori başlıkları</h2><Field label="Sayfa başlığı" value={data.content.developmentsTitle} maxLength={100} onChange={value => change({ ...data.content, developmentsTitle: value })} /><div className="editor-grid">{data.content.categories.map((item,index) => <Field key={item.id} label={item.id} maxLength={50} value={item.label} onChange={value => change({ ...data.content, categories: data.content.categories.map((c,i) => i === index ? { ...c, label: value } : c) })} />)}</div></>}
      {section === "home" && <><h2>Ana sayfa metinleri</h2>{([["eyebrow","Üst açıklama",100],["title","Ana başlık · satırları Enter ile ayırın",120],["description","Giriş açıklaması",500],["ecosystemTitle","Ekosistem başlığı",100],["manifesto","Manifesto başlığı",240]] as const).map(([key,label,limit]) => <Field key={key} label={label} value={data.content.home[key]} multiline={key === "title" || key === "description"} maxLength={limit} onChange={value => change({ ...data.content, home: { ...data.content.home, [key]: value } })} />)}</>}
      {section === "news" && <><div className="editor-top"><div><h2>Haberler <span>({data.content.news.length})</span></h2><p>Kaynağı kontrol edin, tarihleri girin ve yayında görünecek haberleri seçin.</p></div><button onClick={() => { const item: NewsItem = { id: crypto.randomUUID(), title: "Yeni haber", category: "haberler", summary: "", body: "", sourceName: "", sourceUrl: "", publishedAt: todayInTurkey(), checkedAt: todayInTurkey(), eventStart: null, eventEnd: null, deadline: null, location: "", visible: false }; change({ ...data.content, news: [item, ...data.content.news] }); }}>+ Haber ekle</button></div>{data.content.news.map((item,index) => {
        const update = (patch: Partial<NewsItem>) => change({ ...data.content, news: data.content.news.map((n,i) => i === index ? { ...n, ...patch } : n) });
        return <details className="editor-news" key={item.id}><summary>{item.title}<span>{item.visible ? "Yayına dahil" : "Gizli"}</span></summary><div className="editor-news-fields"><Field label="Haber başlığı" value={item.title} maxLength={180} onChange={title => update({ title })} /><label className="editor-field"><span>Kategori</span><select value={item.category} onChange={e => update({ category: e.target.value as NewsItem["category"] })}>{data.content.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}</select></label><Field label="Kısa özet" value={item.summary} multiline maxLength={700} onChange={summary => update({ summary })} /><Field label="Haber metni" value={item.body} multiline maxLength={6000} onChange={body => update({ body })} /><div className="editor-grid"><Field label="Kaynak adı" value={item.sourceName} maxLength={100} onChange={sourceName => update({ sourceName })} /><Field label="Kaynak bağlantısı (https://)" value={item.sourceUrl} type="url" maxLength={2000} onChange={sourceUrl => update({ sourceUrl })} /><Field label="Konum" value={item.location} maxLength={150} required={false} onChange={location => update({ location })} />{([["publishedAt","Kaynak yayın tarihi (bilinmiyorsa boş bırakın)"],["checkedAt","Kaynağı kontrol ettiğiniz tarih"],["eventStart","Etkinlik başlangıcı (isteğe bağlı)"],["eventEnd","Etkinlik bitişi (isteğe bağlı)"],["deadline","Son başvuru günü (isteğe bağlı)"]] as const).map(([key,label]) => <Field key={key} label={label} type="date" value={item[key] ?? ""} required={key === "checkedAt"} onChange={value => update({ [key]: value || (key === "checkedAt" ? "" : null) })} />)}</div><label className="editor-check"><input type="checkbox" checked={item.visible} onChange={e => update({ visible: e.target.checked })} /> Yayımlanan haberler arasında göster</label><button className="editor-danger" onClick={() => { if (window.confirm("Bu haber taslaktan kaldırılsın mı? Yayından kalkması için değişiklikleri yayımlayın.")) change({ ...data.content, news: data.content.news.filter(n => n.id !== item.id) }); }}>Haberi kaldır</button></div></details>;
      })}</>}
      {section === "preview" && <><h2>Taslak önizleme</h2><p>Bu içerik yalnızca size görünür. Yayınla düğmesiyle ziyaretçilere açılır.</p><div className="editor-nav-preview">{siteNavigation.map(item => <span key={item.href}>{item.label}</span>)}</div><div className="editor-home-preview"><p>{data.content.home.eyebrow}</p><h2>{data.content.home.title}</h2><p>{data.content.home.description}</p><h3>{data.content.home.ecosystemTitle}</h3><p>{data.content.home.manifesto}</p></div><Developments content={data.content} preview /></>}
    </fieldset><div className="editor-actions"><button disabled={busy} onClick={() => save("draft")}>Taslağı kaydet</button><button className="editor-primary" disabled={busy} onClick={() => save("publish")}>{busy ? "İşleniyor…" : "Değişiklikleri yayımla"}</button><button disabled={busy || !data.canRestore} onClick={() => save("restore")}>Önceki yayına dön</button><a href="/gelismeler" target="_blank" rel="noopener noreferrer">Yayımlanan sayfayı aç ↗</a></div></>}
  </div>;
}

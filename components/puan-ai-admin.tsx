"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Database, LogOut, Pencil, Plus, RefreshCcw, Save, ShieldAlert, Trash2, X } from "lucide-react";

type Resource = "banks" | "cards" | "categories" | "merchants" | "reward-types" | "campaigns" | "rules" | "installments" | "verifications" | "scoring";
type FormValue = string | boolean;
type FormState = Record<string, FormValue>;
type AdminRecord = Record<string, unknown> & { id: string };

type Field = {
  name: string;
  label: string;
  type?: "text" | "url" | "number" | "textarea" | "datetime" | "checkbox" | "select" | "multiselect" | "aliases";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  lookup?: Resource;
  placeholder?: string;
};

const resourceLabels: Record<Resource, { label: string; singular: string }> = {
  banks: { label: "Bankalar", singular: "Banka" },
  cards: { label: "Kartlar", singular: "Kart" },
  categories: { label: "Kategoriler", singular: "Kategori" },
  merchants: { label: "Mağazalar", singular: "Mağaza" },
  "reward-types": { label: "Ödül tipleri", singular: "Ödül tipi" },
  campaigns: { label: "Kampanyalar", singular: "Kampanya" },
  rules: { label: "Ödül ve katılım kuralları", singular: "Kural" },
  installments: { label: "Taksitler", singular: "Taksit" },
  verifications: { label: "Doğrulama durumu", singular: "Doğrulama" },
  scoring: { label: "Skor ağırlıkları", singular: "Skor yapılandırması" },
};

const statusOptions = ["ACTIVE", "INACTIVE"].map((value) => ({ value, label: value === "ACTIVE" ? "Aktif" : "Pasif" }));
const campaignStatusOptions = ["DRAFT", "PENDING_VERIFICATION", "VERIFIED", "EXPIRED", "REJECTED"].map((value) => ({ value, label: value.replaceAll("_", " ") }));
const verificationOptions = ["PENDING", "VERIFIED", "REJECTED", "STALE"].map((value) => ({ value, label: value }));

const fields: Record<Resource, Field[]> = {
  banks: [
    { name: "name", label: "Görünen ad", required: true },
    { name: "officialName", label: "Resmî unvan", required: true },
    { name: "slug", label: "Slug", required: true },
    { name: "shortName", label: "Kısa ad", required: true },
    { name: "websiteUrl", label: "Resmî web sitesi", type: "url", required: true },
    { name: "color", label: "Marka rengi", placeholder: "#769d32", required: true },
    { name: "status", label: "Durum", type: "select", options: statusOptions, required: true },
  ],
  cards: [
    { name: "bankId", label: "Banka", type: "select", lookup: "banks", required: true },
    { name: "name", label: "Kart adı", required: true },
    { name: "slug", label: "Slug", required: true },
    { name: "network", label: "Kart ağı", type: "select", options: ["VISA", "MASTERCARD", "TROY", "AMEX", "OTHER"].map((value) => ({ value, label: value })), required: true },
    { name: "rewardProgram", label: "Ödül programı" },
    { name: "annualFee", label: "Yıllık ücret", type: "number" },
    { name: "currency", label: "Para birimi", placeholder: "TRY", required: true },
    { name: "active", label: "Aktif", type: "checkbox" },
  ],
  categories: [
    { name: "parentId", label: "Üst kategori", type: "select", lookup: "categories" },
    { name: "name", label: "Kategori adı", required: true },
    { name: "slug", label: "Slug", required: true },
    { name: "aliases", label: "Arama eş anlamları", type: "aliases", placeholder: "market, süpermarket, gıda" },
    { name: "status", label: "Durum", type: "select", options: statusOptions, required: true },
  ],
  merchants: [
    { name: "categoryId", label: "Kategori", type: "select", lookup: "categories", required: true },
    { name: "name", label: "Mağaza / marka", required: true },
    { name: "slug", label: "Slug", required: true },
    { name: "aliases", label: "Arama eş anlamları", type: "aliases" },
    { name: "websiteUrl", label: "Resmî site", type: "url" },
    { name: "status", label: "Durum", type: "select", options: statusOptions, required: true },
  ],
  "reward-types": [
    { name: "name", label: "Ödül adı", required: true },
    { name: "slug", label: "Slug", required: true },
    { name: "kind", label: "Tür", type: "select", options: ["POINTS", "CASHBACK", "MILES", "DISCOUNT", "OTHER"].map((value) => ({ value, label: value })), required: true },
    { name: "unit", label: "Birim", placeholder: "TL değerinde puan", required: true },
    { name: "status", label: "Durum", type: "select", options: statusOptions, required: true },
  ],
  campaigns: [
    { name: "bankId", label: "Banka", type: "select", lookup: "banks", required: true },
    { name: "merchantId", label: "Mağaza", type: "select", lookup: "merchants" },
    { name: "merchantCategoryId", label: "Kategori", type: "select", lookup: "categories", required: true },
    { name: "rewardTypeId", label: "Ödül tipi", type: "select", lookup: "reward-types" },
    { name: "cardIds", label: "Geçerli kartlar", type: "multiselect", lookup: "cards" },
    { name: "title", label: "Başlık", required: true },
    { name: "slug", label: "Slug", required: true },
    { name: "description", label: "Açıklama", type: "textarea", required: true },
    { name: "benefitSummary", label: "Avantaj özeti", type: "textarea", required: true },
    { name: "startDate", label: "Başlangıç", type: "datetime", required: true },
    { name: "endDate", label: "Bitiş", type: "datetime", required: true },
    { name: "status", label: "Durum", type: "select", options: campaignStatusOptions, required: true },
    { name: "published", label: "Yayında", type: "checkbox" },
  ],
  rules: [
    { name: "campaignId", label: "Kampanya", type: "select", lookup: "campaigns", required: true },
    { name: "kind", label: "Kural türü", type: "select", options: ["MIN_SPEND", "MAX_SPEND", "REWARD_AMOUNT", "MAX_REWARD", "REQUIRED_PURCHASE_COUNT", "REQUIRED_CHANNEL", "REQUIRED_ENROLLMENT", "REQUIRED_PAYMENT_METHOD", "ELIGIBILITY", "EXCLUSION", "OTHER"].map((value) => ({ value, label: value })), required: true },
    { name: "operator", label: "Operatör", type: "select", options: ["EQ", "GTE", "LTE", "CONTAINS", "EXCLUDES", "INFO"].map((value) => ({ value, label: value })), required: true },
    { name: "numericValue", label: "Sayısal değer", type: "number" },
    { name: "textValue", label: "Metin değeri" },
    { name: "unit", label: "Birim" },
    { name: "description", label: "Kullanıcıya gösterilen koşul", type: "textarea", required: true },
    { name: "priority", label: "Sıra", type: "number", required: true },
  ],
  installments: [
    { name: "campaignId", label: "Kampanya", type: "select", lookup: "campaigns", required: true },
    { name: "count", label: "Taksit sayısı", type: "number", required: true },
    { name: "feeFree", label: "Vade farksız", type: "checkbox" },
    { name: "productScope", label: "Ürün kapsamı" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ],
  verifications: [
    { name: "campaignId", label: "Kampanya", type: "select", lookup: "campaigns", required: true },
    { name: "url", label: "Resmî kaynak URL", type: "url", required: true },
    { name: "title", label: "Kaynak başlığı", required: true },
    { name: "publisher", label: "Yayıncı", required: true },
    { name: "evidence", label: "Doğrulanan kaynak özeti", type: "textarea", required: true, placeholder: "Tarih, tutar, ödül/taksit, kart kapsamı ve istisnaları kaynaktan özetleyin." },
    { name: "status", label: "Doğrulama", type: "select", options: verificationOptions, required: true },
    { name: "checkedAt", label: "Kontrol zamanı", type: "datetime", required: true },
    { name: "nextCheckAt", label: "Sonraki kontrol", type: "datetime", required: true },
    { name: "checker", label: "Kontrol eden", required: true },
    { name: "summary", label: "Doğrulama notu", type: "textarea", required: true },
  ],
  scoring: [
    { name: "key", label: "Yapılandırma anahtarı", required: true, placeholder: "default" },
    { name: "weights", label: "Ağırlıklar (JSON)", type: "textarea", required: true, placeholder: "{\"price\":30,\"campaign\":25,\"reward\":15,\"installment\":10,\"preference\":10,\"merchantReliability\":5,\"dataConfidence\":5,\"risk\":10}" },
    { name: "version", label: "Sürüm", type: "number", required: true },
    { name: "updatedBy", label: "Güncelleyen", required: true },
    { name: "active", label: "Aktif", type: "checkbox" },
  ],
};

function localDateTime(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function emptyForm(resource: Resource): FormState {
  const state: FormState = {};
  for (const field of fields[resource]) {
    state[field.name] = field.type === "checkbox" ? false : "";
  }
  if ("status" in state) state.status = resource === "verifications" ? "PENDING" : resource === "campaigns" ? "DRAFT" : "ACTIVE";
  if ("currency" in state) state.currency = "TRY";
  if ("network" in state) state.network = "VISA";
  if ("operator" in state) state.operator = "INFO";
  if ("priority" in state) state.priority = "0";
  if ("active" in state) state.active = true;
  if ("feeFree" in state) state.feeFree = true;
  if ("version" in state) state.version = "1";
  if ("weights" in state) state.weights = JSON.stringify({ price: 30, campaign: 25, reward: 15, installment: 10, preference: 10, merchantReliability: 5, dataConfidence: 5, risk: 10 });
  if ("checkedAt" in state) state.checkedAt = localDateTime(new Date());
  return state;
}

function recordLabel(record: AdminRecord) {
  return String(record.name ?? record.title ?? record.description ?? record.kind ?? record.status ?? record.id);
}

export function PuanAIAdmin() {
  const [configured, setConfigured] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [resource, setResource] = useState<Resource>("campaigns");
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [lookups, setLookups] = useState<Partial<Record<Resource, AdminRecord[]>>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm("campaigns"));
  const [originalForm, setOriginalForm] = useState<FormState>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchJson = useCallback(async (path: string) => {
    const response = await fetch(path, { cache: "no-store" });
    const body = await response.json() as { data?: AdminRecord[]; error?: string; authenticated?: boolean; configured?: boolean };
    if (!response.ok) throw new Error(body.error ?? "İşlem tamamlanamadı.");
    return body;
  }, []);

  const loadResource = useCallback(async (nextResource: Resource) => {
    const body = await fetchJson(`/api/puan-ai/admin/${nextResource}`);
    const data = body.data ?? [];
    setRecords(data);
    setLookups((current) => ({ ...current, [nextResource]: data }));
  }, [fetchJson]);

  const loadLookups = useCallback(async () => {
    const keys: Resource[] = ["banks", "cards", "categories", "merchants", "reward-types", "campaigns"];
    const responses = await Promise.all(keys.map(async (key) => [key, (await fetchJson(`/api/puan-ai/admin/${key}`)).data ?? []] as const));
    setLookups(Object.fromEntries(responses) as Partial<Record<Resource, AdminRecord[]>>);
  }, [fetchJson]);

  useEffect(() => {
    void fetchJson("/api/puan-ai/admin/session")
      .then(async (body) => {
        setConfigured(body.configured ?? false);
        setAuthenticated(body.authenticated ?? false);
        if (body.authenticated) await Promise.all([loadLookups(), loadResource("campaigns")]);
      })
      .catch(() => { setConfigured(false); setAuthenticated(false); });
  }, [fetchJson, loadLookups, loadResource]);

  const optionsFor = useCallback((field: Field) => {
    if (field.options) return field.options;
    if (!field.lookup) return [];
    return (lookups[field.lookup] ?? []).map((record) => ({ value: record.id, label: recordLabel(record) }));
  }, [lookups]);

  const title = resourceLabels[resource];
  const selectedFields = fields[resource];
  const isEditingVerification = resource === "verifications" && editingId;

  const recordStatus = useMemo(() => {
    const verified = records.filter((record) => record.status === "VERIFIED").length;
    return verified ? `${verified} doğrulanmış` : `${records.length} kayıt`;
  }, [records]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/puan-ai/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Giriş yapılamadı.");
      setAuthenticated(true);
      setPassword("");
      await Promise.all([loadLookups(), loadResource(resource)]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/puan-ai/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setRecords([]);
    setLookups({});
  }

  async function switchResource(next: Resource) {
    setResource(next);
    setEditingId(null);
    setForm(emptyForm(next));
    setOriginalForm({});
    setError("");
    setNotice("");
    try { await loadResource(next); } catch (reason) { setError(reason instanceof Error ? reason.message : "Kayıtlar yüklenemedi."); }
  }

  function edit(record: AdminRecord) {
    const next = emptyForm(resource);
    for (const field of selectedFields) {
      let value = record[field.name];
      if (field.name === "cardIds" && Array.isArray(record.cards)) {
        value = (record.cards as Array<{ cardId: string }>).map((item) => item.cardId).join(",");
      }
      if (resource === "verifications" && field.name === "url") value = (record.officialSource as { url?: string } | undefined)?.url ?? "";
      if (resource === "verifications" && field.name === "title") value = (record.officialSource as { title?: string } | undefined)?.title ?? "";
      if (resource === "verifications" && field.name === "publisher") value = (record.officialSource as { publisher?: string } | undefined)?.publisher ?? "";
      if (field.type === "datetime") next[field.name] = localDateTime(value);
      else if (field.type === "aliases") next[field.name] = Array.isArray(value) ? value.join(", ") : "";
      else if (field.type === "checkbox") next[field.name] = Boolean(value);
      else if (field.name === "weights" && typeof value === "object") next[field.name] = JSON.stringify(value, null, 2);
      else next[field.name] = value === null || value === undefined ? "" : String(value);
    }
    setEditingId(record.id);
    setForm(next);
    setOriginalForm(next);
    setError("");
    setNotice("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm(resource));
    setOriginalForm({});
  }

  function payloadFromForm() {
    const payload: Record<string, unknown> = {};
    for (const field of selectedFields) {
      const value = form[field.name];
      if (editingId && value === originalForm[field.name]) continue;
      if (field.type === "aliases") payload[field.name] = String(value).split(",").map((item) => item.trim()).filter(Boolean);
      else if (field.type === "multiselect") payload[field.name] = String(value).split(",").filter(Boolean);
      else if (field.type === "number") payload[field.name] = value === "" ? null : Number(value);
      else if (field.type === "datetime") payload[field.name] = value ? new Date(String(value)).toISOString() : "";
      else if (field.type === "checkbox") payload[field.name] = Boolean(value);
      else payload[field.name] = value;
    }
    return payload;
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/puan-ai/admin/${resource}${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm()),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Kayıt kaydedilemedi.");
      setNotice(`${title.singular} kaydedildi.`);
      cancelEdit();
      await Promise.all([loadResource(resource), loadLookups()]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Kayıt kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(record: AdminRecord) {
    if (!window.confirm(`“${recordLabel(record)}” kaydı devre dışı bırakılsın veya silinsin mi?`)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/puan-ai/admin/${resource}/${record.id}`, { method: "DELETE" });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "İşlem tamamlanamadı.");
      await Promise.all([loadResource(resource), loadLookups()]);
      if (editingId === record.id) cancelEdit();
      setNotice("Kayıt güncellendi.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "İşlem tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  }

  if (authenticated === null) return <div className="pa-admin-loading"><h1 className="sr-only">PuanAI veri yönetimi</h1><RefreshCcw className="animate-spin" size={22} /> Admin alanı hazırlanıyor…</div>;

  if (!authenticated) {
    return <div className="pa-admin-login">
      <Link href="/puan-ai"><ArrowLeft size={14} /> PuanAI&apos;a dön</Link>
      <div className="pa-admin-login__card">
        <span><Database size={19} /></span>
        <p className="pa-kicker">PuanAI veri yönetimi</p>
        <h1>Kampanya doğrulama<br /><em>merkezi.</em></h1>
        {configured ? <form onSubmit={login}>
          <label htmlFor="admin-password">Yönetici parolası</label>
          <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          <button type="submit" disabled={busy}>Güvenli giriş</button>
        </form> : <div className="pa-admin-config"><ShieldAlert size={18} /><p><strong>Admin erişimi kapalı.</strong><span>Sunucu ortamında PUANAI_ADMIN_PASSWORD ve en az 32 karakterli PUANAI_SESSION_SECRET tanımlayın.</span></p></div>}
        {error && <p className="pa-admin-error">{error}</p>}
      </div>
    </div>;
  }

  return <div className="pa-admin">
    <aside>
      <div className="pa-admin__brand"><span>P</span><div><strong>PuanAI</strong><small>Veri yönetimi</small></div></div>
      <nav aria-label="Admin kaynakları">{(Object.keys(resourceLabels) as Resource[]).map((key) => <button key={key} type="button" className={key === resource ? "is-active" : ""} onClick={() => void switchResource(key)}>{resourceLabels[key].label}</button>)}</nav>
      <Link href="/puan-ai"><ArrowLeft size={14} /> PuanAI&apos;a dön</Link>
      <button type="button" onClick={() => void logout()}><LogOut size={14} /> Çıkış yap</button>
    </aside>

    <section className="pa-admin__main" aria-labelledby="pa-admin-title">
      <header>
        <div><p className="pa-kicker">Kaynak / {resource}</p><h1 id="pa-admin-title">{title.label}</h1><p>{records.length} kayıt · {recordStatus}</p></div>
        <button type="button" onClick={cancelEdit}><Plus size={15} /> Yeni {title.singular.toLocaleLowerCase("tr-TR")}</button>
      </header>

      {(error || notice) && <div className={`pa-admin-alert ${error ? "is-error" : ""}`}>{error ? <ShieldAlert size={15} /> : <CheckCircle2 size={15} />}{error || notice}</div>}

      <div className="pa-admin__workspace">
        <section className="pa-admin-table-wrap">
          <div className="pa-admin-table__head"><span>Kayıt</span><span>Durum / ilişki</span><span>İşlem</span></div>
          <div className="pa-admin-table">
            {records.map((record) => <div key={record.id}>
              <div><strong>{recordLabel(record)}</strong><small>{String(record.slug ?? record.kind ?? record.id)}</small></div>
              <div><StatusLine record={record} /></div>
              <div><button type="button" onClick={() => edit(record)} aria-label="Düzenle"><Pencil size={14} /></button><button type="button" onClick={() => void remove(record)} aria-label="Sil veya devre dışı bırak"><Trash2 size={14} /></button></div>
            </div>)}
            {records.length === 0 && <p className="pa-admin-table__empty">Bu kaynakta henüz kayıt yok.</p>}
          </div>
        </section>

        <form className="pa-admin-form" onSubmit={save}>
          <div className="pa-admin-form__head"><div><p className="pa-kicker">{editingId ? "Düzenle" : "Yeni kayıt"}</p><h2>{title.singular}</h2></div>{editingId && <button type="button" onClick={cancelEdit} aria-label="Düzenlemeyi kapat"><X size={16} /></button>}</div>
          {selectedFields.map((field) => {
            if (isEditingVerification && ["campaignId", "url", "title", "publisher", "evidence"].includes(field.name)) return null;
            const value = form[field.name] ?? "";
            const options = optionsFor(field);
            return <label key={field.name} className={field.type === "textarea" || field.type === "multiselect" ? "is-wide" : ""}>
              {field.type === "checkbox" ? <span className="pa-admin-checkbox"><input type="checkbox" checked={Boolean(value)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.checked }))} /><span>{field.label}</span></span> : <>
                <span>{field.label}{field.required && <b>*</b>}</span>
                {field.type === "textarea" || field.type === "aliases" ? <textarea value={String(value)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} placeholder={field.placeholder} rows={field.type === "textarea" ? 4 : 2} required={field.required} />
                  : field.type === "select" ? <select value={String(value)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} required={field.required}><option value="">Seçin</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                    : field.type === "multiselect" ? <select multiple value={String(value).split(",").filter(Boolean)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: Array.from(event.target.selectedOptions).map((option) => option.value).join(",") }))}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                      : <input type={field.type === "datetime" ? "datetime-local" : field.type ?? "text"} value={String(value)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} placeholder={field.placeholder} required={field.required} step={field.type === "number" ? "any" : undefined} />}
              </>}
            </label>;
          })}
          <div className="pa-admin-form__actions"><button type="submit" disabled={busy}><Save size={14} /> {busy ? "Kaydediliyor…" : "Kaydet"}</button>{editingId && <button type="button" onClick={cancelEdit}>İptal</button>}</div>
        </form>
      </div>
    </section>
  </div>;
}

function StatusLine({ record }: { record: AdminRecord }) {
  const relation = record.bank as { name?: string } | undefined
    ?? record.campaign as { title?: string } | undefined
    ?? record.category as { name?: string } | undefined;
  let relationLabel: string | undefined;
  if (relation && "name" in relation) relationLabel = relation.name;
  if (relation && "title" in relation) relationLabel = relation.title;
  const status = String(record.status ?? (record.active === false ? "INACTIVE" : record.published === true ? "PUBLISHED" : "ACTIVE"));
  return <><span className={`pa-admin-status pa-admin-status--${status.toLocaleLowerCase()}`}>{status}</span>{relationLabel && <small>{relationLabel}</small>}</>;
}

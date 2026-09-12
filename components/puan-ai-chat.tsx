"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Clock3,
  Menu,
  MessageSquarePlus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { PuanAICampaignResult } from "@/components/puan-ai-campaign-result";
import { analyticsAttributes } from "@/lib/analytics";
import type { CampaignMatch, ChatEvent } from "@/lib/puan-ai/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  campaigns: CampaignMatch[];
  pending?: boolean;
};

type ConversationSummary = {
  id: string;
  title: string;
  updatedAt: string;
  _count: { messages: number };
};

const suggestions = [
  "Migros'ta 1.000 TL alışveriş yapacağım. Hangi kart avantajlı?",
  "Bir iPhone alacağım, taksit yapabilir miyim?",
  "E-ticarette en yüksek güncel puan hangi kartta?",
  "3.000 TL online alışveriş için hangi kampanya uygun?",
];

const greeting: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Ne alacağını, nerede harcayacağını veya bütçeni yaz. Yalnızca güncel, resmî kaynağı ve doğrulama kaydı bulunan kampanyaları karşılaştırırım.",
  campaigns: [],
};

function parseSseBlock(block: string): ChatEvent | null {
  const data = block.split("\n").find((line) => line.startsWith("data: "))?.slice(6);
  if (!data) return null;
  try { return JSON.parse(data) as ChatEvent; } catch { return null; }
}

export function PuanAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyAvailable, setHistoryAvailable] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/puan-ai/conversations", { cache: "no-store" });
      const body = await response.json() as { data?: ConversationSummary[] };
      if (!response.ok) throw new Error();
      setConversations(body.data ?? []);
      setHistoryAvailable(true);
    } catch {
      setHistoryAvailable(false);
    }
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages]);

  async function openConversation(id: string) {
    if (streaming) return;
    try {
      const response = await fetch(`/api/puan-ai/conversations/${id}`, { cache: "no-store" });
      const body = await response.json() as { data?: { messages: ChatMessage[] } };
      if (!response.ok || !body.data) return;
      setConversationId(id);
      setMessages(body.data.messages.length ? body.data.messages : [greeting]);
      setHistoryOpen(false);
    } catch {
      setHistoryAvailable(false);
    }
  }

  function newConversation() {
    if (streaming) return;
    setConversationId(undefined);
    setMessages([greeting]);
    setInput("");
    setHistoryOpen(false);
    textareaRef.current?.focus();
  }

  async function deleteConversation(id: string) {
    if (!window.confirm("Bu sohbet kalıcı olarak silinsin mi?")) return;
    const response = await fetch(`/api/puan-ai/conversations/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    if (conversationId === id) newConversation();
    await loadHistory();
  }

  async function sendMessage(value = input) {
    const message = value.trim();
    if (!message || streaming) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: message, campaigns: [] };
    const assistantId = crypto.randomUUID();
    setMessages((items) => [...items, userMessage, { id: assistantId, role: "assistant", content: "", campaigns: [], pending: true }]);
    setInput("");
    setStreaming(true);

    try {
      const response = await fetch("/api/puan-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId }),
      });
      if (!response.ok || !response.body) throw new Error("stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value: chunk } = await reader.read();
        buffer += decoder.decode(chunk ?? new Uint8Array(), { stream: !done });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";
        for (const block of blocks) {
          const event = parseSseBlock(block);
          if (!event) continue;
          if (event.type === "meta") {
            setConversationId(event.conversationId || undefined);
            setMessages((items) => items.map((item) => item.id === assistantId ? { ...item, campaigns: event.campaigns } : item));
          }
          if (event.type === "delta") {
            setMessages((items) => items.map((item) => item.id === assistantId ? { ...item, content: item.content + event.delta, pending: false } : item));
          }
        }
        if (done) break;
      }
    } catch {
      setMessages((items) => items.map((item) => item.id === assistantId
        ? { ...item, content: "Güncel kampanyayı doğrulayamadım. Lütfen yeniden deneyin.", pending: false }
        : item));
    } finally {
      setStreaming(false);
      void loadHistory();
      textareaRef.current?.focus();
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return <div className="pa-chat-shell">
    <aside className={`pa-history ${historyOpen ? "is-open" : ""}`}>
      <div className="pa-history__top">
        <Link href="/puan-ai" className="pa-wordmark"><span>P</span>PuanAI</Link>
        <button type="button" onClick={() => setHistoryOpen(false)} className="pa-mobile-close" aria-label="Geçmişi kapat"><X size={18} /></button>
      </div>
      <button type="button" onClick={newConversation} className="pa-new-chat"><MessageSquarePlus size={16} /> Yeni sohbet</button>
      <div className="pa-history__heading"><span>Sohbet geçmişi</span><Clock3 size={13} /></div>
      <div className="pa-history__list">
        {conversations.map((conversation) => <div key={conversation.id} className={conversation.id === conversationId ? "is-active" : ""}>
          <button type="button" onClick={() => void openConversation(conversation.id)}>
            <span>{conversation.title}</span><small>{conversation._count.messages} mesaj</small>
          </button>
          <button type="button" className="pa-history__delete" onClick={() => void deleteConversation(conversation.id)} aria-label={`${conversation.title} sohbetini sil`}><Trash2 size={13} /></button>
        </div>)}
        {conversations.length === 0 && <p>{historyAvailable ? "Henüz kayıtlı sohbet yok." : "Geçmiş şu anda kullanılamıyor."}</p>}
      </div>
      <div className="pa-history__trust"><ShieldCheck size={16} /><p><strong>Doğrulanmış veri</strong><span>Yanıtlar yalnızca güncel resmî kaynaklara dayanır.</span></p></div>
      <Link href="/puan-ai/admin" className="pa-admin-link">Veri yönetimi <ArrowRight size={13} /></Link>
    </aside>

    {historyOpen && <button type="button" className="pa-history-backdrop" onClick={() => setHistoryOpen(false)} aria-label="Geçmişi kapat" />}

    <section className="pa-chat-main" aria-label="PuanAI sohbeti">
      <header className="pa-chat-topbar">
        <button type="button" className="pa-history-toggle" onClick={() => setHistoryOpen(true)} aria-label="Sohbet geçmişini aç"><Menu size={19} /></button>
        <div><span className="pa-live-dot" /> Canlı kural motoru</div>
        <p><Check size={13} /> Kaynak zorunlu</p>
      </header>

      <div className="pa-thread" aria-live="polite">
        <div className="pa-thread__intro">
          <span className="pa-spark"><Sparkles size={20} /></span>
          <p className="pa-kicker">Türkiye&apos;nin kampanya asistanı</p>
          <h1>Harcamadan önce,<br /><em>PuanAI&apos;a sor.</em></h1>
          <p>Bankaların güncel kampanyalarını tutar, kart, mağaza ve taksit koşullarına göre karşılaştır.</p>
        </div>

        <div className="pa-messages">
          {messages.map((message) => <div key={message.id} className={`pa-message pa-message--${message.role}`}>
            {message.role === "assistant" && <span className="pa-avatar"><Bot size={16} /></span>}
            <div className="pa-message__content">
              <span>{message.role === "assistant" ? "PuanAI" : "Sen"}</span>
              {message.pending ? <div className="pa-typing" aria-label="PuanAI düşünüyor"><i /><i /><i /></div> : <p>{message.content}</p>}
              {message.campaigns.length > 0 && <div className="pa-message__campaigns">{message.campaigns.map((campaign) => <PuanAICampaignResult key={campaign.id} campaign={campaign} />)}</div>}
            </div>
          </div>)}
          <div ref={endRef} />
        </div>

        {messages.length === 1 && <div className="pa-suggestions" aria-label="Önerilen sorular">
          {suggestions.map((suggestion, index) => <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} {...analyticsAttributes({ event: "ai_intent_select", surface: "puan_ai_advisor", target: `suggestion-${index + 1}` })}><span>{suggestion}</span><ArrowRight size={14} /></button>)}
        </div>}
      </div>

      <div className="pa-composer-wrap">
        <form className="pa-composer" onSubmit={submit} {...analyticsAttributes({ event: "ai_prompt_submit", surface: "puan_ai_advisor", target: "verified-chat" })}>
          <label htmlFor="puanai-message" className="sr-only">PuanAI&apos;a sor</label>
          <textarea
            ref={textareaRef}
            id="puanai-message"
            value={input}
            onChange={(event) => setInput(event.target.value.slice(0, 1200))}
            onKeyDown={handleKeyDown}
            placeholder="Örn. Migros'ta 2.500 TL harcayacağım; hangi kart daha avantajlı?"
            rows={2}
            disabled={streaming}
          />
          <button type="submit" disabled={!input.trim() || streaming} aria-label="Soruyu gönder"><Send size={17} /></button>
        </form>
        <p>PuanAI finansal tavsiye vermez. İşlemden önce resmî banka koşullarını kontrol et.</p>
      </div>
    </section>
  </div>;
}

export function PuanAICampaignExplorer() {
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [installment, setInstallment] = useState("");
  const [bank, setBank] = useState("");
  const [results, setResults] = useState<CampaignMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = useCallback(async (params?: { query?: string }) => {
    setLoading(true);
    setError("");
    const url = new URL("/api/puan-ai/campaigns", window.location.origin);
    const nextQuery = params?.query ?? query;
    if (nextQuery) url.searchParams.set("q", nextQuery);
    if (amount) url.searchParams.set("amount", amount);
    if (installment) url.searchParams.set("installment", installment);
    if (bank) url.searchParams.set("bank", bank);
    try {
      const response = await fetch(url, { cache: "no-store" });
      const body = await response.json() as { data?: CampaignMatch[]; error?: string };
      setResults(body.data ?? []);
      if (!response.ok) setError(body.error ?? "Kampanyalar yüklenemedi.");
    } catch {
      setError("Kampanyalar yüklenemedi.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [amount, bank, installment, query]);

  useEffect(() => {
    let active = true;
    const loadInitialCampaigns = async () => {
      try {
        const response = await fetch("/api/puan-ai/campaigns?q=g%C3%BCncel%20kampanyalar", { cache: "no-store" });
        const body = await response.json() as { data?: CampaignMatch[]; error?: string };
        if (!active) return;
        setResults(body.data ?? []);
        if (!response.ok) setError(body.error ?? "Kampanyalar yüklenemedi.");
      } catch {
        if (active) setError("Kampanyalar yüklenemedi.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadInitialCampaigns();
    return () => { active = false; };
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    void search();
  }

  return <section className="pa-explorer" aria-labelledby="pa-explorer-title">
    <div className="pa-explorer__heading">
      <div><p className="pa-kicker">Doğrulanmış kampanya dizini</p><h2 id="pa-explorer-title">Koşullara göre<br /><em>kendin karşılaştır.</em></h2></div>
      <p><ShieldCheck size={15} /> Yalnızca doğrulaması geçerli kayıtlar</p>
    </div>
    <form className="pa-filter-grid" onSubmit={submit} {...analyticsAttributes({ event: "search_submit", surface: "puan_ai_browser", target: "verified-campaigns" })}>
      <label><span>Mağaza, kategori, kart veya ödül</span><div><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Migros, e-ticaret, MaxiPuan…" /></div></label>
      <label><span>Tutar</span><div><input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="2.500 TL" /></div></label>
      <label><span>Taksit</span><select value={installment} onChange={(event) => setInstallment(event.target.value)}><option value="">Farketmez</option>{[2, 3, 4, 6, 9, 12].map((count) => <option key={count} value={count}>{count} taksit</option>)}</select></label>
      <label><span>Banka</span><input value={bank} onChange={(event) => setBank(event.target.value)} placeholder="Banka adı" /></label>
      <button type="submit">Kampanya ara <ArrowRight size={15} /></button>
    </form>
    <div className="pa-explorer__status">
      <span>{loading ? "Kampanyalar kontrol ediliyor…" : `${results.length} doğrulanmış kampanya`}</span>
      {error && <strong>{error}</strong>}
    </div>
    {!loading && results.length === 0 && !error && <div className="pa-empty"><Search size={20} /><h3>Güncel kampanya doğrulanamadı.</h3><p>Filtreleri değiştir veya resmî kaynakların yeniden doğrulanmasını bekle.</p></div>}
    <div className="pa-explorer__grid">{results.map((campaign) => <PuanAICampaignResult key={campaign.id} campaign={campaign} />)}</div>
  </section>;
}

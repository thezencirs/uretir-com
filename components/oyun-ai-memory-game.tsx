"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock3, RotateCcw, Sparkles, Volume2 } from "lucide-react";

type Word = { id: string; emoji: string; english: string; turkish: string };
type Category = { id: string; name: string; icon: string; words: Word[] };
type Card = Word & { cardId: string; face: "picture" | "word" };

const categories: Category[] = [
  { id: "fruits", name: "Meyveler", icon: "🍓", words: [
    { id: "apple", emoji: "🍎", english: "Apple", turkish: "Elma" }, { id: "banana", emoji: "🍌", english: "Banana", turkish: "Muz" },
    { id: "strawberry", emoji: "🍓", english: "Strawberry", turkish: "Çilek" }, { id: "grapes", emoji: "🍇", english: "Grapes", turkish: "Üzüm" },
    { id: "watermelon", emoji: "🍉", english: "Watermelon", turkish: "Karpuz" }, { id: "peach", emoji: "🍑", english: "Peach", turkish: "Şeftali" },
    { id: "cherry", emoji: "🍒", english: "Cherry", turkish: "Kiraz" }, { id: "lemon", emoji: "🍋", english: "Lemon", turkish: "Limon" },
  ]},
  { id: "animals", name: "Hayvanlar", icon: "🐾", words: [
    { id: "dog", emoji: "🐶", english: "Dog", turkish: "Köpek" }, { id: "cat", emoji: "🐱", english: "Cat", turkish: "Kedi" },
    { id: "lion", emoji: "🦁", english: "Lion", turkish: "Aslan" }, { id: "elephant", emoji: "🐘", english: "Elephant", turkish: "Fil" },
    { id: "rabbit", emoji: "🐰", english: "Rabbit", turkish: "Tavşan" }, { id: "turtle", emoji: "🐢", english: "Turtle", turkish: "Kaplumbağa" },
    { id: "owl", emoji: "🦉", english: "Owl", turkish: "Baykuş" }, { id: "fox", emoji: "🦊", english: "Fox", turkish: "Tilki" },
  ]},
  { id: "food", name: "Yiyecekler", icon: "🍽️", words: [
    { id: "bread", emoji: "🍞", english: "Bread", turkish: "Ekmek" }, { id: "cheese", emoji: "🧀", english: "Cheese", turkish: "Peynir" },
    { id: "egg", emoji: "🥚", english: "Egg", turkish: "Yumurta" }, { id: "milk", emoji: "🥛", english: "Milk", turkish: "Süt" },
    { id: "rice", emoji: "🍚", english: "Rice", turkish: "Pirinç" }, { id: "soup", emoji: "🥣", english: "Soup", turkish: "Çorba" },
    { id: "cake", emoji: "🍰", english: "Cake", turkish: "Kek" }, { id: "honey", emoji: "🍯", english: "Honey", turkish: "Bal" },
  ]},
];

function shuffle<T>(items: T[]) { const result = [...items]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
function createDeck(category: Category, pairCount: number): Card[] { return shuffle(category.words).slice(0, pairCount).flatMap((word) => [{ ...word, cardId: `${word.id}-picture`, face: "picture" as const }, { ...word, cardId: `${word.id}-word`, face: "word" as const }]).sort(() => Math.random() - 0.5); }
function formatTime(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }

export function OyunAIMemoryGame() {
  const [categoryId, setCategoryId] = useState(categories[0].id); const [level, setLevel] = useState(1);
  const pairCount = level === 1 ? 6 : 8; const category = useMemo(() => categories.find((item) => item.id === categoryId) ?? categories[0], [categoryId]);
  const [deck, setDeck] = useState<Card[]>(() => createDeck(categories[0], 6)); const [open, setOpen] = useState<string[]>([]); const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0); const [seconds, setSeconds] = useState(0); const [preview, setPreview] = useState(4); const [locked, setLocked] = useState(false); const [lastMatch, setLastMatch] = useState<Word | null>(null);
  const mismatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null); const won = matched.length === pairCount;

  const startGame = useCallback((nextCategory = category, nextLevel = level) => {
    if (mismatchTimer.current) clearTimeout(mismatchTimer.current); const count = nextLevel === 1 ? 6 : 8;
    setDeck(createDeck(nextCategory, count)); setOpen([]); setMatched([]); setMoves(0); setSeconds(0); setPreview(4); setLocked(false); setLastMatch(null);
  }, [category, level]);

  useEffect(() => { if (preview <= 0) return; const timer = setTimeout(() => setPreview((value) => value - 1), 1000); return () => clearTimeout(timer); }, [preview]);
  useEffect(() => { if (preview > 0 || won) return; const timer = setInterval(() => setSeconds((value) => value + 1), 1000); return () => clearInterval(timer); }, [preview, won]);
  useEffect(() => () => { if (mismatchTimer.current) clearTimeout(mismatchTimer.current); }, []);

  const chooseCategory = (id: string) => { const next = categories.find((item) => item.id === id) ?? categories[0]; setCategoryId(next.id); setLevel(1); startGame(next, 1); };
  const speak = (word: string) => { if (!("speechSynthesis" in window)) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(word); utterance.lang = "en-US"; utterance.rate = 0.85; window.speechSynthesis.speak(utterance); };
  const flip = (card: Card) => {
    if (preview > 0 || locked || won || open.includes(card.cardId) || matched.includes(card.id)) return; const nextOpen = [...open, card.cardId]; setOpen(nextOpen); if (nextOpen.length < 2) return;
    setMoves((value) => value + 1); const first = deck.find((item) => item.cardId === nextOpen[0]);
    if (first && first.id === card.id && first.face !== card.face) { setMatched((items) => [...items, card.id]); setOpen([]); setLastMatch(card); setTimeout(() => setLastMatch(null), 1600); speak(card.english); return; }
    setLocked(true); mismatchTimer.current = setTimeout(() => { setOpen([]); setLocked(false); }, 800);
  };
  const score = Math.max(0, matched.length * 160 - Math.max(0, moves - matched.length) * 20 - seconds);

  return <div className="oyun-shell">
    <section className="oyun-intro section-wrap"><div><p className="oyun-kicker"><Sparkles size={14} /> ÜRETİR / OYUNAI</p><h1>Memo</h1><p>Kartları ezberle. İngilizce kelimeleri görselleriyle eşleştir.</p></div>
      <div className="oyun-category-picker" aria-label="Kelime kategorisi">{categories.map((item) => <button key={item.id} className={item.id === categoryId ? "is-active" : ""} onClick={() => chooseCategory(item.id)} aria-pressed={item.id === categoryId}><span>{item.icon}</span>{item.name}</button>)}</div>
    </section>
    <section className="oyun-board-wrap section-wrap" aria-label="Memo hafıza oyunu">
      <header className="oyun-hud"><div className="oyun-level"><span>SEVİYE {level}</span><strong>{category.icon} {category.name}</strong></div><div className="oyun-metrics"><span><small>EŞLEŞEN</small><strong>{matched.length} / {pairCount}</strong></span><span><small>HAMLE</small><strong>{moves}</strong></span><span><small>SÜRE</small><strong>{formatTime(seconds)}</strong></span><span><small>PUAN</small><strong>{score}</strong></span></div><button className="oyun-reset" onClick={() => startGame()} aria-label="Oyunu yeniden başlat"><RotateCcw size={20} /></button></header>
      {preview > 0 && <div className="oyun-preview" role="status"><span className="oyun-countdown">{preview}</span><div><strong>Kartları incele ve ezberle</strong><small>{preview} saniye sonra kartlar kapanacak</small></div><button onClick={() => setPreview(0)}>Hazırım</button></div>}
      {lastMatch && <div className="oyun-match" role="status"><Check size={20} /><span>{lastMatch.emoji}</span><strong>{lastMatch.english}</strong><small>{lastMatch.turkish}</small><button onClick={() => speak(lastMatch.english)} aria-label={`${lastMatch.english} kelimesini dinle`}><Volume2 size={18} /></button></div>}
      <div className={`oyun-grid oyun-grid--${pairCount}`}>{deck.map((card) => { const visible = preview > 0 || open.includes(card.cardId) || matched.includes(card.id); return <button key={card.cardId} className={`oyun-card${visible ? " is-open" : ""}${matched.includes(card.id) ? " is-matched" : ""}`} onClick={() => flip(card)} aria-label={visible ? (card.face === "picture" ? `${card.turkish} görseli` : card.english) : "Kapalı kart"} aria-pressed={visible}><span className="oyun-card-inner"><span className="oyun-card-back" aria-hidden="true"><span>O</span></span><span className="oyun-card-front">{card.face === "picture" ? <><b>{card.emoji}</b><small>{card.turkish}</small></> : <><strong>{card.english}</strong><i aria-hidden="true"><Volume2 size={16} /></i></>}</span></span></button>; })}</div>
      {won && <div className="oyun-complete" role="dialog" aria-modal="true" aria-labelledby="oyun-complete-title"><span>🏆</span><p>SEVİYE TAMAMLANDI</p><h2 id="oyun-complete-title">Harika iş!</h2><div><span><strong>{score}</strong><small>puan</small></span><span><strong>{moves}</strong><small>hamle</small></span><span><strong>{formatTime(seconds)}</strong><small>süre</small></span></div>{level === 1 ? <button onClick={() => { setLevel(2); startGame(category, 2); }}>Sonraki seviye · 16 kart</button> : <button onClick={() => startGame()}>Tekrar oyna</button>}</div>}
    </section>
    <div className="oyun-note section-wrap"><Clock3 size={17} /><p>İlk birkaç saniye bütün kartlar açık kalır. Sonra aynı kelimeye ait İngilizce kartı ve görsel kartını bul.</p></div>
  </div>;
}

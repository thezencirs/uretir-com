"use client";

/* eslint-disable @next/next/no-html-link-for-pages */
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  Compass,
  FolderHeart,
  Github,
  Globe2,
  Heart,
  Home,
  LockKeyhole,
  Mail,
  Menu,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Users,
} from "lucide-react";
import {
  authProviders,
  badges,
  feedItems,
  followedTopics,
  memberProfile,
  type IdentityView,
} from "@/lib/uretir-id";

function ProviderIcon({ name }: { name: string }) {
  if (name === "github") return <Github size={17} strokeWidth={1.8} />;
  if (name === "apple") return <span className="uretir-id-apple">●</span>;
  return <span className="uretir-id-google">G</span>;
}

const valueProps = [
  { icon: Bookmark, title: "Her şeyi kaydet", copy: "Makaleler, araçlar ve AI sohbetleri tek yerde." },
  { icon: Compass, title: "Kendi akışını kur", copy: "İlgilendiğin şirketleri, alanları ve teknolojileri takip et." },
  { icon: Sparkles, title: "AI seni tanısın", copy: "UretirAI, merakını anlayıp daha iyi öneriler sunsun." },
];

export function UretirIdShell() {
  const [view, setView] = useState<IdentityView>("auth");
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profession, setProfession] = useState("");
  const [activeNav, setActiveNav] = useState("Genel bakış");
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState<number[]>([0]);
  const [followed, setFollowed] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  function enterOnboarding() {
    setView("onboarding");
  }

  function finishOnboarding() {
    setView("dashboard");
  }

  function toggleSave(index: number) {
    setSaved((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  if (view === "auth") {
    return <AuthView emailMode={emailMode} email={email} magicSent={magicSent} setEmail={setEmail} setEmailMode={setEmailMode} setMagicSent={setMagicSent} onContinue={enterOnboarding} />;
  }

  if (view === "onboarding") {
    return <OnboardingView name={profileName} profession={profession} setName={setProfileName} setProfession={setProfession} onSkip={finishOnboarding} onFinish={finishOnboarding} />;
  }

  return <DashboardView activeNav={activeNav} followed={followed} menuOpen={menuOpen} saved={saved} setActiveNav={setActiveNav} setFollowed={setFollowed} setMenuOpen={setMenuOpen} toggleSave={toggleSave} onSignOut={() => setView("auth")} />;
}

function AuthView({ emailMode, email, magicSent, setEmail, setEmailMode, setMagicSent, onContinue }: {
  emailMode: boolean;
  email: string;
  magicSent: boolean;
  setEmail: (value: string) => void;
  setEmailMode: (value: boolean) => void;
  setMagicSent: (value: boolean) => void;
  onContinue: () => void;
}) {
  return <main className="uretir-id-auth">
    <div className="uretir-id-auth__glow" />
    <div className="uretir-id-auth__topbar">
      <a href="/" className="uretir-id-wordmark">üretir<span>.</span><small>ID</small></a>
      <a href="/" className="uretir-id-back">Uretir.com’a dön <ArrowUpRight size={14} /></a>
    </div>
    <div className="uretir-id-auth__grid">
      <section className="uretir-id-auth__story">
        <div className="uretir-id-kicker"><span /> Uretir ekosisteminin kimliği</div>
        <h1>Üretmek için<br /><em>bir kimlik.</em></h1>
        <p className="uretir-id-lede">Uretir ID ile fikirlerini, araçlarını ve ilhamını tek bir profesyonel alanda birleştir.</p>
        <div className="uretir-id-value-list">
          {valueProps.map(({ icon: Icon, title, copy }) => <div className="uretir-id-value" key={title}><span className="uretir-id-value__icon"><Icon size={16} /></span><div><strong>{title}</strong><p>{copy}</p></div></div>)}
        </div>
        <div className="uretir-id-proof"><div className="uretir-id-avatars"><span>AY</span><span>MK</span><span>SD</span><span>+</span></div><p><strong>2.480+ üretici</strong><br />kendi ekosistemini kuruyor.</p></div>
      </section>
      <section className="uretir-id-authcard">
        <div className="uretir-id-authcard__head"><div className="uretir-id-orbit"><span /><span /><span /><b>ü.</b></div><div><span className="eyebrow">Uretir ID / 001</span><h2>Hoş geldin.</h2></div></div>
        <p className="uretir-id-authcard__copy">30 saniyede katıl. İyi fikirler için daha fazla alan aç.</p>
        {!emailMode ? <>
          <div className="uretir-id-providers">{authProviders.map((provider) => <button type="button" className="uretir-id-provider" key={provider.key} onClick={onContinue}><ProviderIcon name={provider.key} /><span>{provider.label}</span><ChevronRight size={15} /></button>)}</div>
          <div className="uretir-id-divider"><span>veya</span></div>
          <button type="button" className="uretir-id-email-link" onClick={() => setEmailMode(true)}><Mail size={16} /> E-posta ile devam et <ArrowUpRight size={14} /></button>
        </> : <div className="uretir-id-email-form">
          <label htmlFor="uretir-email">E-posta adresin</label>
          <div className="uretir-id-input"><Mail size={16} /><input id="uretir-email" type="email" placeholder="sen@ornek.com" value={email} onChange={(event) => setEmail(event.target.value)} autoFocus /></div>
          <button type="button" className="uretir-id-primary" onClick={() => setMagicSent(true)} disabled={!email.includes("@")}>{magicSent ? <><Check size={16} /> Link gönderildi</> : <>Magic link gönder <ArrowUpRight size={15} /></>}</button>
          {magicSent && <button type="button" className="uretir-id-text-button" onClick={onContinue}>Demo akışına devam et →</button>}
          <button type="button" className="uretir-id-text-button" onClick={() => setEmailMode(false)}>Diğer seçeneklere dön</button>
        </div>}
        <p className="uretir-id-terms">Devam ederek <a href="/gizlilik-politikasi">Kullanım Koşulları</a> ve <a href="/gizlilik-politikasi">Gizlilik Politikası</a>’nı kabul etmiş olursun.</p>
      </section>
    </div>
  </main>;
}

function OnboardingView({ name, profession, setName, setProfession, onSkip, onFinish }: {
  name: string;
  profession: string;
  setName: (value: string) => void;
  setProfession: (value: string) => void;
  onSkip: () => void;
  onFinish: () => void;
}) {
  return <main className="uretir-id-onboarding">
    <div className="uretir-id-onboarding__topbar"><a href="/" className="uretir-id-wordmark">üretir<span>.</span><small>ID</small></a><button type="button" onClick={onSkip} className="uretir-id-skip">Şimdilik geç <ArrowUpRight size={14} /></button></div>
    <div className="uretir-id-onboarding__layout">
      <div className="uretir-id-onboarding__intro"><span className="eyebrow">Profilini kur / 01</span><h1>Uretir seni<br /><em>tanısın.</em></h1><p>Birkaç küçük dokunuşla sana daha iyi içerikler, araçlar ve bağlantılar önerebiliriz. Hepsi isteğe bağlı.</p><div className="uretir-id-progress"><span className="is-active" /><span /><span /></div><small>1 / 3 · Yaklaşık 20 saniye</small></div>
      <div className="uretir-id-formcard"><div className="uretir-id-formcard__header"><span className="uretir-id-step">01</span><div><h2>Önce seni tanıyalım.</h2><p>İstediğin zaman değiştirebilirsin.</p></div></div><div className="uretir-id-fields"><label>Adın veya görünen adın<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Örn. Selin Yılmaz" /></label><label>Ne üretiyorsun?<input value={profession} onChange={(event) => setProfession(event.target.value)} placeholder="Örn. Ürün tasarımı" /></label></div><div className="uretir-id-formcard__footer"><span><LockKeyhole size={14} /> Profilin senin kontrolünde</span><button type="button" className="uretir-id-primary" onClick={onFinish}>Profilimi oluştur <ArrowUpRight size={15} /></button></div></div>
    </div>
  </main>;
}

function DashboardView({ activeNav, followed, menuOpen, saved, setActiveNav, setFollowed, setMenuOpen, toggleSave, onSignOut }: {
  activeNav: string;
  followed: boolean;
  menuOpen: boolean;
  saved: number[];
  setActiveNav: (value: string) => void;
  setFollowed: (value: boolean) => void;
  setMenuOpen: (value: boolean) => void;
  toggleSave: (index: number) => void;
  onSignOut: () => void;
}) {
  const navItems = [
    { label: "Genel bakış", icon: Home },
    { label: "Takip ettiklerim", icon: Users },
    { label: "Kaydedilenler", icon: Bookmark },
    { label: "Koleksiyonlar", icon: FolderHeart },
  ];

  return <main className="uretir-id-dashboard">
    <header className="uretir-id-dashboard__topbar"><a href="/" className="uretir-id-wordmark">üretir<span>.</span><small>ID</small></a><div className="uretir-id-dashboard__search"><Search size={16} /><input aria-label="Uretir ID içinde ara" placeholder="Uretir’de ara" /><kbd>⌘ K</kbd></div><div className="uretir-id-dashboard__actions"><button type="button" className="uretir-id-icon-button" aria-label="Bildirimler"><Bell size={18} /><i /></button><button type="button" className="uretir-id-profile-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}><span>SY</span><ChevronRight size={14} className={menuOpen ? "rotate-90" : ""} /></button>{menuOpen && <div className="uretir-id-profile-menu"><strong>{memberProfile.name}</strong><span>{memberProfile.role}</span><button type="button" onClick={onSignOut}>Çıkış yap</button></div>}</div></header>
    <div className="uretir-id-dashboard__body"><aside className="uretir-id-sidebar"><div className="uretir-id-sidebar__member"><span className="uretir-id-avatar">SY</span><div><strong>{memberProfile.name}</strong><span>{memberProfile.role}</span></div><button type="button" aria-label="Ayarlar"><Settings2 size={15} /></button></div><nav>{navItems.map(({ label, icon: Icon }) => <button type="button" key={label} className={activeNav === label ? "is-active" : ""} onClick={() => setActiveNav(label)}><Icon size={16} /><span>{label}</span>{label === "Kaydedilenler" && saved.length > 0 && <b>{saved.length}</b>}</button>)}</nav><div className="uretir-id-sidebar__rule" /><p className="eyebrow">Takip ettiklerin</p><div className="uretir-id-topics">{followedTopics.map((topic) => <button type="button" key={topic} onClick={() => setActiveNav(topic)}><span />{topic}</button>)}</div><button type="button" className="uretir-id-sidebar__add"><Plus size={14} /> Konu ekle</button><div className="uretir-id-sidebar__bottom"><div><span className="uretir-id-score-ring">{memberProfile.score}</span><p><strong>Katkı skoru</strong><small>Top 8% içindesin</small></p></div><a href="/" aria-label="Yardım"><Globe2 size={15} /></a></div></aside>
      <section className="uretir-id-dashboard__content"><div className="uretir-id-content-heading"><div><span className="eyebrow">22 Temmuz 2026 · Çarşamba</span><h1>Günaydın, <em>Selin.</em></h1><p>Bugün üretmek için iyi bir gün. İşte senin için seçtiklerimiz.</p></div><button type="button" className="uretir-id-mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={18} /> Menü</button></div><div className="uretir-id-dashboard-grid"><div className="uretir-id-feed"><div className="uretir-id-section-label"><span>Senin akışın</span><button type="button">Tümünü gör <ArrowUpRight size={13} /></button></div>{feedItems.map((item, index) => <article className="uretir-id-feed-card" key={item.title}><div className={`uretir-id-feed-art tone-${item.tone}`}><span>{item.icon}</span><small>{item.tag}</small></div><div className="uretir-id-feed-copy"><div><span className="uretir-id-card-kicker">{item.type}</span><button type="button" onClick={() => toggleSave(index)} className={saved.includes(index) ? "is-saved" : ""} aria-label={saved.includes(index) ? "Kaydedildi" : "Kaydet"}><Bookmark size={16} fill={saved.includes(index) ? "currentColor" : "none"} /></button></div><h2>{item.title}</h2><p>{item.meta}</p><div className="uretir-id-card-actions"><button type="button"><Heart size={14} /> 24</button><button type="button"><Bookmark size={14} /> {saved.includes(index) ? "Kaydedildi" : "Kaydet"}</button></div></div></article>)}</div><aside className="uretir-id-rightrail"><div className="uretir-id-panel"><div className="uretir-id-panel__heading"><span className="eyebrow">Profil özeti</span><a href="/" aria-label="Profili görüntüle"><ArrowUpRight size={15} /></a></div><div className="uretir-id-profile-summary"><span className="uretir-id-avatar">SY</span><h2>{memberProfile.name}</h2><p>{memberProfile.role} · {memberProfile.company}</p><div className="uretir-id-stat-row"><span><strong>{memberProfile.followers}</strong> takipçi</span><span><strong>{memberProfile.following}</strong> takip</span><span><strong>{memberProfile.score}</strong> puan</span></div></div></div><div className="uretir-id-panel"><div className="uretir-id-panel__heading"><span className="eyebrow">Takip önerisi</span><span className="uretir-id-live-dot" /></div><div className="uretir-id-follow-suggestion"><span className="uretir-id-company-avatar">K</span><div><strong>Kale Robotics</strong><p>Otomasyon · İstanbul</p></div><button type="button" onClick={() => setFollowed(!followed)} className={followed ? "is-followed" : ""}>{followed ? <Check size={14} /> : <Plus size={15} />}</button></div><p className="uretir-id-panel-note">İlgi alanlarına göre önerildi</p></div><div className="uretir-id-panel"><div className="uretir-id-panel__heading"><span className="eyebrow">Rozet vitrini</span><a href="/" aria-label="Tüm rozetleri gör"><ArrowUpRight size={15} /></a></div><div className="uretir-id-badge-row">{badges.map((badge) => <div key={badge.name} title={badge.detail}><span>{badge.mark}</span><small>{badge.name}</small></div>)}</div></div></aside></div></section></div>
  </main>;
}

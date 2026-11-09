"use client";
import Link from "next/link";
import { ChevronDown, Menu, Search, X, ArrowUpRight, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useLanguage } from "./live-language-provider";
import { siteNavigation } from "@/lib/site-navigation";
import { analyticsAttributes } from "@/lib/analytics";

export function Header() {
  const pathname = usePathname(),
    ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { lang, setLang, isTranslating } = useLanguage();
  const english = lang === "en" || pathname.startsWith("/en");

  const close = () => {
    ref.current?.querySelectorAll("details[open]").forEach((d) => d.removeAttribute("open"));
    setOpen(false);
  };

  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        ref.current?.querySelectorAll("details[open]").forEach((d) => d.removeAttribute("open"));
        setOpen(false);
      }
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const expanded = ref.current?.querySelector("details[open]");
      if (expanded) {
        expanded.removeAttribute("open");
        expanded.querySelector("summary")?.focus();
      } else {
        setOpen(false);
        ref.current?.querySelector<HTMLButtonElement>(".nav-mobile-toggle")?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <>
      <header ref={ref} className="site-header sticky top-0 z-50">
        <div className="section-wrap nav-frame">
          <Link
            href="/"
            {...analyticsAttributes({ event: "navigation_select", surface: "header", target: english ? "en_home" : "home" })}
            className="nav-brand"
            aria-label={english ? "Uretir home" : "Üretir ana sayfa"}
            onClick={close}
          >
            <span className="font-display">
              üretir<span className="nav-dot">.</span>
            </span>
            <span className="nav-motto" data-no-translate="true">
              {english ? (
                <>
                  Ideas made in Türkiye.
                  <br />
                  Engineered for the world.
                </>
              ) : (
                <>
                  Türkiye üretir,
                  <br />
                  gençler yetişir.
                </>
              )}
            </span>
          </Link>

          <nav className={"nav-categories" + (open ? " is-open" : "")} aria-label="Ana navigasyon" id="site-navigation">
            {siteNavigation.map((group, index) => {
              const active =
                pathname === group.href || group.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
              return (
                <details
                  className={"nav-category" + (index === 2 ? " nav-wide" : "")}
                  key={group.href}
                  onToggle={(e) => {
                    if (e.currentTarget.open) {
                      const current = e.currentTarget;
                      ref.current?.querySelectorAll("details[open]").forEach((d) => {
                        if (d !== current) d.removeAttribute("open");
                      });
                    }
                  }}
                >
                  <summary className="nav-category-trigger" data-active={active}>
                    {group.label}
                    <ChevronDown size={13} aria-hidden="true" />
                  </summary>
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-intro">
                      <span>{group.label}</span>
                      <p>{group.description}</p>
                    </div>
                    <div className="nav-dropdown-links">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={close}
                          aria-current={pathname === item.href ? "page" : undefined}
                          {...analyticsAttributes({
                            event: "navigation_select",
                            surface: "header",
                            target: item.href.replace(/^\//, "").replaceAll("/", "_") || "home",
                          })}
                        >
                          {item.label}
                          <ArrowUpRight size={13} aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                    <Link
                      className="nav-category-all"
                      href={group.href}
                      onClick={close}
                      {...analyticsAttributes({
                        event: "navigation_select",
                        surface: "header",
                        target: group.href.replace(/^\//, "").replaceAll("/", "_") || "home",
                      })}
                    >
                      Tüm {group.label.toLocaleLowerCase("tr-TR")} <span>→</span>
                    </Link>
                  </div>
                </details>
              );
            })}
          </nav>

          <div className="nav-actions">
            <div
              role="group"
              aria-label="Dil seçimi / Language switcher"
              data-no-translate="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
                padding: "3px",
                borderRadius: "999px",
                border: "1px solid rgba(148, 163, 184, 0.28)",
                background: "rgba(15, 23, 42, 0.45)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Globe
                size={13}
                style={{
                  marginLeft: "6px",
                  marginRight: "2px",
                  color: isTranslating ? "#c8f560" : "#94a3b8",
                  transition: "color 0.2s ease",
                }}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setLang("tr")}
                aria-pressed={lang === "tr"}
                title="Türkçe (Orijinal)"
                style={{
                  padding: "3px 8px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  background: lang === "tr" ? "#c8f560" : "transparent",
                  color: lang === "tr" ? "#090d16" : "#cbd5e1",
                  transition: "all 0.18s ease",
                }}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                title="English (Simultaneous Live Translation)"
                style={{
                  padding: "3px 8px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  background: lang === "en" ? "#c8f560" : "transparent",
                  color: lang === "en" ? "#090d16" : "#cbd5e1",
                  transition: "all 0.18s ease",
                }}
              >
                EN
              </button>
            </div>

            <Link href="/ara" aria-label="Üretir içinde ara" className="header-search focus-ring" onClick={close}>
              <Search size={15} />
              <span className="nav-search-text">Ara</span>
            </Link>
            <ThemeToggle />
            <button
              className="nav-mobile-toggle focus-ring"
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              aria-controls="site-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <nav className="mobile-app-nav" aria-label={english ? "Quick navigation" : "Hızlı navigasyon"}>
        <Link href="/haber-ai" aria-current={pathname === "/haber-ai" ? "page" : undefined}>
          ◉<span>HaberAI</span>
        </Link>
        <Link href="/puan-ai" aria-current={pathname.startsWith("/puan-ai") ? "page" : undefined}>
          ✦<span>PuanAI</span>
        </Link>
        <Link href="/">
          ü<span>{english ? "Home" : "Ana sayfa"}</span>
        </Link>
        <Link href="/oyun-ai" aria-current={pathname.startsWith("/oyun-ai") ? "page" : undefined}>
          ◈<span>OyunAI</span>
        </Link>
        <Link
          href="/cozumler"
          {...analyticsAttributes({ event: "navigation_select", surface: "header", target: "mobile_solutions" })}
        >
          ◎<span>{english ? "Solutions" : "Çözümler"}</span>
        </Link>
      </nav>
    </>
  );
}

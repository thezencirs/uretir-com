"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsAttributes } from "@/lib/analytics";

export function ThemeToggle({ english = false }: { english?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = window.localStorage.getItem("uretir-theme"); } catch {}
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try { window.localStorage.setItem("uretir-theme", next ? "dark" : "light"); } catch {}
    setDark(next);
  }

  return <button onClick={toggle} aria-label={english ? (dark ? "Use light theme" : "Use dark theme") : (dark ? "Açık temaya geç" : "Koyu temaya geç")} aria-pressed={dark} className="focus-ring rounded-full p-2 text-muted transition hover:bg-black/5 dark:hover:bg-white/10" {...analyticsAttributes({ event: "theme_select", surface: "theme", target: dark ? "light" : "dark" })}>{dark ? <Sun size={17} strokeWidth={1.7} /> : <Moon size={17} strokeWidth={1.7} />}</button>;
}

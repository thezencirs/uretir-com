"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("uretir-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("uretir-theme", next ? "dark" : "light");
    setDark(next);
  }

  return <button onClick={toggle} aria-label={dark ? "Açık temaya geç" : "Koyu temaya geç"} aria-pressed={dark} className="focus-ring rounded-full p-2 text-muted transition hover:bg-black/5 dark:hover:bg-white/10">{dark ? <Sun size={17} strokeWidth={1.7} /> : <Moon size={17} strokeWidth={1.7} />}</button>;
}

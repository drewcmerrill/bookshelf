"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <main className="min-h-screen px-6 py-12 md:py-24">
      <div className="max-w-md mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Drew Merrill
          </h1>
          <p className="text-[var(--muted)] text-lg">
            Building things for the web
          </p>
        </header>

        <nav className="mb-12">
          <ul className="space-y-3 text-lg">
            <li>
              <Link href="/bookshelf">Bookshelf</Link>
            </li>
            <li>
              <Link href="/krypto">Krypto</Link>
            </li>
            <li>
              <Link href="/jeopardy">Jeopardy</Link>
            </li>
            <li>
              <Link href="/sourdough">Sourdough Log</Link>
            </li>
          </ul>
        </nav>

        <footer className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>v. I</span>
          <button
            onClick={toggleTheme}
            className="hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            {isDark ? "light" : "dark"} mode
          </button>
        </footer>
      </div>
    </main>
  );
}

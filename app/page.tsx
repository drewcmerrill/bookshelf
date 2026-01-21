"use client";

import Link from "next/link";
import { IM_Fell_Great_Primer_SC } from "next/font/google";

const FellGreatPrimer = IM_Fell_Great_Primer_SC({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main
      className={`${FellGreatPrimer.className} min-h-screen px-6 py-12 md:py-24 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: "url('/paper-texture.jpg')" }}
    >
      <div className="max-w-md mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-2">
            Drew Merrill
          </h1>
        </header>

        <nav className="mb-12">
          <ul className="space-y-2 text-2xl md:text-2xl">
            {[
              { href: "/bookshelf", label: "Bookshelf", numeral: "I." },
              { href: "/sourdough", label: "Sourdough Log", numeral: "II." },
              { href: "/jeopardy", label: "Jeopardy", numeral: "III." },
              // { href: "/krypto", label: "Krypto", numeral: "IV." },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-2 group mx-7 md:mx-0 hover:scale-125 transition-transform"
                >
                  <span>{item.label}</span>
                  <span className="flex-1 border-b border-dotted border-current opacity-30 mx-2 group-hover:opacity-50 transition-opacity" />
                  <span>{item.numeral}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="text-lg text-[var(--muted)] text-center">
          <span>v. I</span>
        </footer>
      </div>
    </main>
  );
}

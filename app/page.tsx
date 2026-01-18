import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            Drew Merrill
          </h1>
          <p className="text-slate-400 text-lg">Projects & Things</p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <Link
            href="/bookshelf"
            className="group flex items-center gap-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-7 h-7 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">
                Bookshelf
              </h2>
              <p className="text-slate-400 text-sm">
                My book collection and reading list
              </p>
            </div>
            <svg
              className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          <Link
            href="/krypto"
            className="group flex items-center gap-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-7 h-7 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                Krypto
              </h2>
              <p className="text-slate-400 text-sm">Math puzzle game</p>
            </div>
            <svg
              className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          <Link
            href="/jeopardy"
            className="group flex items-center gap-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-7 h-7 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                Jeopardy
              </h2>
              <p className="text-slate-400 text-sm">Random trivia clues</p>
            </div>
            <svg
              className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

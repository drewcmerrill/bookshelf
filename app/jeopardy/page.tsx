"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type JeopardyClue = {
  question: string;
  answer: string;
  category: string;
};

export default function JeopardyPage() {
  const [clue, setClue] = useState<JeopardyClue | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClue = async () => {
    setLoading(true);
    setShowAnswer(false);
    setError("");

    try {
      const res = await fetch("/api/jeopardy");
      if (!res.ok) throw new Error("Failed to fetch clue");
      const data = await res.json();
      setClue(data);
    } catch {
      setError("Failed to load clue. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClue();
  }, []);

  return (
    <div className="min-h-screen bg-[#060ce9] flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: "serif" }}>
          JEOPARDY!
        </h1>
        <div className="w-16" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {loading ? (
            <div className="bg-[#060ce9] border-4 border-black shadow-2xl rounded-lg p-8">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          ) : error ? (
            <div className="bg-[#060ce9] border-4 border-black shadow-2xl rounded-lg p-8 text-center">
              <p className="text-white text-xl mb-4">{error}</p>
              <button
                onClick={fetchClue}
                className="bg-yellow-400 text-[#060ce9] font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : clue ? (
            <div className="space-y-6">
              {/* Category */}
              <div className="text-center">
                <span className="bg-yellow-400 text-[#060ce9] font-bold px-4 py-2 rounded-full text-sm uppercase tracking-wider">
                  {clue.category}
                </span>
              </div>

              {/* Clue Card */}
              <div className="bg-[#060ce9] border-4 border-yellow-400 shadow-2xl rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                <p
                  className="text-white text-xl sm:text-2xl text-center leading-relaxed uppercase"
                  style={{ fontFamily: "serif", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
                >
                  {clue.question}
                </p>
              </div>

              {/* Answer Section */}
              {showAnswer ? (
                <div className="bg-yellow-400 rounded-lg p-6 text-center">
                  <p className="text-sm text-[#060ce9] font-bold uppercase tracking-wider mb-2">
                    Answer
                  </p>
                  <p
                    className="text-[#060ce9] text-2xl font-bold"
                    style={{ fontFamily: "serif" }}
                  >
                    What is {clue.answer}?
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full bg-yellow-400 text-[#060ce9] font-bold py-4 rounded-lg hover:bg-yellow-300 transition-colors text-lg uppercase tracking-wider"
                >
                  Reveal Answer
                </button>
              )}

              {/* New Clue Button */}
              <button
                onClick={fetchClue}
                className="w-full bg-white/10 border-2 border-white/30 text-white font-bold py-4 rounded-lg hover:bg-white/20 transition-colors text-lg uppercase tracking-wider"
              >
                New Clue
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

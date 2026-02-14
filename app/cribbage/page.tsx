"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tangerine } from "next/font/google";

const tangerine = Tangerine({
  subsets: ["latin"],
  weight: "700",
});

type CribbageGame = {
  id: number;
  date: string;
  drewScore: number;
  aliScore: number;
  coffeeShop: string;
  coffeeBuyer: string;
  drewCoffeeRating: number | null;
  aliCoffeeRating: number | null;
  notes: string | null;
};

type Stats = {
  drewWins: number;
  aliWins: number;
  totalGames: number;
  drewWinPercentage: number;
  aliWinPercentage: number;
  currentStreak: { player: string; count: number };
  favoriteShop: string | null;
  avgDrewRating: number | null;
  avgAliRating: number | null;
};

export default function CribbagePage() {
  const [games, setGames] = useState<CribbageGame[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch("/api/cribbage");
        const data = await res.json();
        setGames(data.games || []);
        setStats(data.stats || null);
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fixed repeating background layer */}
      <div
        className="fixed inset-0 bg-repeat -z-10"
        style={{ backgroundImage: "url('/paper-texture.jpg')" }}
      />

      {/* Header */}
      <header
        className={`${tangerine.className} bg-white border-b border-slate-200 px-8 py-8 flex justify-between items-center`}
      >
        <Link
          href="/"
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 text-2xl"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-5xl text-slate-900 absolute left-1/2 -translate-x-1/2">
          Cribbage
        </h1>
        <Link
          href="/admin/cribbage"
          className="text-slate-400 hover:text-slate-600 transition-colors text-2xl"
        >
          Edit
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* Stats Section */}
        {stats && stats.totalGames > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div>
                <div className="text-3xl font-bold text-slate-900">
                  {stats.drewWins}
                </div>
                <div className="text-slate-500 text-sm">
                  Drew Wins ({stats.drewWinPercentage}%)
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">
                  {stats.aliWins}
                </div>
                <div className="text-slate-500 text-sm">
                  Ali Wins ({stats.aliWinPercentage}%)
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
              {stats.currentStreak.count > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Streak</span>
                  <span className="text-slate-900">
                    {stats.currentStreak.player === "drew" ? "Drew" : "Ali"} -{" "}
                    {stats.currentStreak.count} game
                    {stats.currentStreak.count !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {stats.favoriteShop && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Favorite Shop</span>
                  <span className="text-slate-900">{stats.favoriteShop}</span>
                </div>
              )}
              {(stats.avgDrewRating || stats.avgAliRating) && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Coffee Rating</span>
                  <span className="text-slate-900">
                    Drew: {stats.avgDrewRating ?? "-"} / Ali:{" "}
                    {stats.avgAliRating ?? "-"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Games List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              {/* Playing cards animation */}
              <svg width="64" height="48" viewBox="0 0 64 48">
                <rect
                  x="8"
                  y="4"
                  width="24"
                  height="36"
                  rx="2"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                <rect
                  x="20"
                  y="8"
                  width="24"
                  height="36"
                  rx="2"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  className="animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <rect
                  x="32"
                  y="4"
                  width="24"
                  height="36"
                  rx="2"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  className="animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </svg>
            </div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No games recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => {
              const drewWon = game.drewScore > game.aliScore;
              const winner = drewWon ? "Drew" : "Ali";

              return (
                <div
                  key={game.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-slate-900 font-medium">
                        {new Date(game.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC",
                        })}
                      </div>
                      <div className="text-slate-500 text-sm">
                        {game.coffeeShop}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center my-3">
                    <div
                      className={`p-2 rounded ${drewWon ? "bg-green-50 border border-green-200" : "bg-slate-50"}`}
                    >
                      <div className="text-2xl font-bold text-slate-900">
                        {game.drewScore}
                      </div>
                      <div className="text-slate-500 text-sm">Drew</div>
                    </div>
                    <div
                      className={`p-2 rounded ${!drewWon ? "bg-green-50 border border-green-200" : "bg-slate-50"}`}
                    >
                      <div className="text-2xl font-bold text-slate-900">
                        {game.aliScore}
                      </div>
                      <div className="text-slate-500 text-sm">Ali</div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-500 space-y-1">
                    <div>
                      <span className="font-medium text-slate-700">
                        {winner}
                      </span>{" "}
                      wins!
                    </div>
                    <div>
                      Coffee by:{" "}
                      <span className="text-slate-700">
                        {game.coffeeBuyer === "drew" ? "Drew" : "Ali"}
                      </span>
                    </div>
                    {(game.drewCoffeeRating || game.aliCoffeeRating) && (
                      <div>
                        Ratings: Drew {game.drewCoffeeRating ?? "-"}/10, Ali{" "}
                        {game.aliCoffeeRating ?? "-"}/10
                      </div>
                    )}
                    {game.notes && (
                      <div className="text-slate-600 italic mt-2">
                        {game.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

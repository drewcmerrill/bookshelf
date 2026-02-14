"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CribbageGame = {
  id: number;
  date: string;
  drewScore: number | null;
  aliScore: number | null;
  coffeeShop: string | null;
  coffeeBuyer: string | null;
  drewCoffeeRating: number | null;
  aliCoffeeRating: number | null;
  drewAmbianceRating: number | null;
  aliAmbianceRating: number | null;
  firstCrib: string | null;
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

export default function AdminCribbagePage() {
  const [games, setGames] = useState<CribbageGame[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<CribbageGame | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    drewScore: "",
    aliScore: "",
    coffeeShop: "",
    coffeeBuyer: "drew",
    firstCrib: "drew",
    drewCoffeeRating: "",
    aliCoffeeRating: "",
    drewAmbianceRating: "",
    aliAmbianceRating: "",
    notes: "",
  });

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

  useEffect(() => {
    fetchGames();
  }, []);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      drewScore: "",
      aliScore: "",
      coffeeShop: "",
      coffeeBuyer: "drew",
      firstCrib: "drew",
      drewCoffeeRating: "",
      aliCoffeeRating: "",
      drewAmbianceRating: "",
      aliAmbianceRating: "",
      notes: "",
    });
    setEditingGame(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingGame
        ? `/api/cribbage/${editingGame.id}`
        : "/api/cribbage";
      const method = editingGame ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          drewCoffeeRating: formData.drewCoffeeRating || null,
          aliCoffeeRating: formData.aliCoffeeRating || null,
          drewAmbianceRating: formData.drewAmbianceRating || null,
          aliAmbianceRating: formData.aliAmbianceRating || null,
          firstCrib: formData.firstCrib || null,
          notes: formData.notes || null,
        }),
      });

      if (res.ok) {
        await fetchGames();
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to save game:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (game: CribbageGame) => {
    setFormData({
      date: new Date(game.date).toISOString().split("T")[0],
      drewScore: game.drewScore?.toString() || "",
      aliScore: game.aliScore?.toString() || "",
      coffeeShop: game.coffeeShop || "",
      coffeeBuyer: game.coffeeBuyer || "drew",
      firstCrib: game.firstCrib || "drew",
      drewCoffeeRating: game.drewCoffeeRating?.toString() || "",
      aliCoffeeRating: game.aliCoffeeRating?.toString() || "",
      drewAmbianceRating: game.drewAmbianceRating?.toString() || "",
      aliAmbianceRating: game.aliAmbianceRating?.toString() || "",
      notes: game.notes || "",
    });
    setEditingGame(game);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this game?")) return;

    try {
      const res = await fetch(`/api/cribbage/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchGames();
      }
    } catch (error) {
      console.error("Failed to delete game:", error);
    }
  };

  const renderFormFields = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 text-sm mb-1">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Coffee Shop
          </label>
          <input
            type="text"
            value={formData.coffeeShop}
            onChange={(e) =>
              setFormData({ ...formData, coffeeShop: e.target.value })
            }
            placeholder="e.g., Starbucks"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Drew&apos;s Score
          </label>
          <input
            type="number"
            value={formData.drewScore}
            onChange={(e) =>
              setFormData({ ...formData, drewScore: e.target.value })
            }
            min="0"
            max="121"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Ali&apos;s Score
          </label>
          <input
            type="number"
            value={formData.aliScore}
            onChange={(e) =>
              setFormData({ ...formData, aliScore: e.target.value })
            }
            min="0"
            max="121"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-600 text-sm mb-1">
          Who Bought Coffee?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="coffeeBuyer"
              value="drew"
              checked={formData.coffeeBuyer === "drew"}
              onChange={(e) =>
                setFormData({ ...formData, coffeeBuyer: e.target.value })
              }
              className="text-gray-900 focus:ring-gray-900"
            />
            <span className="text-sm text-gray-700">Drew</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="coffeeBuyer"
              value="ali"
              checked={formData.coffeeBuyer === "ali"}
              onChange={(e) =>
                setFormData({ ...formData, coffeeBuyer: e.target.value })
              }
              className="text-gray-900 focus:ring-gray-900"
            />
            <span className="text-sm text-gray-700">Ali</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-gray-600 text-sm mb-1">
          Who Had First Crib?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="firstCrib"
              value="drew"
              checked={formData.firstCrib === "drew"}
              onChange={(e) =>
                setFormData({ ...formData, firstCrib: e.target.value })
              }
              className="text-gray-900 focus:ring-gray-900"
            />
            <span className="text-sm text-gray-700">Drew</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="firstCrib"
              value="ali"
              checked={formData.firstCrib === "ali"}
              onChange={(e) =>
                setFormData({ ...formData, firstCrib: e.target.value })
              }
              className="text-gray-900 focus:ring-gray-900"
            />
            <span className="text-sm text-gray-700">Ali</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Drew&apos;s Coffee Rating (1-10)
          </label>
          <input
            type="number"
            value={formData.drewCoffeeRating}
            onChange={(e) =>
              setFormData({
                ...formData,
                drewCoffeeRating: e.target.value,
              })
            }
            min="1"
            max="10"
            step="0.1"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Ali&apos;s Coffee Rating (1-10)
          </label>
          <input
            type="number"
            value={formData.aliCoffeeRating}
            onChange={(e) =>
              setFormData({
                ...formData,
                aliCoffeeRating: e.target.value,
              })
            }
            min="1"
            max="10"
            step="0.1"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Drew&apos;s Ambiance Rating (1-10)
          </label>
          <input
            type="number"
            value={formData.drewAmbianceRating}
            onChange={(e) =>
              setFormData({
                ...formData,
                drewAmbianceRating: e.target.value,
              })
            }
            min="1"
            max="10"
            step="0.1"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Ali&apos;s Ambiance Rating (1-10)
          </label>
          <input
            type="number"
            value={formData.aliAmbianceRating}
            onChange={(e) =>
              setFormData({
                ...formData,
                aliAmbianceRating: e.target.value,
              })
            }
            min="1"
            max="10"
            step="0.1"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-600 text-sm mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
          placeholder="Any notable moments?"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-medium transition-colors"
        >
          {submitting
            ? "Saving..."
            : editingGame
              ? "Update Game"
              : "Add Game"}
        </button>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(false);
          }}
          className="px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          Cancel
        </button>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Cribbage
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Track cribbage games between Drew and Ali
          </p>
        </div>
        <Link
          href="/cribbage"
          className="text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View Public Page
        </Link>
      </div>

      {/* Stats Summary */}
      {stats && stats.totalGames > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.drewWins}
              </div>
              <div className="text-gray-500 text-sm">
                Drew ({stats.drewWinPercentage}%)
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.aliWins}
              </div>
              <div className="text-gray-500 text-sm">
                Ali ({stats.aliWinPercentage}%)
              </div>
            </div>
            {stats.currentStreak.count > 0 && (
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.currentStreak.count}
                </div>
                <div className="text-gray-500 text-sm">
                  {stats.currentStreak.player === "drew" ? "Drew" : "Ali"} Streak
                </div>
              </div>
            )}
            {stats.favoriteShop && (
              <div>
                <div className="text-lg font-bold text-gray-900 truncate">
                  {stats.favoriteShop}
                </div>
                <div className="text-gray-500 text-sm">Favorite Shop</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Game Button */}
      <button
        onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}
        className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        {showForm && !editingGame ? "Cancel" : "Add Game"}
      </button>

      {/* Add New Game Form (only for new games, not edits) */}
      {showForm && !editingGame && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
        >
          <h2 className="font-semibold text-gray-900">New Game</h2>
          {renderFormFields()}
        </form>
      )}

      {/* Games List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : games.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No games recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => {
            const isEditing = editingGame?.id === game.id;

            if (isEditing) {
              return (
                <form
                  key={game.id}
                  onSubmit={handleSubmit}
                  className="bg-white border-2 border-blue-300 rounded-xl p-5 shadow-sm space-y-4"
                >
                  <h2 className="font-semibold text-gray-900">Edit Game</h2>
                  {renderFormFields()}
                </form>
              );
            }

            const drewWon = (game.drewScore ?? 0) > (game.aliScore ?? 0);
            const winner = drewWon ? "Drew" : "Ali";

            return (
              <div
                key={game.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-gray-900 font-semibold">
                      {new Date(game.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {game.coffeeShop}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(game)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      title="Edit"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      title="Delete"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center my-3">
                  <div
                    className={`p-3 rounded-lg ${drewWon ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}
                  >
                    <div className="text-2xl font-bold text-gray-900">
                      {game.drewScore}
                    </div>
                    <div className="text-gray-500 text-sm">Drew</div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${!drewWon ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}
                  >
                    <div className="text-2xl font-bold text-gray-900">
                      {game.aliScore}
                    </div>
                    <div className="text-gray-500 text-sm">Ali</div>
                  </div>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <div>
                    <span className="font-medium text-gray-700">{winner}</span>{" "}
                    wins!
                  </div>
                  <div>
                    Coffee by:{" "}
                    <span className="text-gray-700">
                      {game.coffeeBuyer === "drew" ? "Drew" : "Ali"}
                    </span>
                  </div>
                  {game.firstCrib && (
                    <div>
                      First crib:{" "}
                      <span className="text-gray-700">
                        {game.firstCrib === "drew" ? "Drew" : "Ali"}
                      </span>
                    </div>
                  )}
                  {(game.drewCoffeeRating || game.aliCoffeeRating) && (
                    <div>
                      Coffee: Drew {game.drewCoffeeRating ?? "-"}/10, Ali{" "}
                      {game.aliCoffeeRating ?? "-"}/10
                    </div>
                  )}
                  {(game.drewAmbianceRating || game.aliAmbianceRating) && (
                    <div>
                      Ambiance: Drew {game.drewAmbianceRating ?? "-"}/10, Ali{" "}
                      {game.aliAmbianceRating ?? "-"}/10
                    </div>
                  )}
                  {game.notes && (
                    <div className="text-gray-600 italic mt-2">{game.notes}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SourdoughLoaf = {
  id: number;
  date: string;
  initialMixTime: string;
  flourGrams: number;
  flourType: string;
  waterGrams: number;
  starterGrams: number;
  stretchFolds: string[];
  notes: string | null;
};

export default function SourdoughPage() {
  const [loaves, setLoaves] = useState<SourdoughLoaf[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [initialMixTime, setInitialMixTime] = useState("");
  const [flourGrams, setFlourGrams] = useState("");
  const [flourType, setFlourType] = useState("");
  const [waterGrams, setWaterGrams] = useState("");
  const [starterGrams, setStarterGrams] = useState("");
  const [stretchFolds, setStretchFolds] = useState<string[]>([]);
  const [newFoldTime, setNewFoldTime] = useState("");
  const [notes, setNotes] = useState("");

  const fetchLoaves = async () => {
    try {
      const res = await fetch("/api/sourdough");
      const data = await res.json();
      setLoaves(data.loaves);
    } catch (error) {
      console.error("Failed to fetch loaves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoaves();
  }, []);

  const addStretchFold = () => {
    if (newFoldTime) {
      setStretchFolds([...stretchFolds, newFoldTime]);
      setNewFoldTime("");
    }
  };

  const removeStretchFold = (index: number) => {
    setStretchFolds(stretchFolds.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setInitialMixTime("");
    setFlourGrams("");
    setFlourType("");
    setWaterGrams("");
    setStarterGrams("");
    setStretchFolds([]);
    setNewFoldTime("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/sourdough", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          initialMixTime,
          flourGrams: parseInt(flourGrams),
          flourType,
          waterGrams: parseInt(waterGrams),
          starterGrams: parseInt(starterGrams),
          stretchFolds,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        resetForm();
        setShowForm(false);
        fetchLoaves();
      }
    } catch (error) {
      console.error("Failed to save loaf:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteLoaf = async (id: number) => {
    if (!confirm("Delete this loaf record?")) return;

    try {
      await fetch(`/api/sourdough/${id}`, { method: "DELETE" });
      fetchLoaves();
    } catch (error) {
      console.error("Failed to delete loaf:", error);
    }
  };

  const calculateHydration = (water: number, flour: number) => {
    if (!flour) return 0;
    return Math.round((water / flour) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
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
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Sourdough Tracker
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-white/70 hover:text-white transition-colors"
        >
          {showForm ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
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
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* New Loaf Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 space-y-4"
          >
            <h2 className="text-xl font-semibold text-white mb-4">New Loaf</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Initial Mix Time
                </label>
                <input
                  type="time"
                  value={initialMixTime}
                  onChange={(e) => setInitialMixTime(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Flour (g)
                </label>
                <input
                  type="number"
                  value={flourGrams}
                  onChange={(e) => setFlourGrams(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Flour Type
                </label>
                <input
                  type="text"
                  value={flourType}
                  onChange={(e) => setFlourType(e.target.value)}
                  placeholder="e.g., Bread flour"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Water (g)
                </label>
                <input
                  type="number"
                  value={waterGrams}
                  onChange={(e) => setWaterGrams(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">
                  Starter (g)
                </label>
                <input
                  type="number"
                  value={starterGrams}
                  onChange={(e) => setStarterGrams(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
            </div>

            {flourGrams && waterGrams && (
              <div className="text-amber-300 text-sm">
                Hydration: {calculateHydration(parseInt(waterGrams), parseInt(flourGrams))}%
              </div>
            )}

            {/* Stretch and Folds */}
            <div>
              <label className="block text-white/70 text-sm mb-1">
                Stretch & Folds
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="time"
                  value={newFoldTime}
                  onChange={(e) => setNewFoldTime(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={addStretchFold}
                  className="bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              {stretchFolds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {stretchFolds.map((time, index) => (
                    <span
                      key={index}
                      className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {time}
                      <button
                        type="button"
                        onClick={() => removeStretchFold(index)}
                        className="text-white/60 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40"
                placeholder="How did it turn out?"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Loaf"}
            </button>
          </form>
        )}

        {/* Loaf History */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : loaves.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍞</div>
            <p className="text-white/60">No loaves recorded yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-amber-400 hover:text-amber-300"
            >
              Record your first loaf
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {loaves.map((loaf) => (
              <div
                key={loaf.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-white font-semibold">
                      {new Date(loaf.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-white/60 text-sm">
                      Mixed at {loaf.initialMixTime}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLoaf(loaf.id)}
                    className="text-white/40 hover:text-red-400 transition-colors"
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

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                  <div>
                    <span className="text-white/50">Flour:</span>{" "}
                    <span className="text-white">
                      {loaf.flourGrams}g {loaf.flourType}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Water:</span>{" "}
                    <span className="text-white">{loaf.waterGrams}g</span>
                  </div>
                  <div>
                    <span className="text-white/50">Starter:</span>{" "}
                    <span className="text-white">{loaf.starterGrams}g</span>
                  </div>
                  <div>
                    <span className="text-white/50">Hydration:</span>{" "}
                    <span className="text-amber-300">
                      {calculateHydration(loaf.waterGrams, loaf.flourGrams)}%
                    </span>
                  </div>
                </div>

                {loaf.stretchFolds.length > 0 && (
                  <div className="mb-3">
                    <span className="text-white/50 text-sm">
                      Stretch & Folds ({loaf.stretchFolds.length}):
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {loaf.stretchFolds.map((time, i) => (
                        <span
                          key={i}
                          className="bg-white/10 text-white/80 px-2 py-0.5 rounded text-xs"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {loaf.notes && (
                  <div className="text-white/70 text-sm border-t border-white/10 pt-3 mt-3">
                    {loaf.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

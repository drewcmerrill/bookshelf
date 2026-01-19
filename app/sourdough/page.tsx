"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SourdoughLoaf = {
  id: number;
  date: string;
  initialMixTime: string;
  flourGrams: number | null;
  flourType: string | null;
  waterGrams: number | null;
  starterGrams: number | null;
  stretchFolds: string[] | null;
  notes: string | null;
};

export default function SourdoughPage() {
  const [loaves, setLoaves] = useState<SourdoughLoaf[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchLoaves = async () => {
    try {
      const res = await fetch("/api/sourdough");
      const data = await res.json();
      setLoaves(data.loaves || []);
    } catch (error) {
      console.error("Failed to fetch loaves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoaves();
  }, []);

  const startNewLoaf = async () => {
    setSaving(true);
    try {
      const now = new Date();
      const time = now.toTimeString().slice(0, 5);

      const res = await fetch("/api/sourdough", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: now.toISOString(),
          initialMixTime: time,
          flourGrams: 0,
          flourType: "",
          waterGrams: 0,
          starterGrams: 0,
          stretchFolds: [],
        }),
      });

      if (res.ok) {
        fetchLoaves();
      }
    } catch (error) {
      console.error("Failed to start loaf:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateLoaf = async (id: number, updates: Partial<SourdoughLoaf>) => {
    try {
      await fetch(`/api/sourdough/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      fetchLoaves();
    } catch (error) {
      console.error("Failed to update loaf:", error);
    }
  };

  const addStretchFold = async (loaf: SourdoughLoaf) => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const folds = [...(loaf.stretchFolds || []), time];
    await updateLoaf(loaf.id, { stretchFolds: folds });
  };

  const removeStretchFold = async (loaf: SourdoughLoaf, index: number) => {
    const folds = (loaf.stretchFolds || []).filter((_, i) => i !== index);
    await updateLoaf(loaf.id, { stretchFolds: folds });
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

  const calculateHydration = (water: number | null, flour: number | null) => {
    if (!flour || !water) return null;
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sourdough</h1>
        <div className="w-16" />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* Start New Loaf Button */}
        <button
          onClick={startNewLoaf}
          disabled={saving}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-white font-semibold py-3 rounded-xl mb-6 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start New Loaf
        </button>

        {/* Loaves */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : loaves.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍞</div>
            <p className="text-white/60">No loaves recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loaves.map((loaf) => (
              <LoafCard
                key={loaf.id}
                loaf={loaf}
                onUpdate={(updates) => updateLoaf(loaf.id, updates)}
                onAddFold={() => addStretchFold(loaf)}
                onRemoveFold={(index) => removeStretchFold(loaf, index)}
                onDelete={() => deleteLoaf(loaf.id)}
                calculateHydration={calculateHydration}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function LoafCard({
  loaf,
  onUpdate,
  onAddFold,
  onRemoveFold,
  onDelete,
  calculateHydration,
}: {
  loaf: SourdoughLoaf;
  onUpdate: (updates: Partial<SourdoughLoaf>) => void;
  onAddFold: () => void;
  onRemoveFold: (index: number) => void;
  onDelete: () => void;
  calculateHydration: (water: number | null, flour: number | null) => number | null;
}) {
  const hydration = calculateHydration(loaf.waterGrams, loaf.flourGrams);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4">
      {/* Header Row */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-white font-semibold">
            {new Date(loaf.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-white/60 text-sm">
            Started at {loaf.initialMixTime}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-white/40 hover:text-red-400 transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Ingredient Rows */}
      <div className="space-y-2">
        <IngredientRow
          label="Flour"
          value={loaf.flourGrams}
          unit="g"
          secondaryValue={loaf.flourType}
          secondaryPlaceholder="Type"
          onValueChange={(v) => onUpdate({ flourGrams: v })}
          onSecondaryChange={(v) => onUpdate({ flourType: v })}
        />
        <IngredientRow
          label="Water"
          value={loaf.waterGrams}
          unit="g"
          onValueChange={(v) => onUpdate({ waterGrams: v })}
        />
        <IngredientRow
          label="Starter"
          value={loaf.starterGrams}
          unit="g"
          onValueChange={(v) => onUpdate({ starterGrams: v })}
        />
      </div>

      {/* Hydration */}
      {hydration && (
        <div className="text-amber-300 text-sm">
          Hydration: {hydration}%
        </div>
      )}

      {/* Stretch & Folds */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm">Stretch & Folds</span>
          <button
            onClick={onAddFold}
            className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
        {loaf.stretchFolds && loaf.stretchFolds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {loaf.stretchFolds.map((time, index) => (
              <span
                key={index}
                className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {time}
                <button
                  onClick={() => onRemoveFold(index)}
                  className="text-white/60 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-white/40 text-sm">None yet</div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-white/70 text-sm block mb-1">Notes</label>
        <textarea
          value={loaf.notes || ""}
          onChange={(e) => onUpdate({ notes: e.target.value || null })}
          onBlur={(e) => onUpdate({ notes: e.target.value || null })}
          rows={2}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 resize-none"
          placeholder="How did it turn out?"
        />
      </div>
    </div>
  );
}

function IngredientRow({
  label,
  value,
  unit,
  secondaryValue,
  secondaryPlaceholder,
  onValueChange,
  onSecondaryChange,
}: {
  label: string;
  value: number | null;
  unit: string;
  secondaryValue?: string | null;
  secondaryPlaceholder?: string;
  onValueChange: (v: number) => void;
  onSecondaryChange?: (v: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value?.toString() || "");
  const [localSecondary, setLocalSecondary] = useState(secondaryValue || "");

  useEffect(() => {
    setLocalValue(value?.toString() || "");
  }, [value]);

  useEffect(() => {
    setLocalSecondary(secondaryValue || "");
  }, [secondaryValue]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-white/70 text-sm w-16">{label}</span>
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onValueChange(parseInt(localValue) || 0)}
        className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm text-right"
        placeholder="0"
      />
      <span className="text-white/50 text-sm">{unit}</span>
      {onSecondaryChange && (
        <input
          type="text"
          value={localSecondary}
          onChange={(e) => setLocalSecondary(e.target.value)}
          onBlur={() => onSecondaryChange(localSecondary)}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
          placeholder={secondaryPlaceholder}
        />
      )}
    </div>
  );
}

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
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      setIsAdmin(data.authenticated);
    } catch {
      setIsAdmin(false);
    }
  };

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
    checkAuth();
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">Sourdough Log</h1>
        <div className="w-16" />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* Start New Loaf Button - Admin only */}
        {isAdmin && (
          <button
            onClick={startNewLoaf}
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-3 rounded-lg mb-6 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Start New Loaf
          </button>
        )}

        {/* Loaves */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : loaves.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No loaves recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loaves.map((loaf) => (
              <LoafCard
                key={loaf.id}
                loaf={loaf}
                isAdmin={isAdmin}
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
  isAdmin,
  onUpdate,
  onAddFold,
  onRemoveFold,
  onDelete,
  calculateHydration,
}: {
  loaf: SourdoughLoaf;
  isAdmin: boolean;
  onUpdate: (updates: Partial<SourdoughLoaf>) => void;
  onAddFold: () => void;
  onRemoveFold: (index: number) => void;
  onDelete: () => void;
  calculateHydration: (water: number | null, flour: number | null) => number | null;
}) {
  const hydration = calculateHydration(loaf.waterGrams, loaf.flourGrams);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
      {/* Header Row */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-slate-900 font-medium">
            {new Date(loaf.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-slate-500 text-sm">
            Started at {loaf.initialMixTime}
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={onDelete}
            className="text-slate-300 hover:text-red-500 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Ingredient Rows */}
      {isAdmin ? (
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
      ) : (
        <div className="space-y-1 text-sm">
          <div className="flex gap-4">
            <span className="text-slate-500">Flour:</span>
            <span className="text-slate-900">{loaf.flourGrams || 0}g {loaf.flourType || ""}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-500">Water:</span>
            <span className="text-slate-900">{loaf.waterGrams || 0}g</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-500">Starter:</span>
            <span className="text-slate-900">{loaf.starterGrams || 0}g</span>
          </div>
        </div>
      )}

      {/* Hydration */}
      {hydration !== null && hydration > 0 && (
        <div className="text-slate-600 text-sm font-medium">
          Hydration: {hydration}%
        </div>
      )}

      {/* Stretch & Folds */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-600 text-sm">Stretch & Folds</span>
          {isAdmin && (
            <button
              onClick={onAddFold}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-3 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          )}
        </div>
        {loaf.stretchFolds && loaf.stretchFolds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {loaf.stretchFolds.map((time, index) => (
              <span
                key={index}
                className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm flex items-center gap-2"
              >
                {time}
                {isAdmin && (
                  <button
                    onClick={() => onRemoveFold(index)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-slate-400 text-sm">None</div>
        )}
      </div>

      {/* Notes */}
      {isAdmin ? (
        <div>
          <label className="text-slate-600 text-sm block mb-1">Notes</label>
          <textarea
            value={loaf.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value || null })}
            onBlur={(e) => onUpdate({ notes: e.target.value || null })}
            rows={2}
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 text-sm placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
            placeholder="How did it turn out?"
          />
        </div>
      ) : loaf.notes ? (
        <div>
          <span className="text-slate-500 text-sm">Notes:</span>
          <p className="text-slate-700 text-sm mt-1">{loaf.notes}</p>
        </div>
      ) : null}
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
      <span className="text-slate-600 text-sm w-16">{label}</span>
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onValueChange(parseInt(localValue) || 0)}
        className="w-20 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-900 text-sm text-right focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
        placeholder="0"
      />
      <span className="text-slate-400 text-sm">{unit}</span>
      {onSecondaryChange && (
        <input
          type="text"
          value={localSecondary}
          onChange={(e) => setLocalSecondary(e.target.value)}
          onBlur={() => onSecondaryChange(localSecondary)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
          placeholder={secondaryPlaceholder}
        />
      )}
    </div>
  );
}

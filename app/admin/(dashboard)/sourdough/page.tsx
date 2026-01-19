"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type BakeEvent = {
  time: string;
  temp: number;
};

type SourdoughLoaf = {
  id: number;
  date: string;
  initialMixTime: string;
  flourGrams: number | null;
  flourType: string | null;
  waterGrams: number | null;
  starterGrams: number | null;
  stretchFolds: string[] | null;
  firstProofTime: string | null;
  secondProofTime: string | null;
  bakeEvents: BakeEvent[] | null;
  notes: string | null;
};

export default function AdminSourdoughPage() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Sourdough Log
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Track your sourdough bakes
          </p>
        </div>
        <Link
          href="/sourdough"
          className="text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Public Page
        </Link>
      </div>

      {/* Start New Loaf Button */}
      <button
        onClick={startNewLoaf}
        disabled={saving}
        className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Start New Loaf
      </button>

      {/* Loaves */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : loaves.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No loaves recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loaves.map((loaf) => (
            <LoafCard
              key={loaf.id}
              loaf={loaf}
              onUpdate={(updates) => updateLoaf(loaf.id, updates)}
              onDelete={() => deleteLoaf(loaf.id)}
              calculateHydration={calculateHydration}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LoafCard({
  loaf,
  onUpdate,
  onDelete,
  calculateHydration,
}: {
  loaf: SourdoughLoaf;
  onUpdate: (updates: Partial<SourdoughLoaf>) => void;
  onDelete: () => void;
  calculateHydration: (water: number | null, flour: number | null) => number | null;
}) {
  const hydration = calculateHydration(loaf.waterGrams, loaf.flourGrams);

  const addStretchFold = () => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const folds = [...(loaf.stretchFolds || []), time];
    onUpdate({ stretchFolds: folds });
  };

  const removeStretchFold = (index: number) => {
    const folds = (loaf.stretchFolds || []).filter((_, i) => i !== index);
    onUpdate({ stretchFolds: folds });
  };

  const setProofTime = (field: "firstProofTime" | "secondProofTime") => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    onUpdate({ [field]: time });
  };

  const addBakeEvent = () => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const events = [...(loaf.bakeEvents || []), { time, temp: 450 }];
    onUpdate({ bakeEvents: events });
  };

  const updateBakeEvent = (index: number, updates: Partial<BakeEvent>) => {
    const events = [...(loaf.bakeEvents || [])];
    events[index] = { ...events[index], ...updates };
    onUpdate({ bakeEvents: events });
  };

  const removeBakeEvent = (index: number) => {
    const events = (loaf.bakeEvents || []).filter((_, i) => i !== index);
    onUpdate({ bakeEvents: events });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 shadow-sm">
      {/* Header Row */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-gray-900 font-semibold text-lg">
            {new Date(loaf.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-gray-500 text-sm">
            Mixed at {loaf.initialMixTime}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-300 hover:text-red-500 transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Ingredients Section */}
      <div className="space-y-3">
        <div className="text-gray-700 text-sm font-medium">Ingredients</div>
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
        {hydration !== null && hydration > 0 && (
          <div className="text-gray-500 text-sm pl-[76px]">
            Hydration: {hydration}%
          </div>
        )}
      </div>

      {/* Stretch & Folds */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 text-sm font-medium">Stretch & Folds</span>
          <button
            onClick={addStretchFold}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
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
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
              >
                {time}
                <button
                  onClick={() => removeStretchFold(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">None yet</div>
        )}
      </div>

      {/* Proofing */}
      <div>
        <div className="text-gray-700 text-sm font-medium mb-2">Proofing</div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm w-24">First Proof</span>
            {loaf.firstProofTime ? (
              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                {loaf.firstProofTime}
                <button
                  onClick={() => onUpdate({ firstProofTime: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </span>
            ) : (
              <button
                onClick={() => setProofTime("firstProofTime")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                Start Now
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm w-24">Second Proof</span>
            {loaf.secondProofTime ? (
              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                {loaf.secondProofTime}
                <button
                  onClick={() => onUpdate({ secondProofTime: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </span>
            ) : (
              <button
                onClick={() => setProofTime("secondProofTime")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                Start Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Baking */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 text-sm font-medium">Baking</span>
          <button
            onClick={addBakeEvent}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
        {loaf.bakeEvents && loaf.bakeEvents.length > 0 ? (
          <div className="space-y-2">
            {loaf.bakeEvents.map((event, index) => (
              <BakeEventRow
                key={index}
                event={event}
                index={index}
                onUpdate={(updates) => updateBakeEvent(index, updates)}
                onRemove={() => removeBakeEvent(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Not started</div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-gray-700 text-sm font-medium block mb-2">Notes</label>
        <textarea
          value={loaf.notes || ""}
          onChange={(e) => onUpdate({ notes: e.target.value || null })}
          onBlur={(e) => onUpdate({ notes: e.target.value || null })}
          rows={2}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="How did it turn out?"
        />
      </div>
    </div>
  );
}

function BakeEventRow({
  event,
  index,
  onUpdate,
  onRemove,
}: {
  event: BakeEvent;
  index: number;
  onUpdate: (updates: Partial<BakeEvent>) => void;
  onRemove: () => void;
}) {
  const [localTemp, setLocalTemp] = useState(event.temp.toString());

  useEffect(() => {
    setLocalTemp(event.temp.toString());
  }, [event.temp]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500 text-sm w-8">{index === 0 ? "In" : `${index + 1}.`}</span>
      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
        {event.time}
      </span>
      <span className="text-gray-500 text-sm">at</span>
      <input
        type="number"
        value={localTemp}
        onChange={(e) => setLocalTemp(e.target.value)}
        onBlur={() => onUpdate({ temp: parseInt(localTemp) || 0 })}
        className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <span className="text-gray-500 text-sm">°F</span>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-gray-600 ml-auto"
      >
        ×
      </button>
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
    <div className="flex items-center gap-3">
      <span className="text-gray-600 text-sm w-16">{label}</span>
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onValueChange(parseInt(localValue) || 0)}
        className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="0"
      />
      <span className="text-gray-400 text-sm">{unit}</span>
      {onSecondaryChange && (
        <input
          type="text"
          value={localSecondary}
          onChange={(e) => setLocalSecondary(e.target.value)}
          onBlur={() => onSecondaryChange(localSecondary)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={secondaryPlaceholder}
        />
      )}
    </div>
  );
}

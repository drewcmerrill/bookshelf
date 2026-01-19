"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function EditableTime({
  time,
  onUpdate,
  className = "",
}: {
  time: string;
  onUpdate: (time: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [localTime, setLocalTime] = useState(time);

  useEffect(() => {
    setLocalTime(time);
  }, [time]);

  if (editing) {
    return (
      <input
        type="time"
        value={localTime}
        onChange={(e) => setLocalTime(e.target.value)}
        onBlur={() => {
          if (localTime && localTime !== time) {
            onUpdate(localTime);
          }
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (localTime && localTime !== time) {
              onUpdate(localTime);
            }
            setEditing(false);
          } else if (e.key === "Escape") {
            setLocalTime(time);
            setEditing(false);
          }
        }}
        autoFocus
        className={`bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="hover:bg-gray-200 rounded px-1 -mx-1 transition-colors"
      title="Click to edit"
    >
      {formatTime(time)}
    </button>
  );
}

type BakeEvent = {
  time: string;
  temp: number;
  date?: string; // Optional date in YYYY-MM-DD format for next-day bakes
};

type StretchFold = {
  time: string;
  indoorTemp?: number;
};

type SourdoughLoaf = {
  id: number;
  date: string;
  initialMixTime: string;
  temperature: number | null;
  indoorTempMix: number | null;
  flourGrams: number | null;
  flourType: string | null;
  waterGrams: number | null;
  starterGrams: number | null;
  stretchFolds: StretchFold[] | null;
  firstProofTime: string | null;
  firstProofLocation: string | null;
  firstProofIndoorTemp: number | null;
  secondProofTime: string | null;
  secondProofLocation: string | null;
  secondProofIndoorTemp: number | null;
  bakeEvents: BakeEvent[] | null;
  bakeEndTime: string | null;
  bakeEndDate: string | null;
  crossSectionWidth: number | null;
  crossSectionHeight: number | null;
  notes: string | null;
};

const PROOF_LOCATIONS = [
  { value: "counter", label: "Counter" },
  { value: "oven", label: "Oven" },
  { value: "fridge", label: "Fridge" },
];

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

  const fetchGilbertTemperature = async (): Promise<number | null> => {
    try {
      // Gilbert, AZ coordinates: 33.3528° N, 111.7890° W
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=33.3528&longitude=-111.789&current=temperature_2m&temperature_unit=fahrenheit"
      );
      if (res.ok) {
        const data = await res.json();
        return Math.round(data.current.temperature_2m);
      }
    } catch (error) {
      console.error("Failed to fetch temperature:", error);
    }
    return null;
  };

  const startNewLoaf = async () => {
    setSaving(true);
    try {
      const now = new Date();
      const time = now.toTimeString().slice(0, 5);
      const temperature = await fetchGilbertTemperature();

      const res = await fetch("/api/sourdough", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: now.toISOString(),
          initialMixTime: time,
          temperature,
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
          {loaves.map((loaf, index) => (
            <LoafCard
              key={loaf.id}
              loaf={loaf}
              loafNumber={loaves.length - index}
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
  loafNumber,
  onUpdate,
  onDelete,
  calculateHydration,
}: {
  loaf: SourdoughLoaf;
  loafNumber: number;
  onUpdate: (updates: Partial<SourdoughLoaf>) => void;
  onDelete: () => void;
  calculateHydration: (water: number | null, flour: number | null) => number | null;
}) {
  const hydration = calculateHydration(loaf.waterGrams, loaf.flourGrams);

  const addStretchFold = () => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const folds = [...(loaf.stretchFolds || []), { time }];
    onUpdate({ stretchFolds: folds });
  };

  const updateStretchFold = (index: number, updates: Partial<StretchFold>) => {
    const folds = [...(loaf.stretchFolds || [])];
    folds[index] = { ...folds[index], ...updates };
    onUpdate({ stretchFolds: folds });
  };

  const removeStretchFold = (index: number) => {
    const folds = (loaf.stretchFolds || []).filter((_, i) => i !== index);
    onUpdate({ stretchFolds: folds });
  };

  const setProofTime = (
    timeField: "firstProofTime" | "secondProofTime",
    locationField: "firstProofLocation" | "secondProofLocation",
    location: string
  ) => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    onUpdate({ [timeField]: time, [locationField]: location });
  };

  const clearProof = (
    timeField: "firstProofTime" | "secondProofTime",
    locationField: "firstProofLocation" | "secondProofLocation"
  ) => {
    onUpdate({ [timeField]: null, [locationField]: null });
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
            Loaf {loafNumber} — {new Date(loaf.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-gray-500 text-sm flex items-center gap-1 flex-wrap">
            Mixed at{" "}
            <EditableTime
              time={loaf.initialMixTime}
              onUpdate={(time) => onUpdate({ initialMixTime: time })}
            />
            {loaf.temperature && (
              <span className="ml-2">• {loaf.temperature}°F outside</span>
            )}
            <span className="ml-2">•</span>
            <TempInput
              value={loaf.indoorTempMix}
              onUpdate={(temp) => onUpdate({ indoorTempMix: temp })}
              placeholder="Indoor"
            />
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
            {loaf.stretchFolds.map((fold, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
              >
                <EditableTime
                  time={fold.time}
                  onUpdate={(newTime) => updateStretchFold(index, { time: newTime })}
                />
                <TempInput
                  value={fold.indoorTemp || null}
                  onUpdate={(temp) => updateStretchFold(index, { indoorTemp: temp || undefined })}
                  placeholder="Temp"
                  compact
                />
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
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm w-24">First Proof</span>
            {loaf.firstProofTime ? (
              <>
                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                  <EditableTime
                    time={loaf.firstProofTime}
                    onUpdate={(time) => onUpdate({ firstProofTime: time })}
                  />
                  {loaf.firstProofLocation && (
                    <select
                      value={loaf.firstProofLocation}
                      onChange={(e) => onUpdate({ firstProofLocation: e.target.value })}
                      className="bg-transparent text-gray-500 text-sm border-none focus:outline-none cursor-pointer"
                    >
                      {PROOF_LOCATIONS.map((loc) => (
                        <option key={loc.value} value={loc.value}>
                          ({loc.label})
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => clearProof("firstProofTime", "firstProofLocation")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </span>
                <TempInput
                  value={loaf.firstProofIndoorTemp}
                  onUpdate={(temp) => onUpdate({ firstProofIndoorTemp: temp })}
                  placeholder="Indoor"
                />
              </>
            ) : (
              <div className="flex gap-2">
                {PROOF_LOCATIONS.map((loc) => (
                  <button
                    key={loc.value}
                    onClick={() => setProofTime("firstProofTime", "firstProofLocation", loc.value)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm w-24">Second Proof</span>
            {loaf.secondProofTime ? (
              <>
                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                  <EditableTime
                    time={loaf.secondProofTime}
                    onUpdate={(time) => onUpdate({ secondProofTime: time })}
                  />
                  {loaf.secondProofLocation && (
                    <select
                      value={loaf.secondProofLocation}
                      onChange={(e) => onUpdate({ secondProofLocation: e.target.value })}
                      className="bg-transparent text-gray-500 text-sm border-none focus:outline-none cursor-pointer"
                    >
                      {PROOF_LOCATIONS.map((loc) => (
                        <option key={loc.value} value={loc.value}>
                          ({loc.label})
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => clearProof("secondProofTime", "secondProofLocation")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </span>
                <TempInput
                  value={loaf.secondProofIndoorTemp}
                  onUpdate={(temp) => onUpdate({ secondProofIndoorTemp: temp })}
                  placeholder="Indoor"
                />
              </>
            ) : (
              <div className="flex gap-2">
                {PROOF_LOCATIONS.map((loc) => (
                  <button
                    key={loc.value}
                    onClick={() => setProofTime("secondProofTime", "secondProofLocation", loc.value)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
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
                loafDate={loaf.date}
                onUpdate={(updates) => updateBakeEvent(index, updates)}
                onRemove={() => removeBakeEvent(index)}
              />
            ))}
            {/* Remove from Oven */}
            <BakeEndRow
              loaf={loaf}
              onUpdate={onUpdate}
            />
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Not started</div>
        )}
      </div>

      {/* Cross Section */}
      <div>
        <div className="text-gray-700 text-sm font-medium mb-2">Cross Section</div>
        <div className="flex items-center gap-3">
          <CrossSectionInput
            label="Width"
            value={loaf.crossSectionWidth}
            onUpdate={(v) => onUpdate({ crossSectionWidth: v })}
          />
          <span className="text-gray-400">×</span>
          <CrossSectionInput
            label="Height"
            value={loaf.crossSectionHeight}
            onUpdate={(v) => onUpdate({ crossSectionHeight: v })}
          />
        </div>
      </div>

      {/* Notes */}
      <NotesInput
        value={loaf.notes}
        onSave={(notes) => onUpdate({ notes })}
      />
    </div>
  );
}

function BakeEndRow({
  loaf,
  onUpdate,
}: {
  loaf: SourdoughLoaf;
  onUpdate: (updates: Partial<SourdoughLoaf>) => void;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loafDateStr = new Date(loaf.date).toISOString().split("T")[0];
  const endDate = loaf.bakeEndDate || loafDateStr;
  const isNextDay = endDate !== loafDateStr;

  return (
    <div className="flex items-center gap-2 pt-1 flex-wrap">
      <span className="text-gray-500 text-sm w-8">Out</span>
      {loaf.bakeEndTime ? (
        <>
          <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
            <EditableTime
              time={loaf.bakeEndTime}
              onUpdate={(time) => onUpdate({ bakeEndTime: time })}
            />
            {isNextDay && (
              <span className="text-gray-400 text-xs">(+1 day)</span>
            )}
          </span>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="text-gray-400 hover:text-gray-600 text-xs"
            title="Change date"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          {showDatePicker && (
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                onUpdate({ bakeEndDate: e.target.value === loafDateStr ? null : e.target.value });
                setShowDatePicker(false);
              }}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <button
            onClick={() => onUpdate({ bakeEndTime: null, bakeEndDate: null })}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            const now = new Date();
            const time = now.toTimeString().slice(0, 5);
            const todayStr = now.toISOString().split("T")[0];
            onUpdate({
              bakeEndTime: time,
              bakeEndDate: todayStr !== loafDateStr ? todayStr : null
            });
          }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
        >
          Remove Now
        </button>
      )}
    </div>
  );
}

function BakeEventRow({
  event,
  index,
  loafDate,
  onUpdate,
  onRemove,
}: {
  event: BakeEvent;
  index: number;
  loafDate: string;
  onUpdate: (updates: Partial<BakeEvent>) => void;
  onRemove: () => void;
}) {
  const [localTemp, setLocalTemp] = useState(event.temp.toString());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setLocalTemp(event.temp.toString());
  }, [event.temp]);

  // Format the loaf date for comparison
  const loafDateStr = new Date(loafDate).toISOString().split("T")[0];
  const eventDate = event.date || loafDateStr;
  const isNextDay = eventDate !== loafDateStr;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-gray-500 text-sm w-8">{index === 0 ? "In" : `${index + 1}.`}</span>
      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
        <EditableTime
          time={event.time}
          onUpdate={(time) => onUpdate({ time })}
        />
        {isNextDay && (
          <span className="text-gray-400 text-xs">(+1 day)</span>
        )}
      </span>
      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="text-gray-400 hover:text-gray-600 text-xs"
        title="Change date"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      {showDatePicker && (
        <input
          type="date"
          value={eventDate}
          onChange={(e) => {
            onUpdate({ date: e.target.value === loafDateStr ? undefined : e.target.value });
            setShowDatePicker(false);
          }}
          className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
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

function CrossSectionInput({
  label,
  value,
  onUpdate,
}: {
  label: string;
  value: number | null;
  onUpdate: (v: number | null) => void;
}) {
  const [localValue, setLocalValue] = useState(value?.toString() || "");

  useEffect(() => {
    setLocalValue(value?.toString() || "");
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500 text-sm">{label}</span>
      <input
        type="number"
        step="0.1"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onUpdate(localValue ? parseFloat(localValue) : null)}
        className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="0"
      />
      <span className="text-gray-400 text-sm">in</span>
    </div>
  );
}

function TempInput({
  value,
  onUpdate,
  placeholder = "Temp",
  compact = false,
}: {
  value: number | null;
  onUpdate: (temp: number | null) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [localValue, setLocalValue] = useState(value?.toString() || "");

  useEffect(() => {
    setLocalValue(value?.toString() || "");
  }, [value]);

  if (compact) {
    return (
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onUpdate(localValue ? parseInt(localValue) : null)}
        className="w-12 bg-white border border-gray-200 rounded px-1 py-0.5 text-gray-700 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="°F"
      />
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onUpdate(localValue ? parseInt(localValue) : null)}
        className="w-14 bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-700 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder={placeholder}
      />
      <span className="text-gray-400 text-sm">°F</span>
    </span>
  );
}

function NotesInput({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (notes: string | null) => void;
}) {
  const [localValue, setLocalValue] = useState(value || "");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalValue(value || "");
    setHasChanges(false);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    setHasChanges(newValue !== (value || ""));
  };

  const handleSave = () => {
    onSave(localValue || null);
    setHasChanges(false);
  };

  return (
    <div>
      <label className="text-gray-700 text-sm font-medium block mb-2">Notes</label>
      <textarea
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        rows={2}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="How did it turn out?"
      />
      {hasChanges && (
        <button
          onClick={handleSave}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
        >
          Save Notes
        </button>
      )}
    </div>
  );
}

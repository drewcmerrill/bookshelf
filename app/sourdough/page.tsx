"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function getMinutesBetween(start: string, end: string): number {
  const [startHours, startMins] = start.split(":").map(Number);
  const [endHours, endMins] = end.split(":").map(Number);
  const startTotal = startHours * 60 + startMins;
  const endTotal = endHours * 60 + endMins;
  // Handle overnight (if end is earlier than start, assume next day)
  if (endTotal < startTotal) {
    return (24 * 60 - startTotal) + endTotal;
  }
  return endTotal - startTotal;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}

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
  firstProofLocation: string | null;
  secondProofTime: string | null;
  secondProofLocation: string | null;
  bakeEvents: BakeEvent[] | null;
  bakeEndTime: string | null;
  notes: string | null;
};

export default function SourdoughPage() {
  const [loaves, setLoaves] = useState<SourdoughLoaf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchLoaves();
  }, []);

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
        <Link
          href="/admin/sourdough"
          className="text-slate-400 hover:text-slate-600 transition-colors text-sm"
        >
          Edit
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
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
            {loaves.map((loaf, index) => {
              const hydration = calculateHydration(loaf.waterGrams, loaf.flourGrams);
              const loafNumber = loaves.length - index;
              return (
                <div
                  key={loaf.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm"
                >
                  {/* Header */}
                  <div>
                    <div className="text-slate-900 font-medium">
                      Loaf {loafNumber} — {new Date(loaf.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-slate-500 text-sm">
                      Mixed at {formatTime(loaf.initialMixTime)}
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-1 text-sm">
                    <div className="flex gap-4">
                      <span className="text-slate-500 w-16">Flour</span>
                      <span className="text-slate-900">
                        {loaf.flourGrams || 0}g {loaf.flourType || ""}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500 w-16">Water</span>
                      <span className="text-slate-900">{loaf.waterGrams || 0}g</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500 w-16">Starter</span>
                      <span className="text-slate-900">{loaf.starterGrams || 0}g</span>
                    </div>
                    {hydration !== null && hydration > 0 && (
                      <div className="text-slate-600 font-medium pt-1">
                        Hydration: {hydration}%
                      </div>
                    )}
                  </div>

                  {/* Stretch & Folds */}
                  {loaf.stretchFolds && loaf.stretchFolds.length > 0 && (
                    <div>
                      <span className="text-slate-500 text-sm">Stretch & Folds</span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {loaf.stretchFolds.map((time, idx) => {
                          const prevTime = idx === 0 ? loaf.initialMixTime : loaf.stretchFolds![idx - 1];
                          const duration = getMinutesBetween(prevTime, time);
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              {idx > 0 && (
                                <span className="text-slate-400 text-xs">+{formatDuration(duration)}</span>
                              )}
                              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm">
                                {formatTime(time)}
                                {idx === 0 && (
                                  <span className="text-slate-400 text-xs ml-1">
                                    (+{formatDuration(duration)} from mix)
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Proofing */}
                  {(loaf.firstProofTime || loaf.secondProofTime) && (() => {
                    const bakeStart = loaf.bakeEvents?.[0]?.time;
                    const firstProofEnd = loaf.secondProofTime || bakeStart;
                    const firstProofDuration = loaf.firstProofTime && firstProofEnd
                      ? getMinutesBetween(loaf.firstProofTime, firstProofEnd)
                      : null;
                    const secondProofDuration = loaf.secondProofTime && bakeStart
                      ? getMinutesBetween(loaf.secondProofTime, bakeStart)
                      : null;

                    return (
                      <div className="space-y-1 text-sm">
                        <span className="text-slate-500">Proofing</span>
                        <div className="flex flex-wrap gap-3 mt-1">
                          {loaf.firstProofTime && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">1st:</span>
                              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md">
                                {formatTime(loaf.firstProofTime)}
                                {loaf.firstProofLocation && (
                                  <span className="text-slate-500 ml-1">({loaf.firstProofLocation})</span>
                                )}
                                {firstProofDuration && (
                                  <span className="text-slate-400 text-xs ml-1">
                                    — {formatDuration(firstProofDuration)}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {loaf.secondProofTime && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">2nd:</span>
                              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md">
                                {formatTime(loaf.secondProofTime)}
                                {loaf.secondProofLocation && (
                                  <span className="text-slate-500 ml-1">({loaf.secondProofLocation})</span>
                                )}
                                {secondProofDuration && (
                                  <span className="text-slate-400 text-xs ml-1">
                                    — {formatDuration(secondProofDuration)}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Baking */}
                  {loaf.bakeEvents && loaf.bakeEvents.length > 0 && (() => {
                    const events = loaf.bakeEvents!;
                    const totalDuration = loaf.bakeEndTime
                      ? getMinutesBetween(events[0].time, loaf.bakeEndTime)
                      : null;

                    return (
                      <div>
                        <span className="text-slate-500 text-sm">
                          Baking
                          {totalDuration && (
                            <span className="text-slate-400 ml-1">
                              ({formatDuration(totalDuration)} total)
                            </span>
                          )}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {events.map((event, idx) => {
                            const nextTime = idx < events.length - 1
                              ? events[idx + 1].time
                              : loaf.bakeEndTime;
                            const duration = nextTime
                              ? getMinutesBetween(event.time, nextTime)
                              : null;

                            return (
                              <span
                                key={idx}
                                className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm"
                              >
                                {event.temp}°F
                                {duration && (
                                  <span className="text-slate-400 text-xs ml-1">
                                    for {formatDuration(duration)}
                                  </span>
                                )}
                              </span>
                            );
                          })}
                          {loaf.bakeEndTime && (
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm">
                              Out @ {formatTime(loaf.bakeEndTime)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Notes */}
                  {loaf.notes && (
                    <div>
                      <span className="text-slate-500 text-sm">Notes</span>
                      <p className="text-slate-700 text-sm mt-1">{loaf.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

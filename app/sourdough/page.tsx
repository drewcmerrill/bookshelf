"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tangerine } from "next/font/google";

const tangerine = Tangerine({
  subsets: ["latin"],
  weight: "700",
});

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
    return 24 * 60 - startTotal + endTotal;
  }
  return endTotal - startTotal;
}

function getMinutesBetweenWithDates(
  startTime: string,
  startDate: string,
  endTime: string,
  endDate: string,
): number {
  const [startHours, startMins] = startTime.split(":").map(Number);
  const [endHours, endMins] = endTime.split(":").map(Number);

  const startDateTime = new Date(startDate);
  startDateTime.setHours(startHours, startMins, 0, 0);

  const endDateTime = new Date(endDate);
  endDateTime.setHours(endHours, endMins, 0, 0);

  return Math.round(
    (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60),
  );
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
  date?: string; // Optional date for next-day bakes
};

type StretchFold =
  | {
      time: string;
      indoorTemp?: number;
    }
  | string; // Support both old string format and new object format

type SourdoughIngredient = {
  id: number;
  name: string;
  grams: number;
  details: string | null;
  proteinContent: number | null;
  sortOrder: number;
};

type SourdoughLoaf = {
  id: number;
  date: string;
  starterFedTime: string | null;
  starterFedDate: string | null;
  initialMixTime: string | null;
  mixIndoorTemp: number | null;
  temperature: number | null;
  indoorTempMix: number | null;
  imageUrls: string[] | null;
  flourGrams: number | null;
  flourType: string | null;
  waterGrams: number | null;
  starterGrams: number | null;
  ingredients: SourdoughIngredient[];
  stretchFolds: StretchFold[] | null;
  firstProofTime: string | null;
  firstProofLocation: string | null;
  firstProofIndoorTemp: number | null;
  secondProofTime: string | null;
  secondProofLocation: string | null;
  secondProofIndoorTemp: number | null;
  dutchOven: string | null;
  bakeEvents: BakeEvent[] | null;
  bakeEndTime: string | null;
  bakeEndDate: string | null;
  crossSectionWidth: number | null;
  crossSectionHeight: number | null;
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

  const calculateHydration = (ingredients: SourdoughIngredient[]) => {
    const flour = ingredients
      .filter((i) => i.name === "flour")
      .reduce((sum, i) => sum + i.grams, 0);
    const water = ingredients
      .filter((i) => i.name === "water")
      .reduce((sum, i) => sum + i.grams, 0);
    if (!flour || !water) return null;
    return Math.round((water / flour) * 100);
  };

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
          Sourdough Log
        </h1>
        <Link
          href="/admin/sourdough"
          className="text-slate-400 hover:text-slate-600 transition-colors text-2xl"
        >
          Edit
        </Link>
      </header>

      {/* Intro Section */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-6">
        <div className="prose prose-slate text-lg text-slate-600 leading-relaxed">
          {/* <p>
            I love sourdough, and I love making it. But it's the worst feeling
            in the world when you labor for two days to make the perfect loaf
            only for it to come out as flat as a hockey puck. So I made this
            website to track every variable I can think of that could contribute
            to the potency of my oven rises.
          </p> */}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              {/* Steam lines */}
              <svg
                className="absolute -top-5 left-1/2 -translate-x-1/2"
                width="36"
                height="20"
                viewBox="0 0 36 20"
              >
                <path
                  d="M8 20 Q6 15, 8 10 Q10 5, 8 0"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="animate-steam-1"
                />
                <path
                  d="M18 20 Q16 15, 18 10 Q20 5, 18 0"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="animate-steam-2"
                />
                <path
                  d="M28 20 Q26 15, 28 10 Q30 5, 28 0"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="animate-steam-3"
                />
              </svg>
              {/* Line-art bread loaf */}
              <svg width="64" height="32" viewBox="0 0 64 32">
                {/* Loaf outline - nice rounded boule shape */}
                <path
                  d="M6 28 C6 28, 4 20, 12 14 C20 8, 32 6, 32 6 C32 6, 44 8, 52 14 C60 20, 58 28, 58 28"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Base line */}
                <line
                  x1="6"
                  y1="28"
                  x2="58"
                  y2="28"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Score marks - diagonal slashes */}
                <path
                  d="M22 11 C24 14, 26 18, 24 22"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M30 9 C32 12, 34 16, 32 20"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M38 10 C40 13, 42 17, 40 21"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <style jsx>{`
              @keyframes steam-rise-1 {
                0%,
                100% {
                  opacity: 0;
                  transform: translateY(0);
                }
                50% {
                  opacity: 0.7;
                  transform: translateY(-4px);
                }
              }
              @keyframes steam-rise-2 {
                0%,
                100% {
                  opacity: 0;
                  transform: translateY(0);
                }
                50% {
                  opacity: 0.8;
                  transform: translateY(-6px);
                }
              }
              @keyframes steam-rise-3 {
                0%,
                100% {
                  opacity: 0;
                  transform: translateY(0);
                }
                50% {
                  opacity: 0.6;
                  transform: translateY(-3px);
                }
              }
              .animate-steam-1 {
                animation: steam-rise-1 2s ease-in-out infinite;
              }
              .animate-steam-2 {
                animation: steam-rise-2 2s ease-in-out infinite 0.3s;
              }
              .animate-steam-3 {
                animation: steam-rise-3 2s ease-in-out infinite 0.6s;
              }
            `}</style>
          </div>
        ) : loaves.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No loaves recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loaves.map((loaf, index) => {
              const hydration = calculateHydration(loaf.ingredients || []);
              const loafNumber = loaves.length - index;
              return (
                <div
                  key={loaf.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm"
                >
                  {/* Header */}
                  <div>
                    <div className="text-slate-900 font-medium">
                      Loaf {loafNumber} —{" "}
                      {new Date(loaf.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    {loaf.starterFedTime && (
                      <div className="text-slate-500 text-sm">
                        Starter fed at {formatTime(loaf.starterFedTime)}
                        {loaf.starterFedDate &&
                          loaf.starterFedDate !==
                            new Date(loaf.date).toISOString().split("T")[0] && (
                            <span className="text-slate-400 ml-1">
                              (prev day)
                            </span>
                          )}
                        {loaf.temperature && (
                          <span className="ml-2">
                            • {loaf.temperature}°F outside
                          </span>
                        )}
                        {loaf.indoorTempMix && (
                          <span className="ml-2">
                            • {loaf.indoorTempMix}°F inside
                          </span>
                        )}
                      </div>
                    )}
                    {loaf.initialMixTime && (
                      <div className="text-slate-500 text-sm">
                        Mixed at {formatTime(loaf.initialMixTime)}
                        {loaf.starterFedTime && (
                          <span className="text-slate-400 ml-1">
                            (+
                            {formatDuration(
                              loaf.starterFedDate &&
                                loaf.starterFedDate !==
                                  new Date(loaf.date)
                                    .toISOString()
                                    .split("T")[0]
                                ? getMinutesBetweenWithDates(
                                    loaf.starterFedTime,
                                    loaf.starterFedDate,
                                    loaf.initialMixTime,
                                    new Date(loaf.date)
                                      .toISOString()
                                      .split("T")[0],
                                  )
                                : getMinutesBetween(
                                    loaf.starterFedTime,
                                    loaf.initialMixTime,
                                  ),
                            )}{" "}
                            from feed)
                          </span>
                        )}
                        {loaf.mixIndoorTemp && (
                          <span className="ml-2">
                            • {loaf.mixIndoorTemp}°F inside
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ingredients */}
                  {loaf.ingredients && loaf.ingredients.length > 0 && (
                    <div className="space-y-1 text-sm">
                      {loaf.ingredients.map((ing) => {
                        const displayName =
                          ing.name.charAt(0).toUpperCase() + ing.name.slice(1);
                        return (
                          <div key={ing.id} className="flex gap-4">
                            <span className="text-slate-500 w-16">
                              {displayName}
                            </span>
                            <span className="text-slate-900">
                              {ing.grams}g
                              {ing.details && ` ${ing.details}`}
                              {ing.proteinContent && (
                                <span className="text-slate-400 ml-1">
                                  ({ing.proteinContent}% protein)
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                      {hydration !== null && hydration > 0 && (
                        <div className="text-slate-600 font-medium pt-1">
                          Hydration: {hydration}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stretch & Folds */}
                  {loaf.stretchFolds && loaf.stretchFolds.length > 0 && (
                    <div>
                      <span className="text-slate-500 text-sm">
                        Stretch & Folds
                      </span>
                      <div className="flex flex-col items-start gap-2 mt-1">
                        {loaf.stretchFolds.map((fold, idx) => {
                          // Handle both old string format and new object format
                          const foldTime =
                            typeof fold === "string" ? fold : fold.time;
                          const foldIndoorTemp =
                            typeof fold === "string"
                              ? undefined
                              : fold.indoorTemp;
                          const prevFold = loaf.stretchFolds![idx - 1];
                          const prevTime =
                            idx === 0
                              ? loaf.initialMixTime
                              : typeof prevFold === "string"
                                ? prevFold
                                : prevFold.time;
                          const duration = prevTime
                            ? getMinutesBetween(prevTime, foldTime)
                            : null;
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              {duration !== null && (
                                <span className="text-slate-400 text-xs">
                                  +{formatDuration(duration)}
                                </span>
                              )}
                              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm">
                                {formatTime(foldTime)}
                                {foldIndoorTemp && (
                                  <span className="text-slate-400 text-xs ml-1">
                                    ({foldIndoorTemp}°F)
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
                  {(loaf.firstProofTime || loaf.secondProofTime) &&
                    (() => {
                      const loafDateStr = new Date(loaf.date)
                        .toISOString()
                        .split("T")[0];
                      const bakeEvent = loaf.bakeEvents?.[0];
                      const bakeStart = bakeEvent?.time;
                      const bakeDate = bakeEvent?.date || loafDateStr;

                      // Calculate time from mix to second proof start
                      const mixToSecondProof =
                        loaf.initialMixTime && loaf.secondProofTime
                          ? getMinutesBetween(
                              loaf.initialMixTime,
                              loaf.secondProofTime,
                            )
                          : null;

                      // Calculate first proof duration (to second proof or bake start)
                      const firstProofEnd = loaf.secondProofTime || bakeStart;
                      const firstProofEndDate = loaf.secondProofTime
                        ? loafDateStr
                        : bakeDate;
                      const firstProofDuration =
                        loaf.firstProofTime && firstProofEnd
                          ? getMinutesBetweenWithDates(
                              loaf.firstProofTime,
                              loafDateStr,
                              firstProofEnd,
                              firstProofEndDate,
                            )
                          : null;

                      // Calculate second proof duration (to bake start, which may be next day)
                      const secondProofDuration =
                        loaf.secondProofTime && bakeStart
                          ? getMinutesBetweenWithDates(
                              loaf.secondProofTime,
                              loafDateStr,
                              bakeStart,
                              bakeDate,
                            )
                          : null;

                      // Check if second proof is overnight
                      const isOvernightProof =
                        secondProofDuration && secondProofDuration > 8 * 60;

                      return (
                        <div className="space-y-1 text-sm">
                          <span className="text-slate-500">Proofing</span>
                          <div className="flex flex-col items-start gap-3 mt-1">
                            {loaf.firstProofTime && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">1st:</span>

                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md">
                                  {formatTime(loaf.firstProofTime)}
                                  {loaf.firstProofLocation && (
                                    <span className="text-slate-500 ml-1">
                                      ({loaf.firstProofLocation})
                                    </span>
                                  )}
                                  {loaf.firstProofIndoorTemp && (
                                    <span className="text-slate-400 text-xs ml-1">
                                      {loaf.firstProofIndoorTemp}°F
                                    </span>
                                  )}
                                  {firstProofDuration &&
                                    firstProofDuration > 0 && (
                                      <span className="text-slate-400 text-xs ml-1">
                                        — {formatDuration(firstProofDuration)}
                                      </span>
                                    )}
                                  {mixToSecondProof && mixToSecondProof > 0 && (
                                    <span className="text-slate-400 text-xs ml-1">
                                      ({formatDuration(mixToSecondProof)} since
                                      mix)
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
                                    <span className="text-slate-500 ml-1">
                                      ({loaf.secondProofLocation})
                                    </span>
                                  )}
                                  {loaf.secondProofIndoorTemp && (
                                    <span className="text-slate-400 text-xs ml-1">
                                      {loaf.secondProofIndoorTemp}°F
                                    </span>
                                  )}
                                  {secondProofDuration &&
                                    secondProofDuration > 0 && (
                                      <span className="text-slate-400 text-xs ml-1">
                                        — {formatDuration(secondProofDuration)}
                                        {isOvernightProof && " overnight"}
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
                  {loaf.bakeEvents &&
                    loaf.bakeEvents.length > 0 &&
                    (() => {
                      const events = loaf.bakeEvents!;
                      const loafDateStr = new Date(loaf.date)
                        .toISOString()
                        .split("T")[0];

                      // Get date for each event (defaults to loaf date)
                      const getEventDate = (event: BakeEvent) =>
                        event.date || loafDateStr;
                      const endDate = loaf.bakeEndDate || loafDateStr;

                      // Calculate total duration considering dates
                      const totalDuration = loaf.bakeEndTime
                        ? getMinutesBetweenWithDates(
                            events[0].time,
                            getEventDate(events[0]),
                            loaf.bakeEndTime,
                            endDate,
                          )
                        : null;

                      // Check if baking spans multiple days
                      const bakeSpansMultipleDays =
                        events.some((e) => e.date && e.date !== loafDateStr) ||
                        (loaf.bakeEndDate && loaf.bakeEndDate !== loafDateStr);

                      const dutchOvenLabel =
                        loaf.dutchOven === "cast-iron"
                          ? "Cast Iron"
                          : loaf.dutchOven === "ceramic"
                            ? "Ceramic"
                            : null;

                      return (
                        <div>
                          <span className="text-slate-500 text-sm">
                            Baking
                            {dutchOvenLabel && (
                              <span className="text-slate-400 ml-1">
                                ({dutchOvenLabel})
                              </span>
                            )}{" "}
                            — In @ {formatTime(events[0].time)}
                            {bakeSpansMultipleDays && (
                              <span className="text-slate-400 ml-1">
                                (next day)
                              </span>
                            )}
                            {totalDuration && totalDuration > 0 && (
                              <span className="text-slate-400 ml-1">
                                — {formatDuration(totalDuration)} total
                              </span>
                            )}
                          </span>
                          <div className="flex flex-col items-start gap-2 mt-1">
                            {events.map((event, idx) => {
                              const currentDate = getEventDate(event);
                              const nextEvent =
                                idx < events.length - 1
                                  ? events[idx + 1]
                                  : null;
                              const nextTime = nextEvent
                                ? nextEvent.time
                                : loaf.bakeEndTime;
                              const nextDate = nextEvent
                                ? getEventDate(nextEvent)
                                : endDate;

                              const duration = nextTime
                                ? getMinutesBetweenWithDates(
                                    event.time,
                                    currentDate,
                                    nextTime,
                                    nextDate,
                                  )
                                : null;

                              return (
                                <span
                                  key={idx}
                                  className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm"
                                >
                                  {event.temp}°F
                                  {duration && duration > 0 && (
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

                  {/* Cross Section */}
                  {(loaf.crossSectionWidth || loaf.crossSectionHeight) &&
                    (() => {
                      const ratio =
                        loaf.crossSectionWidth && loaf.crossSectionHeight
                          ? (
                              loaf.crossSectionHeight / loaf.crossSectionWidth
                            ).toFixed(2)
                          : null;
                      return (
                        <div>
                          <span className="text-slate-500 text-sm">
                            Cross Section
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm">
                              {loaf.crossSectionWidth || "?"}" ×{" "}
                              {loaf.crossSectionHeight || "?"}"
                            </span>
                            {ratio && (
                              <span className="text-slate-400 text-sm">
                                ({ratio} ratio)
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
                      <p className="text-slate-700 text-sm mt-1">
                        {loaf.notes}
                      </p>
                    </div>
                  )}

                  {/* Photos */}
                  {loaf.imageUrls && loaf.imageUrls.length > 0 && (
                    <PhotosSection
                      imageUrls={loaf.imageUrls}
                      loafNumber={loafNumber}
                    />
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

function PhotosSection({
  imageUrls,
  loafNumber,
}: {
  imageUrls: string[];
  loafNumber: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-slate-500 text-sm flex items-center gap-1 hover:text-slate-700 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
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
        View Photos ({imageUrls.length})
      </button>
      {expanded && (
        <div className="mt-2 flex flex-wrap gap-2">
          {imageUrls.map((url, idx) => (
            <img
              key={url}
              src={url}
              alt={`Loaf ${loafNumber} photo ${idx + 1}`}
              className="w-full max-w-xs rounded-lg border border-slate-200"
            />
          ))}
        </div>
      )}
    </div>
  );
}

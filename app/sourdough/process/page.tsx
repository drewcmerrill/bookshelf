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
  date?: string;
};

type StretchFold =
  | {
      time: string;
      indoorTemp?: number;
    }
  | string;

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

export default function SourdoughProcessPage() {
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

  const getBestLoaf = () => {
    let bestLoaf: SourdoughLoaf | null = null;
    let bestRatio = 0;
    let loafNumber = 0;

    loaves.forEach((loaf, index) => {
      if (loaf.crossSectionWidth && loaf.crossSectionHeight) {
        const ratio = loaf.crossSectionHeight / loaf.crossSectionWidth;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestLoaf = loaf;
          loafNumber = loaves.length - index;
        }
      }
    });

    return { loaf: bestLoaf, loafNumber, ratio: bestRatio };
  };

  const bestLoafData = getBestLoaf();
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
          href="/sourdough"
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
          My Process
        </h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <div className="mb-4 bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm">
          <section>
            <h2 className="text-slate-900 font-medium text-lg mb-2">
              Feeding the Starter
            </h2>
            <p className="text-slate-600 leading-relaxed">
              To feed my starter I usually feed at a 1:1:1 ratio, that is, equal
              amounts of starter, flour, and warm water. What I usually do is
              transfer 100 grams of starter from the old jar into a new jar, add
              100 grams of Costco all purpose flour, and then 100 grams of warm
              water. I try to feed it every day, but that's not really
              necessary. I've let it go 4-5 days on my counter unfed and it was
              fine. Any longer than that and I'll throw it in the fridge where
              it can last <span className="italic">much</span> longer. <br></br>{" "}
              <br></br>I just throw away any discarded starter, but I did find{" "}
              <a
                href="https://www.kingarthurbaking.com/recipes/collections/sourdough-discard-recipes"
                className="underline!"
              >
                this
              </a>{" "}
              page of recipes that use sourdough discard and I've been having
              fun making stuff with my discard instead of just throwing it away.
              <br></br>
              <br></br>
              If I know I'm going to be baking that day I'll usually feed my
              starter a litle extra flour and water so that I know that I'll
              have enough to bake with and have some leftover to keep feeding.
              When I'm baking that day I'll feed the starter around 8 or 9 am,
              throw it in the oven and turn the oven light on so it can be in a
              warm environment (Don't turn the oven on), and then when it
              doubles in size and is nice and bubbly I'll mix the loaf!
            </p>
          </section>

          <section>
            <h2 className="text-slate-900 font-medium text-lg mb-2">
              Mixing the Dough
            </h2>
            <p className="text-slate-600 leading-relaxed">
              To mix the loaf I will add to a medium bowl:<br></br>
              <br></br>- 475g Flour
              <br></br>- 325g Warm water <br></br> - 150g Sourdough starter{" "}
              <br></br> - 10g Salt <br></br> <br></br>The dough will be very
              sticky, so I just mix with my left hand and keep my right hand
              clean. After I'm done mixing I'll use a spoon in my right hand to
              scrape off any dough that sticks to my left hand back into the
              bowl. Then I'll cover the bowl, throw it in the oven with the
              light on, and let it hydrate for 30 mins before starting my
              stretch and folds.
            </p>
          </section>

          <section>
            <h2 className="text-slate-900 font-medium text-lg mb-2">
              Stretch & Folds
            </h2>
            <p className="text-slate-600 leading-relaxed">
              After the dough has sat for 30 minutes I do a round of stretch and
              folds. Rather than explaining how to do a stretch and fold it'd
              just be simpler to watch{" "}
              <a
                href="https://www.youtube.com/shorts/_xdrLqeO9Bc"
                className="underline!"
              >
                this
              </a>{" "}
              video instead. <br></br>
              <br></br> I'll usually do around 12 folds in a single round. After
              a round I'll cover the bowl and pop in back it the oven (still off
              with light on). After 30 minutes I'll do another round of stretch
              and folds and repeat the process until I've done 3 rounds of
              stretch and folds and then I'll let it sit in the oven and bulk
              ferment for a couple hours.
            </p>
          </section>

          <section>
            <h2 className="text-slate-900 font-medium text-lg mb-2">
              Bulk Fermentation
            </h2>
            <p className="text-slate-600 leading-relaxed">
              I keep my house pretty chilly, so the promote a good rise I'll do
              my bulk ferment with the bowl covered in the oven with the light
              on. You just let it sit for a couple of hours until it has about
              doubled in size. I've gotten the best success with letting it sit
              for about 3 hours after the last round of stretch and folds and
              about 6 hours after the initial mix.
            </p>
          </section>

          <section>
            <h2 className="text-slate-900 font-medium text-lg mb-2">Shaping</h2>
            <p className="text-slate-600 leading-relaxed">
              Once it's done bulk fermenting I will pre-shape the dough to form
              it into a nice tight ball with some surface tension. Again,{" "}
              <a
                href="https://www.youtube.com/shorts/bQFa5TBQh_Y"
                className="underline!"
              >
                here's
              </a>{" "}
              a good video that explains the process <br></br>
              <br></br>
              After I've preshaped I'll throw some flour on the top of the loaf
              and place it in the bread banneton (a regular bowl works fine
              too). Place it in the bowl with the smooth, floured side down and
              the seam facing up. Cover the bowl and throw it in the fridge to
              proof overnight!
            </p>
          </section>

          <section>
            <h2 className="text-slate-900 font-medium text-lg mb-2">
              Cold Proof
            </h2>
            <p className="text-slate-600 leading-relaxed">
              I usually let it sit the the fridge for about 12-14 hours as I
              can't wait much longer to make the loaf. But it can sit for much
              longer, up to 3 days I've read.
            </p>
          </section>

          <section>
            <h2 className="text-slate-900 font-medium text-lg mb-2">Baking</h2>
            <p className="text-slate-600 leading-relaxed">
              When I'm ready to start baking I'll preheat the oven to 500
              degrees with the dutch oven inside. <br></br> <br></br>After the
              oven and the dutch oven have been getting hot for about an hour
              I'll take my loaf out of the fridge, lay out some parchement
              paper, and flip the loaf onto the parchement paper.
              <br></br>
              <br></br>
              Next I'll score the bread using a razor blade, depending on how
              artistic I'm feeling will determine how fancy of a design I make,
              either way you want at least one long gash so that the loaf can
              expand better. <br></br>
              <br></br>After I'm done scoring I'll take the dutch oven out, take
              the lid off (remember the lid will be hot! Use hot pads! Yes I'm
              speaking from experience!) and place the parchment paper with the
              loaf inside the dutch oven and cover it with the lid. With my
              loaves I've experienced burning on the bottom of the crust, so to
              mitigate this I'll throw a cookie sheet on the rack onder the
              dutch oven to deflect some of the upward heat.<br></br>
              <br></br> Bake the loaf at 500 degrees for 20 minutes, then remove
              the lid of the dutch oven and reduce the temperature to 475 and
              bake until it has reached desired golden brown crispiness!
              (Usually 20-25 minutes)
            </p>
          </section>

          <section>
            <h2 className="text-slate-900 font-medium text-lg mb-2">
              Reigning Champion
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Below is my current best loaf, I've tracked as much data as
              possible to gain some insight into my baking process.
            </p>
          </section>
        </div>
        {/* Best Loaf Display */}
        {!loading && bestLoafData.loaf && (
          <LoafCard
            loaf={bestLoafData.loaf}
            loafNumber={bestLoafData.loafNumber}
            calculateHydration={calculateHydration}
            isBestLoaf
          />
        )}
      </main>
    </div>
  );
}

function LoafCard({
  loaf,
  loafNumber,
  calculateHydration,
  isBestLoaf,
}: {
  loaf: SourdoughLoaf;
  loafNumber: number;
  calculateHydration: (ingredients: SourdoughIngredient[]) => number | null;
  isBestLoaf?: boolean;
}) {
  const hydration = calculateHydration(loaf.ingredients || []);
  const loafDateStr = new Date(loaf.date).toISOString().split("T")[0];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm mb-6">
      {/* Header */}
      <div>
        {isBestLoaf && (
          <div className="text-amber-600 text-sm font-medium mb-1">
            Best Rise Ratio
          </div>
        )}
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
            {loaf.starterFedDate && loaf.starterFedDate !== loafDateStr && (
              <span className="text-slate-400 ml-1">(prev day)</span>
            )}
            {loaf.temperature && (
              <span className="ml-2">• {loaf.temperature}°F outside</span>
            )}
            {loaf.indoorTempMix && (
              <span className="ml-2">• {loaf.indoorTempMix}°F inside</span>
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
                  loaf.starterFedDate && loaf.starterFedDate !== loafDateStr
                    ? getMinutesBetweenWithDates(
                        loaf.starterFedTime,
                        loaf.starterFedDate,
                        loaf.initialMixTime,
                        loafDateStr,
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
              <span className="ml-2">• {loaf.mixIndoorTemp}°F inside</span>
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
                <span className="text-slate-500 w-16">{displayName}</span>
                <span className="text-slate-900">
                  {ing.grams}g{ing.details && ` ${ing.details}`}
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
          <span className="text-slate-500 text-sm">Stretch & Folds</span>
          <div className="flex flex-col items-start gap-2 mt-1">
            {loaf.stretchFolds.map((fold, idx) => {
              const foldTime = typeof fold === "string" ? fold : fold.time;
              const foldIndoorTemp =
                typeof fold === "string" ? undefined : fold.indoorTemp;
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
          const bakeEvent = loaf.bakeEvents?.[0];
          const bakeStart = bakeEvent?.time;
          const bakeDate = bakeEvent?.date || loafDateStr;

          const mixToSecondProof =
            loaf.initialMixTime && loaf.secondProofTime
              ? getMinutesBetween(loaf.initialMixTime, loaf.secondProofTime)
              : null;

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

          const secondProofDuration =
            loaf.secondProofTime && bakeStart
              ? getMinutesBetweenWithDates(
                  loaf.secondProofTime,
                  loafDateStr,
                  bakeStart,
                  bakeDate,
                )
              : null;

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
                      {firstProofDuration && firstProofDuration > 0 && (
                        <span className="text-slate-400 text-xs ml-1">
                          — {formatDuration(firstProofDuration)}
                        </span>
                      )}
                      {mixToSecondProof && mixToSecondProof > 0 && (
                        <span className="text-slate-400 text-xs ml-1">
                          ({formatDuration(mixToSecondProof)} since mix)
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
                      {secondProofDuration && secondProofDuration > 0 && (
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
          const getEventDate = (event: BakeEvent) => event.date || loafDateStr;
          const endDate = loaf.bakeEndDate || loafDateStr;

          const totalDuration = loaf.bakeEndTime
            ? getMinutesBetweenWithDates(
                events[0].time,
                getEventDate(events[0]),
                loaf.bakeEndTime,
                endDate,
              )
            : null;

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
                  <span className="text-slate-400 ml-1">(next day)</span>
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
                    idx < events.length - 1 ? events[idx + 1] : null;
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
              ? (loaf.crossSectionHeight / loaf.crossSectionWidth).toFixed(2)
              : null;
          return (
            <div>
              <span className="text-slate-500 text-sm">Cross Section</span>
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
          <p className="text-slate-700 text-sm mt-1">{loaf.notes}</p>
        </div>
      )}

      {/* Photos */}
      {loaf.imageUrls && loaf.imageUrls.length > 0 && (
        <PhotosSection imageUrls={loaf.imageUrls} loafNumber={loafNumber} />
      )}
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

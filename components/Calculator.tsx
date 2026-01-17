"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";

export function Calculator() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [answer, setAnswer] = useState(0);
  const [result, setResult] = useState<number>();
  const [validEquation, setValidEquation] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [clickedValues, setClickedValues] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNumbers = () => {
    setLoading(true);
    fetch("/api/krypto/random-numbers")
      .then((res) => res.json())
      .then((data) => {
        setNumbers(data.numbers ?? []);
        setAnswer(data.answer ?? 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    setUserInput("");
    setClickedValues([]);
    setUsedIndices([]);
    setValidEquation(true);
    setResult(undefined);
  };

  const isEnterEnabled = () => {
    const clickedNumbersCount = numbers.filter((num) =>
      clickedValues.includes(num.toString())
    ).length;

    return clickedNumbersCount === numbers.length;
  };

  const handleItemClick = async (
    value: string,
    isClicked: boolean,
    index: number
  ) => {
    if (value === "Clear") {
      setUserInput("");
      setClickedValues([]);
      setUsedIndices([]);
      setResult(undefined);
      setValidEquation(true);
    } else if (value === "Del") {
      if (clickedValues.length > 0) {
        const lastClickedValue = clickedValues[clickedValues.length - 1];
        const lengthOfLastClicked = -1 * lastClickedValue.toString().length;

        setUserInput((prev) =>
          prev.trimEnd().slice(0, lengthOfLastClicked).trimEnd()
        );

        setClickedValues((prev) => prev.slice(0, -1));
        const lastClickedIsNumber =
          clickedValues.length > 0 &&
          !isNaN(Number(clickedValues[clickedValues.length - 1]));
        if (lastClickedIsNumber) {
          setUsedIndices((prev) => prev.slice(0, -1));
        }
      }
      setResult(undefined);
      setValidEquation(true);
    } else if (value !== "Enter") {
      if (value === ")" || clickedValues[clickedValues.length - 1] === "(") {
        !isClicked && setClickedValues((prev) => [...prev, value]);
        !isClicked && setUserInput((prev) => prev + value);
        if (!isClicked && index < 5) {
          setUsedIndices((prev) => [...prev, index]);
        }
        if (value === "√") {
          setClickedValues((prev) => [...prev, "("]);
          setUserInput((prev) => prev + "(");
        }
      } else {
        !isClicked && setClickedValues((prev) => [...prev, value]);
        !isClicked && setUserInput((prev) => prev + " " + value);
        if (!isClicked && index < 5) {
          setUsedIndices((prev) => [...prev, index]);
        }
        if (value === "√") {
          setClickedValues((prev) => [...prev, "("]);
          setUserInput((prev) => prev + "(");
        }
      }
    } else {
      if (isEnterEnabled()) {
        try {
          const response = await fetch("/api/krypto/submit-answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer: clickedValues }),
          });
          const data = await response.json();
          if (data["validString"]) {
            setResult(data["answer"]);
            setValidEquation(true);
          } else {
            setValidEquation(false);
            setResult(undefined);
          }
        } catch (err) {
          console.error("Error submitting answer:", err);
        }
      }
    }
  };

  useEffect(() => {
    fetchNumbers();
  }, []);

  const itemsWithNumbers = items.map((item, idx) => {
    return { ...item, title: numbers[idx] ?? item.title };
  });

  return (
    <div className="w-full max-w-md mx-auto flex-col px-2 sm:px-4">
      <p
        className={cn(
          "mb-3 sm:mb-4 text-4xl sm:text-6xl font-bold text-center text-gray-800",
          loading ? "invisible" : ""
        )}
      >
        {answer}
      </p>
      <p
        className={cn(
          "mb-2 text-xs sm:text-sm font-semibold text-center h-5",
          validEquation ? "invisible" : "text-red-500"
        )}
      >
        Invalid Equation
      </p>

      <div className="flex flex-row items-center gap-2 mb-3 sm:mb-4">
        <input
          type="text"
          readOnly
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="border border-gray-300 px-2 sm:px-3 py-2 rounded-lg flex-1 bg-white text-gray-800 text-sm sm:text-base min-w-0"
        />
        <p className="text-lg sm:text-xl font-semibold text-gray-600">=</p>
        <p
          className={cn(
            "text-lg sm:text-xl font-semibold min-w-12.5 sm:min-w-15",
            result !== undefined && result === answer
              ? "text-green-500"
              : "text-red-500"
          )}
        >
          {result !== undefined ? result : ""}
        </p>
      </div>

      <BentoGrid className="w-full">
        {itemsWithNumbers.map((item, i) => {
          const value = item.title;
          const isClicked = usedIndices.includes(i);

          return (
            <BentoGridItem
              key={i}
              title={item.title}
              className={cn(
                item.className,
                isClicked &&
                  "bg-gray-300 opacity-50 hover:bg-gray-300 active:bg-gray-300 cursor-not-allowed",
                value.toString() === "Enter" && !isEnterEnabled()
                  ? "bg-gray-300 opacity-50 hover:bg-gray-300 active:bg-gray-300 cursor-not-allowed"
                  : ""
              )}
              onClick={() => handleItemClick(value.toString(), isClicked, i)}
            />
          );
        })}
      </BentoGrid>

      <div className="flex justify-center mt-4 sm:mt-6">
        <button
          onClick={fetchNumbers}
          className="px-5 sm:px-6 py-2 rounded-lg sm:rounded-xl border border-gray-300 text-gray-800 bg-white hover:bg-gray-50 active:bg-gray-100 transition duration-200 font-medium text-sm sm:text-base"
        >
          Refresh Numbers
        </button>
      </div>
    </div>
  );
}

const items = [
  { title: "", className: "col-span-1" },
  { title: "", className: "col-span-1" },
  { title: "", className: "col-span-1" },
  { title: "", className: "col-span-1" },
  { title: "", className: "col-span-1" },
  { title: "(", className: "col-span-1" },
  { title: ")", className: "col-span-1" },
  { title: "+", className: "col-span-1" },
  { title: "-", className: "col-span-1" },
  { title: "/", className: "col-span-1" },
  { title: "×", className: "col-span-1" },
  { title: "√", className: "col-span-1" },
  { title: "^", className: "col-span-1" },
  { title: "!", className: "col-span-1" },
  { title: "Del", className: "col-span-1" },
  { title: "Clear", className: "col-span-2" },
  { title: "Enter", className: "col-span-3" },
];

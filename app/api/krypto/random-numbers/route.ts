import { NextResponse } from "next/server";

function generateNumbers(): { numbers: number[]; answer: number } {
  // Weighted pool: lower numbers appear more frequently (matches original Python logic)
  const possibleNumbers = [
    1, 2, 3, 4, 5, 6,       // 1-6 appear 3 times each
    1, 2, 3, 4, 5, 6,
    1, 2, 3, 4, 5, 6,
    7, 8, 9, 10,            // 7-10 appear 4 times each
    7, 8, 9, 10,
    7, 8, 9, 10,
    7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17,  // 11-17 appear 2 times each
    11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24, 25,  // 18-25 appear once
  ];

  // Shuffle the array
  for (let i = possibleNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [possibleNumbers[i], possibleNumbers[j]] = [possibleNumbers[j], possibleNumbers[i]];
  }

  // Pop 5 numbers for the puzzle and 1 for the answer
  const numbers = possibleNumbers.splice(0, 5);
  const answer = possibleNumbers[0];

  return { numbers, answer };
}

export async function GET() {
  const { numbers, answer } = generateNumbers();
  return NextResponse.json({ numbers, answer });
}

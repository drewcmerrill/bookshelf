import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch a random Jeopardy clue
    const clueResp = await fetch("https://jepp.app/api/clue?random=true&limit=1");
    if (!clueResp.ok) {
      throw new Error("Failed to fetch clue");
    }
    const clueData = await clueResp.json();
    const clue = clueData[0];
    const categoryId = clue.categoryId;

    // Fetch the category name
    const categoryResp = await fetch(`https://jepp.app/api/category?id=${categoryId}&limit=1`);
    if (!categoryResp.ok) {
      throw new Error("Failed to fetch category");
    }
    const categoryData = await categoryResp.json();
    const category = categoryData[0]?.name;

    return NextResponse.json({
      question: clue.question,
      answer: clue.answer,
      category: category,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

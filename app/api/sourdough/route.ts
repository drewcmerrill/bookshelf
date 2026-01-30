import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const loaves = await prisma.sourdoughLoaf.findMany({
      orderBy: { date: "desc" },
      include: {
        ingredients: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ loaves });
  } catch (error) {
    console.error("Error fetching sourdough loaves:", error);
    return NextResponse.json(
      { error: "Failed to fetch loaves" },
      { status: 500 }
    );
  }
}

type IngredientInput = {
  name: string;
  grams: number;
  details?: string | null;
  proteinContent?: number | null;
  sortOrder?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.starterFedTime) {
      return NextResponse.json(
        { error: "Starter fed time is required" },
        { status: 400 }
      );
    }

    const loaf = await prisma.sourdoughLoaf.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        starterFedTime: body.starterFedTime,
        starterFedDate: body.starterFedDate || null,
        initialMixTime: body.initialMixTime || null,
        temperature: body.temperature || null,
        // Legacy fields - still supported for backwards compatibility
        flourGrams: body.flourGrams || null,
        flourType: body.flourType || null,
        waterGrams: body.waterGrams || null,
        starterGrams: body.starterGrams || null,
        stretchFolds: body.stretchFolds || [],
        notes: body.notes || null,
        // New ingredients relationship
        ingredients: body.ingredients
          ? {
              create: (body.ingredients as IngredientInput[]).map(
                (ing, index) => ({
                  name: ing.name,
                  grams: ing.grams,
                  details: ing.details || null,
                  proteinContent: ing.proteinContent || null,
                  sortOrder: ing.sortOrder ?? index,
                })
              ),
            }
          : undefined,
      },
      include: {
        ingredients: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    revalidatePath("/sourdough");

    return NextResponse.json(loaf, { status: 201 });
  } catch (error) {
    console.error("Error creating sourdough loaf:", error);
    return NextResponse.json(
      { error: "Failed to create loaf" },
      { status: 500 }
    );
  }
}

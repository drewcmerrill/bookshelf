import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const loaves = await prisma.sourdoughLoaf.findMany({
      orderBy: { date: "desc" },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      !body.initialMixTime ||
      !body.flourGrams ||
      !body.flourType ||
      !body.waterGrams ||
      !body.starterGrams
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const loaf = await prisma.sourdoughLoaf.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        initialMixTime: body.initialMixTime,
        flourGrams: body.flourGrams,
        flourType: body.flourType,
        waterGrams: body.waterGrams,
        starterGrams: body.starterGrams,
        stretchFolds: body.stretchFolds || [],
        notes: body.notes || null,
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

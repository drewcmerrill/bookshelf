import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const loaf = await prisma.sourdoughLoaf.findUnique({
      where: { id: parseInt(id) },
    });

    if (!loaf) {
      return NextResponse.json({ error: "Loaf not found" }, { status: 404 });
    }

    return NextResponse.json(loaf);
  } catch (error) {
    console.error("Error fetching loaf:", error);
    return NextResponse.json(
      { error: "Failed to fetch loaf" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const loaf = await prisma.sourdoughLoaf.update({
      where: { id: parseInt(id) },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        initialMixTime: body.initialMixTime,
        flourGrams: body.flourGrams,
        flourType: body.flourType,
        waterGrams: body.waterGrams,
        starterGrams: body.starterGrams,
        stretchFolds: body.stretchFolds,
        firstProofTime: body.firstProofTime,
        secondProofTime: body.secondProofTime,
        bakeEvents: body.bakeEvents,
        notes: body.notes,
      },
    });

    revalidatePath("/sourdough");

    return NextResponse.json(loaf);
  } catch (error) {
    console.error("Error updating loaf:", error);
    return NextResponse.json(
      { error: "Failed to update loaf" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.sourdoughLoaf.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/sourdough");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting loaf:", error);
    return NextResponse.json(
      { error: "Failed to delete loaf" },
      { status: 500 }
    );
  }
}

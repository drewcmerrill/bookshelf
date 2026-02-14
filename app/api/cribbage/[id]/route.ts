import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const game = await prisma.cribbageGame.findUnique({
      where: { id: parseInt(id) },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
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

    const game = await prisma.cribbageGame.update({
      where: { id: parseInt(id) },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        drewScore: body.drewScore !== undefined ? parseInt(body.drewScore) : undefined,
        aliScore: body.aliScore !== undefined ? parseInt(body.aliScore) : undefined,
        coffeeShop: body.coffeeShop,
        coffeeBuyer: body.coffeeBuyer,
        drewCoffeeRating: body.drewCoffeeRating !== undefined
          ? body.drewCoffeeRating === null
            ? null
            : parseFloat(body.drewCoffeeRating)
          : undefined,
        aliCoffeeRating: body.aliCoffeeRating !== undefined
          ? body.aliCoffeeRating === null
            ? null
            : parseFloat(body.aliCoffeeRating)
          : undefined,
        drewAmbianceRating: body.drewAmbianceRating !== undefined
          ? body.drewAmbianceRating === null
            ? null
            : parseFloat(body.drewAmbianceRating)
          : undefined,
        aliAmbianceRating: body.aliAmbianceRating !== undefined
          ? body.aliAmbianceRating === null
            ? null
            : parseFloat(body.aliAmbianceRating)
          : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        firstCrib: body.firstCrib !== undefined ? body.firstCrib : undefined,
      },
    });

    revalidatePath("/cribbage");

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
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

    await prisma.cribbageGame.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/cribbage");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    );
  }
}

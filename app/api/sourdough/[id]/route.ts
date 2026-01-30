import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

type IngredientInput = {
  id?: number;
  name: string;
  grams: number;
  details?: string | null;
  proteinContent?: number | null;
  sortOrder?: number;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const loaf = await prisma.sourdoughLoaf.findUnique({
      where: { id: parseInt(id) },
      include: {
        ingredients: {
          orderBy: { sortOrder: "asc" },
        },
      },
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
    const loafId = parseInt(id);
    const body = await request.json();

    // If updating imageUrls, delete any removed images from blob storage
    if (body.imageUrls !== undefined) {
      const existingLoaf = await prisma.sourdoughLoaf.findUnique({
        where: { id: loafId },
        select: { imageUrls: true },
      });
      const oldUrls = (existingLoaf?.imageUrls as string[] | null) || [];
      const newUrls = (body.imageUrls as string[]) || [];

      // Find URLs that were removed
      const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));
      for (const url of removedUrls) {
        if (url.includes("blob.vercel-storage.com")) {
          try {
            await del(url);
          } catch (blobError) {
            console.error("Error deleting blob image:", blobError);
          }
        }
      }
    }

    // Handle ingredients update if provided
    if (body.ingredients !== undefined) {
      const newIngredients = body.ingredients as IngredientInput[];

      // Get existing ingredient IDs
      const existingIngredients = await prisma.sourdoughIngredient.findMany({
        where: { loafId },
        select: { id: true },
      });
      const existingIds = existingIngredients.map((i) => i.id);

      // Determine which ingredients to update, create, or delete
      const newIds = newIngredients.filter((i) => i.id).map((i) => i.id!);
      const idsToDelete = existingIds.filter((id) => !newIds.includes(id));

      // Delete removed ingredients
      if (idsToDelete.length > 0) {
        await prisma.sourdoughIngredient.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      // Update or create ingredients
      for (let i = 0; i < newIngredients.length; i++) {
        const ing = newIngredients[i];
        if (ing.id && existingIds.includes(ing.id)) {
          // Update existing
          await prisma.sourdoughIngredient.update({
            where: { id: ing.id },
            data: {
              name: ing.name,
              grams: ing.grams,
              details: ing.details || null,
              proteinContent: ing.proteinContent || null,
              sortOrder: ing.sortOrder ?? i,
            },
          });
        } else {
          // Create new
          await prisma.sourdoughIngredient.create({
            data: {
              loafId,
              name: ing.name,
              grams: ing.grams,
              details: ing.details || null,
              proteinContent: ing.proteinContent || null,
              sortOrder: ing.sortOrder ?? i,
            },
          });
        }
      }
    }

    const loaf = await prisma.sourdoughLoaf.update({
      where: { id: loafId },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        starterFedTime: body.starterFedTime,
        starterFedDate: body.starterFedDate,
        initialMixTime: body.initialMixTime,
        mixIndoorTemp: body.mixIndoorTemp,
        temperature: body.temperature,
        indoorTempMix: body.indoorTempMix,
        imageUrls: body.imageUrls,
        flourGrams: body.flourGrams,
        flourType: body.flourType,
        waterGrams: body.waterGrams,
        starterGrams: body.starterGrams,
        stretchFolds: body.stretchFolds,
        firstProofTime: body.firstProofTime,
        firstProofLocation: body.firstProofLocation,
        firstProofIndoorTemp: body.firstProofIndoorTemp,
        secondProofTime: body.secondProofTime,
        secondProofLocation: body.secondProofLocation,
        secondProofIndoorTemp: body.secondProofIndoorTemp,
        dutchOven: body.dutchOven,
        bakeEvents: body.bakeEvents,
        bakeEndTime: body.bakeEndTime,
        bakeEndDate: body.bakeEndDate,
        crossSectionWidth: body.crossSectionWidth,
        crossSectionHeight: body.crossSectionHeight,
        notes: body.notes,
      },
      include: {
        ingredients: {
          orderBy: { sortOrder: "asc" },
        },
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

    // Get the loaf to check for images
    const loaf = await prisma.sourdoughLoaf.findUnique({
      where: { id: parseInt(id) },
      select: { imageUrls: true },
    });

    // Delete all images from blob storage
    const imageUrls = (loaf?.imageUrls as string[] | null) || [];
    for (const url of imageUrls) {
      if (url.includes("blob.vercel-storage.com")) {
        try {
          await del(url);
        } catch (blobError) {
          console.error("Error deleting blob image:", blobError);
        }
      }
    }

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

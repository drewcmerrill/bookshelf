import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

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

    // If updating imageUrls, delete any removed images from blob storage
    if (body.imageUrls !== undefined) {
      const existingLoaf = await prisma.sourdoughLoaf.findUnique({
        where: { id: parseInt(id) },
        select: { imageUrls: true },
      });
      const oldUrls = (existingLoaf?.imageUrls as string[] | null) || [];
      const newUrls = (body.imageUrls as string[]) || [];

      // Find URLs that were removed
      const removedUrls = oldUrls.filter(url => !newUrls.includes(url));
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

    const loaf = await prisma.sourdoughLoaf.update({
      where: { id: parseInt(id) },
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

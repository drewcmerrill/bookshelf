import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const loafId = formData.get("loafId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!loafId) {
      return NextResponse.json({ error: "No loaf ID provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/webp", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: WebP, PNG, JPG" },
        { status: 400 }
      );
    }

    // Generate filename using loaf ID and timestamp for uniqueness
    const extension = file.name.split(".").pop() || "webp";
    const timestamp = Date.now();
    const filename = `sourdough/loaf_${loafId}_${timestamp}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Error uploading sourdough image:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

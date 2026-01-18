import { put } from "@vercel/blob";
import { prisma } from "../lib/prisma";
import { readdir, readFile } from "fs/promises";
import path from "path";

async function migrateImages() {
  const booksDir = path.join(process.cwd(), "public", "books");

  console.log("Starting image migration to Vercel Blob...\n");

  // Get all files in public/books
  const files = await readdir(booksDir);
  const imageFiles = files.filter((f) =>
    [".webp", ".png", ".jpg", ".jpeg"].some((ext) => f.toLowerCase().endsWith(ext))
  );

  console.log(`Found ${imageFiles.length} images to migrate\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const filename of imageFiles) {
    const localPath = `books/${filename}`;

    try {
      // Check if any book uses this image
      const book = await prisma.book.findFirst({
        where: { img: localPath },
      });

      if (!book) {
        console.log(`⏭️  Skipping ${filename} - no matching book in database`);
        skipped++;
        continue;
      }

      // Read the file
      const filePath = path.join(booksDir, filename);
      const fileBuffer = await readFile(filePath);

      // Determine content type
      const ext = path.extname(filename).toLowerCase();
      const contentType =
        ext === ".webp" ? "image/webp" :
        ext === ".png" ? "image/png" :
        ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
        "application/octet-stream";

      // Upload to Vercel Blob
      const blob = await put(`books/${filename}`, fileBuffer, {
        access: "public",
        contentType,
      });

      // Update database record
      await prisma.book.update({
        where: { id: book.id },
        data: { img: blob.url },
      });

      console.log(`✅ Migrated: ${filename}`);
      console.log(`   Book: "${book.title}"`);
      console.log(`   New URL: ${blob.url}\n`);
      migrated++;
    } catch (error) {
      console.error(`❌ Error migrating ${filename}:`, error);
      errors++;
    }
  }

  console.log("\n--- Migration Complete ---");
  console.log(`✅ Migrated: ${migrated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);

  await prisma.$disconnect();
}

migrateImages().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});

import { prisma } from "../lib/prisma";

const BLOB_BASE_URL = "https://y51fbmmbyazhalxk.public.blob.vercel-storage.com";

async function updateImageUrls() {
  console.log("Updating image URLs in database...\n");

  // Get all books with local image paths (not starting with http)
  const books = await prisma.book.findMany({
    where: {
      img: {
        not: {
          startsWith: "http",
        },
      },
    },
  });

  console.log(`Found ${books.length} books with local image paths\n`);

  let updated = 0;
  let errors = 0;

  for (const book of books) {
    try {
      // Convert local path to blob URL
      // local: books/Title.webp -> blob: https://xxx.blob.vercel-storage.com/books/Title.webp
      const filename = book.img.replace("books/", "");
      const encodedFilename = encodeURIComponent(filename).replace(/%20/g, " ");
      const blobUrl = `${BLOB_BASE_URL}/books/${encodedFilename}`;

      await prisma.book.update({
        where: { id: book.id },
        data: { img: blobUrl },
      });

      console.log(`✅ Updated: "${book.title}"`);
      console.log(`   ${book.img} -> ${blobUrl}\n`);
      updated++;
    } catch (error) {
      console.error(`❌ Error updating "${book.title}":`, error);
      errors++;
    }
  }

  console.log("\n--- Update Complete ---");
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Errors: ${errors}`);

  await prisma.$disconnect();
}

updateImageUrls().catch((error) => {
  console.error("Update failed:", error);
  process.exit(1);
});

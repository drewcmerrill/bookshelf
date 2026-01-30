/**
 * One-time migration script to move legacy ingredient fields to the new SourdoughIngredient table.
 * Run with: npx tsx scripts/migrate-sourdough-ingredients.ts
 */

import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting ingredient migration...");

  // Get all loaves that have legacy ingredient data
  const loaves = await prisma.sourdoughLoaf.findMany({
    where: {
      OR: [
        { flourGrams: { not: null } },
        { waterGrams: { not: null } },
        { starterGrams: { not: null } },
      ],
    },
    include: {
      ingredients: true,
    },
  });

  console.log(`Found ${loaves.length} loaves with legacy ingredient data`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const loaf of loaves) {
    // Skip if this loaf already has ingredients in the new table
    if (loaf.ingredients.length > 0) {
      console.log(`Loaf ${loaf.id}: Already has ingredients, skipping`);
      skippedCount++;
      continue;
    }

    const ingredientsToCreate = [];
    let sortOrder = 0;

    // Migrate flour
    if (loaf.flourGrams) {
      ingredientsToCreate.push({
        loafId: loaf.id,
        name: "flour",
        grams: loaf.flourGrams,
        details: loaf.flourType || null,
        proteinContent: null,
        sortOrder: sortOrder++,
      });
    }

    // Migrate water
    if (loaf.waterGrams) {
      ingredientsToCreate.push({
        loafId: loaf.id,
        name: "water",
        grams: loaf.waterGrams,
        details: null,
        proteinContent: null,
        sortOrder: sortOrder++,
      });
    }

    // Migrate starter
    if (loaf.starterGrams) {
      ingredientsToCreate.push({
        loafId: loaf.id,
        name: "starter",
        grams: loaf.starterGrams,
        details: null,
        proteinContent: null,
        sortOrder: sortOrder++,
      });
    }

    if (ingredientsToCreate.length > 0) {
      await prisma.sourdoughIngredient.createMany({
        data: ingredientsToCreate,
      });
      console.log(
        `Loaf ${loaf.id}: Migrated ${ingredientsToCreate.length} ingredients`
      );
      migratedCount++;
    }
  }

  console.log("\nMigration complete!");
  console.log(`Migrated: ${migratedCount} loaves`);
  console.log(`Skipped: ${skippedCount} loaves (already had ingredients)`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  });

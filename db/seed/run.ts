import "dotenv/config";
import { db } from "../client";
import { brands, categories } from "../schema";
import { GLOBAL_BRANDS, GLOBAL_CATALOG } from "@/lib/catalog/global-catalog";

/**
 * Seeds global reference data (brands + categories) so onboarding's
 * "Choose Brands" step and product library have real DB-backed rows,
 * not just the static catalog constant. Safe to re-run — skips existing rows.
 *
 * Usage: npm run db:seed
 */
async function main() {
  console.log("Seeding global brands...");
  for (const brand of GLOBAL_BRANDS) {
    await db.insert(brands).values({ name: brand.name, slug: brand.slug, isGlobal: true }).onDuplicateKeyUpdate({
      set: { name: brand.name },
    });
  }

  console.log("Seeding global categories...");
  const uniqueCategories = [...new Set(GLOBAL_CATALOG.map((p) => p.category))];
  for (const name of uniqueCategories) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await db.insert(categories).values({ name, slug, isGlobal: "true" }).onDuplicateKeyUpdate({ set: { name } });
  }

  console.log(`Seeded ${GLOBAL_BRANDS.length} brands and ${uniqueCategories.length} categories.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

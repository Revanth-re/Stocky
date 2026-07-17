import { and, eq, or, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { suppliers, categories, brands } from "@/db/schema";
import type { SupplierInput, CategoryInput, BrandInput } from "@/validators/catalog";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function listSuppliers(storeId: string) {
  return db.query.suppliers.findMany({ where: eq(suppliers.storeId, storeId), orderBy: (s, { asc }) => asc(s.name) });
}

export async function createSupplier(storeId: string, input: SupplierInput) {
  const [created] = await db
    .insert(suppliers)
    .values({
      storeId,
      name: input.name,
      contactPerson: input.contactPerson || null,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      gstNumber: input.gstNumber || null,
    })
    .$returningId();
  return created!.id;
}

export async function listCategories(storeId: string) {
  return db.query.categories.findMany({
    where: or(eq(categories.storeId, storeId), isNull(categories.storeId)),
    orderBy: (c, { asc }) => asc(c.name),
  });
}

export async function createCategory(storeId: string, input: CategoryInput) {
  const [created] = await db
    .insert(categories)
    .values({ storeId, name: input.name, slug: slugify(input.name), icon: input.icon || null, isGlobal: "false" })
    .$returningId();
  return created!.id;
}

export async function listBrands() {
  return db.query.brands.findMany({ orderBy: (b, { asc }) => asc(b.name) });
}

export async function createBrand(storeId: string, input: BrandInput) {
  const [created] = await db
    .insert(brands)
    .values({ name: input.name, slug: slugify(input.name), isGlobal: false, storeId })
    .$returningId();
  return created!.id;
}

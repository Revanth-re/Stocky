import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { products, sales, saleItems, activityLogs } from "@/db/schema";
import type { SalesImportRow } from "@/validators/sales-import";

export type SalesImportResult = {
  imported: number;
  skipped: number;
  skippedRows: { row: number; reason: string }[];
};

/**
 * Bulk-imports historical sales from an uploaded spreadsheet so the AI
 * forecast has more real history to work with than just what's been
 * recorded through the Sales module. Each row becomes its own backdated
 * `sales` + `sale_items` pair (dated from the row, not "today").
 *
 * Deliberately does NOT touch current `inventory` quantities — this is
 * historical backfill of stock that was already sold before the row's
 * date, not a live transaction, so it must not reduce today's stock.
 */
export async function importSalesHistory(storeId: string, userId: string, rows: SalesImportRow[]): Promise<SalesImportResult> {
  const storeProducts = await db
    .select({ id: products.id, name: products.name, sku: products.sku, sellingPrice: products.sellingPrice })
    .from(products)
    .where(eq(products.storeId, storeId));

  const bySku = new Map(storeProducts.map((p) => [p.sku.toLowerCase(), p]));
  const byName = new Map(storeProducts.map((p) => [p.name.toLowerCase(), p]));

  const result: SalesImportResult = { imported: 0, skipped: 0, skippedRows: [] };
  const salesToInsert: (typeof sales.$inferInsert)[] = [];
  const itemsToInsert: (typeof saleItems.$inferInsert)[] = [];

  let sequence = await nextImportSequence(storeId);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const rowNumber = i + 2; // +1 for 0-index, +1 for header row

    const parsedDate = new Date(row.date);
    if (Number.isNaN(parsedDate.getTime())) {
      result.skipped++;
      result.skippedRows.push({ row: rowNumber, reason: `Could not parse date "${row.date}"` });
      continue;
    }

    const product =
      (row.sku && bySku.get(row.sku.toLowerCase())) ||
      (row.productName && byName.get(row.productName.toLowerCase()));

    if (!product) {
      result.skipped++;
      result.skippedRows.push({
        row: rowNumber,
        reason: `No matching product for "${row.sku || row.productName || "unknown"}"`,
      });
      continue;
    }

    const unitPrice = row.unitPrice ?? Number(product.sellingPrice);
    const lineTotal = unitPrice * row.quantity;
    const saleId = nanoid();

    salesToInsert.push({
      id: saleId,
      storeId,
      invoiceNumber: `IMPORT-${String(sequence).padStart(5, "0")}`,
      soldById: userId,
      subtotal: lineTotal.toFixed(2),
      discountAmount: "0.00",
      taxAmount: "0.00",
      totalAmount: lineTotal.toFixed(2),
      paymentMethod: "cash",
      status: "completed",
      createdAt: parsedDate,
      updatedAt: parsedDate,
    });

    itemsToInsert.push({
      id: nanoid(),
      saleId,
      productId: product.id,
      quantity: row.quantity,
      unitPrice: unitPrice.toFixed(2),
      discountAmount: "0.00",
      lineTotal: lineTotal.toFixed(2),
    });

    sequence++;
    result.imported++;
  }

  if (salesToInsert.length > 0) {
    await db.insert(sales).values(salesToInsert);
    await db.insert(saleItems).values(itemsToInsert);
    await db.insert(activityLogs).values({
      storeId,
      userId,
      entityType: "sale",
      entityId: "bulk-import",
      action: "created",
      description: `Imported ${result.imported} historical sales from a spreadsheet (${result.skipped} rows skipped)`,
      metadata: { skippedCount: result.skipped },
      createdAt: new Date(),
    });
  }

  return result;
}

async function nextImportSequence(storeId: string) {
  const [countRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sales)
    .where(and(eq(sales.storeId, storeId), sql`${sales.invoiceNumber} like 'IMPORT-%'`));
  return Number(countRow?.count ?? 0) + 1;
}

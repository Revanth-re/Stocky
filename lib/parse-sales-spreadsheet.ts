import * as XLSX from "xlsx";
import type { SalesImportRow } from "@/validators/sales-import";

const HEADER_ALIASES: Record<string, keyof SalesImportRow> = {
  date: "date",
  "sale date": "date",
  "transaction date": "date",
  product: "productName",
  "product name": "productName",
  item: "productName",
  sku: "sku",
  "product sku": "sku",
  "product code": "sku",
  quantity: "quantity",
  qty: "quantity",
  units: "quantity",
  "unit price": "unitPrice",
  price: "unitPrice",
  rate: "unitPrice",
};

function normalizeHeader(header: string) {
  return header.trim().toLowerCase();
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").trim();
}

/**
 * Parses a CSV or Excel file (client-side, no upload to a server just to
 * parse) into rows matching `SalesImportRow`. Recognizes common header
 * variants (Date/Sale Date, Product/Item, SKU, Quantity/Qty, Unit Price/Price).
 */
export async function parseSalesSpreadsheet(file: File): Promise<{ rows: Partial<SalesImportRow>[]; unrecognizedHeaders: string[] }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { rows: [], unrecognizedHeaders: [] };

  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) return { rows: [], unrecognizedHeaders: [] };
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const unrecognizedHeaders = new Set<string>();
  const rows: Partial<SalesImportRow>[] = rawRows.map((raw) => {
    const row: Partial<SalesImportRow> = {};
    for (const [header, value] of Object.entries(raw)) {
      const key = HEADER_ALIASES[normalizeHeader(header)];
      if (!key) {
        if (header.trim()) unrecognizedHeaders.add(header);
        continue;
      }
      if (key === "date") row.date = toIsoDate(value);
      else if (key === "quantity") row.quantity = Number(value);
      else if (key === "unitPrice") row.unitPrice = value === "" ? undefined : Number(value);
      else row[key] = String(value);
    }
    return row;
  });

  return { rows, unrecognizedHeaders: Array.from(unrecognizedHeaders) };
}

/** Downloadable starter template so users know the expected column headers. */
export function downloadSalesImportTemplate() {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Date", "Product", "SKU", "Quantity", "Unit Price"],
    ["2026-06-01", "Amul Milk Packet 500ml", "AMUL-MILK-500", 5, 32],
    ["2026-06-01", "Parle-G Biscuit 100g", "PARLE-G-100G", 12, 10],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales History");
  XLSX.writeFile(workbook, "sales-import-template.xlsx");
}

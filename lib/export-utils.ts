import type { ReportColumn, ReportResult } from "@/types/report";

function toCsv(columns: ReportColumn[], rows: ReportResult["rows"]) {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows
    .map((row) => columns.map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Exports report rows as a real CSV file. */
export function exportReportAsCsv(report: ReportResult, filename: string) {
  downloadBlob(toCsv(report.columns, report.rows), `${filename}.csv`, "text/csv;charset=utf-8;");
}

/**
 * Exports as an Excel-compatible file. Uses CSV under an .xls extension —
 * Excel opens this natively — avoiding an extra binary-spreadsheet dependency
 * for what is otherwise tabular text data. Swap for a real .xlsx writer
 * (e.g. exceljs) if formatted workbooks are needed later.
 */
export function exportReportAsExcel(report: ReportResult, filename: string) {
  downloadBlob(toCsv(report.columns, report.rows), `${filename}.xls`, "application/vnd.ms-excel");
}

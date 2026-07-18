"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Download, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { parseSalesSpreadsheet, downloadSalesImportTemplate } from "@/lib/parse-sales-spreadsheet";
import { salesImportRowSchema, type SalesImportRow } from "@/validators/sales-import";
import { useImportSales } from "@/features/sales/api/use-import-sales";

type ParsedRow = {
  data: Partial<SalesImportRow>;
  valid: boolean;
  error?: string;
};

export function ImportSalesDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [unrecognizedHeaders, setUnrecognizedHeaders] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportSales();

  const validRows = parsedRows.filter((r) => r.valid).map((r) => r.data as SalesImportRow);
  const invalidCount = parsedRows.length - validRows.length;

  async function handleFile(file: File) {
    setParsing(true);
    setFileName(file.name);
    try {
      const { rows, unrecognizedHeaders } = await parseSalesSpreadsheet(file);
      setUnrecognizedHeaders(unrecognizedHeaders);
      const checked: ParsedRow[] = rows.map((row) => {
        const result = salesImportRowSchema.safeParse(row);
        return result.success
          ? { data: result.data, valid: true }
          : { data: row, valid: false, error: result.error.issues[0]?.message ?? "Invalid row" };
      });
      setParsedRows(checked);
    } catch {
      setParsedRows([]);
      setUnrecognizedHeaders([]);
    } finally {
      setParsing(false);
    }
  }

  function reset() {
    setFileName(null);
    setParsedRows([]);
    setUnrecognizedHeaders([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleImport() {
    if (validRows.length === 0) return;
    await importMutation.mutateAsync(validRows);
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Upload className="size-4" />
            Import Sales History
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import past sales</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file of your last 7–30+ days of sales so the AI forecast can learn from
            real history. Historical rows are recorded as completed sales but won&apos;t change today&apos;s
            stock counts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!fileName && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-10 text-center transition-colors hover:border-primary hover:bg-primary/5"
            >
              <FileSpreadsheet className="size-8 text-muted-foreground" />
              <span className="text-sm font-medium">Click to choose a .csv, .xlsx, or .xls file</span>
              <span className="text-xs text-muted-foreground">Columns: Date, Product, SKU, Quantity, Unit Price</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {fileName && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="size-4 text-muted-foreground" />
                <span className="font-medium">{fileName}</span>
                {!parsing && (
                  <span className="text-xs text-muted-foreground">
                    ({parsedRows.length} row{parsedRows.length === 1 ? "" : "s"} found)
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" className="size-7" onClick={reset}>
                <X className="size-4" />
              </Button>
            </div>
          )}

          <AnimatePresence>
            {parsedRows.length > 0 && !parsing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="success" className="gap-1">
  <CheckCircle2 className="size-3" />
  {validRows.length} ready to import
</Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="size-3" />
                      {invalidCount} skipped (unmatched/invalid)
                    </Badge>
                  )}
                  {unrecognizedHeaders.length > 0 && (
                    <span className="text-muted-foreground">
                      Ignored columns: {unrecognizedHeaders.join(", ")}
                    </span>
                  )}
                </div>

                <div className="max-h-48 overflow-auto rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/60 text-left">
                      <tr>
                        <th className="px-2 py-1.5">Date</th>
                        <th className="px-2 py-1.5">Product / SKU</th>
                        <th className="px-2 py-1.5">Qty</th>
                        <th className="px-2 py-1.5">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 50).map((row, i) => (
                        <tr key={i} className={`border-t border-border ${!row.valid ? "bg-destructive/5 text-muted-foreground" : ""}`}>
                          <td className="px-2 py-1">{row.data.date || "—"}</td>
                          <td className="px-2 py-1">{row.data.sku || row.data.productName || "—"}</td>
                          <td className="px-2 py-1">{row.data.quantity ?? "—"}</td>
                          <td className="px-2 py-1">{row.data.unitPrice ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 50 && (
                    <p className="px-2 py-1.5 text-center text-xs text-muted-foreground">
                      + {parsedRows.length - 50} more rows
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={downloadSalesImportTemplate}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Download className="size-3.5" />
            Download a starter template
          </button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validRows.length === 0 || importMutation.isPending}
            loading={importMutation.isPending}
          >
            Import {validRows.length > 0 ? `${validRows.length} sale${validRows.length === 1 ? "" : "s"}` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

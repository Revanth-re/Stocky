"use client";
import { useState } from "react";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { useReport } from "../api/use-report";
import { exportReportAsCsv, exportReportAsExcel } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { ReportType } from "@/types/report";

const CURRENCY_KEYS = new Set(["revenue", "cost", "profit", "value", "totalAmount", "estimatedOrderAmount"]);

export function ReportView({ type }: { type: ReportType }) {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const { data: report, isLoading } = useReport(type, range);

  function formatCell(key: string, value: string | number) {
    if (typeof value === "number") {
      return CURRENCY_KEYS.has(key) ? formatCurrency(value) : formatNumber(value);
    }
    return value;
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{report?.title ?? "Loading…"}</CardTitle>
          <CardDescription>{report?.description}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
            <TabsList>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="30d">30d</TabsTrigger>
              <TabsTrigger value="90d">90d</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" disabled={!report} onClick={() => report && exportReportAsCsv(report, type)}>
            <Download className="size-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" disabled={!report} onClick={() => report && exportReportAsExcel(report, type)}>
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" /> PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading || !report ? (
          <Skeleton className="m-6 h-64" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {report.columns.map((col) => (
                  <TableHead key={col.key} className={col.align === "right" ? "text-right" : undefined}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={report.columns.length} className="py-10 text-center text-sm text-muted-foreground">
                    No data for this period.
                  </TableCell>
                </TableRow>
              )}
              {report.rows.map((row, index) => (
                <TableRow key={index}>
                  {report.columns.map((col) => (
                    <TableCell key={col.key} className={col.align === "right" ? "text-right" : undefined}>
                      {formatCell(col.key, row[col.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {report.totals && (
                <TableRow className="font-semibold">
                  {report.columns.map((col) => (
                    <TableCell key={col.key} className={col.align === "right" ? "text-right" : undefined}>
                      {report.totals?.[col.key] !== undefined ? formatCell(col.key, report.totals[col.key]) : ""}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

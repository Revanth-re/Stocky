"use client";
import Image from "next/image";
import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { Package, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { STOCK_STATUS_BADGE_VARIANT } from "@/lib/inventory-status";
import type { ProductListRow } from "@/types/product";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    hideOnMobile?: boolean;
  }
}

const columnHelper = createColumnHelper<ProductListRow>();

export function buildInventoryColumns(handlers: { onEdit: (row: ProductListRow) => void; onDelete: (row: ProductListRow) => void; t: (key: string) => string }) {
  const { t } = handlers;
  const STATUS_LABEL_T: Record<ProductListRow["status"], string> = {
    good: t("status.good"),
    medium: t("status.medium"),
    low: t("status.low"),
    critical: t("status.critical"),
    out_of_stock: t("status.outOfStock"),
  };
  return [
    columnHelper.display({
      id: "image",
      header: "",
      cell: ({ row }) => (
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-muted">
          {row.original.imageUrl ? (
            <Image src={row.original.imageUrl} alt={row.original.name} width={40} height={40} className="object-cover" />
          ) : (
            <Package className="size-4 text-muted-foreground" />
          )}
        </div>
      ),
    }),
    columnHelper.accessor("name", {
      header: t("common.product"),
      cell: ({ row }) => (
        <Link href={`/inventory/${row.original.id}` as never} className="font-medium hover:text-primary hover:underline">
          {row.original.name}
        </Link>
      ),
    }),
    columnHelper.accessor("sku", { header: t("common.sku"), meta: { hideOnMobile: true } }),
    columnHelper.accessor("barcode", { header: t("common.barcode"), cell: (info) => info.getValue() ?? "—", meta: { hideOnMobile: true } }),
    columnHelper.accessor("brandName", { header: t("common.brand"), cell: (info) => info.getValue() ?? "—", meta: { hideOnMobile: true } }),
    columnHelper.accessor("categoryName", { header: t("common.category"), cell: (info) => info.getValue() ?? "—", meta: { hideOnMobile: true } }),
    columnHelper.accessor("supplierName", { header: t("common.supplier"), cell: (info) => info.getValue() ?? "—", meta: { hideOnMobile: true } }),
    columnHelper.accessor("purchasePrice", { header: t("common.purchasePrice"), cell: (info) => formatCurrency(info.getValue()), meta: { hideOnMobile: true } }),
    columnHelper.accessor("sellingPrice", { header: t("common.sellingPrice"), cell: (info) => formatCurrency(info.getValue()) }),
    columnHelper.accessor("currentStock", { header: t("common.currentStock") }),
    columnHelper.accessor("minStock", { header: t("common.minimumStock"), meta: { hideOnMobile: true } }),
    columnHelper.accessor("status", {
      header: t("common.status"),
      cell: (info) => (
        <Badge variant={STOCK_STATUS_BADGE_VARIANT[info.getValue()]}>{STATUS_LABEL_T[info.getValue()]}</Badge>
      ),
    }),
    columnHelper.accessor("nearestExpiryDate", {
      header: t("common.expiry"),
      meta: { hideOnMobile: true },
      cell: (info) => {
        const value = info.getValue();
        if (!value) return <span className="text-muted-foreground">—</span>;
        const daysLeft = differenceInCalendarDays(new Date(value), new Date());
        const label = format(new Date(value), "d MMM yyyy");
        if (daysLeft < 0) return <Badge variant="destructive">Expired</Badge>;
        if (daysLeft <= 7) return <Badge variant="destructive">{label} ({daysLeft}d)</Badge>;
        if (daysLeft <= 30) return <Badge variant="warning">{label}</Badge>;
        return <span className="text-sm text-muted-foreground">{label}</span>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Row actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/inventory/${row.original.id}` as never}>
                <Eye className="size-4" /> View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handlers.onEdit(row.original)}>
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handlers.onDelete(row.original)} className="text-destructive">
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];
}

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
import { STOCK_STATUS_LABEL, STOCK_STATUS_BADGE_VARIANT } from "@/lib/inventory-status";
import type { ProductListRow } from "@/types/product";

const columnHelper = createColumnHelper<ProductListRow>();

export function buildInventoryColumns(handlers: { onEdit: (row: ProductListRow) => void; onDelete: (row: ProductListRow) => void }) {
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
      header: "Product",
      cell: ({ row }) => (
        <Link href={`/inventory/${row.original.id}` as never} className="font-medium hover:text-primary hover:underline">
          {row.original.name}
        </Link>
      ),
    }),
    columnHelper.accessor("sku", { header: "SKU" }),
    columnHelper.accessor("barcode", { header: "Barcode", cell: (info) => info.getValue() ?? "—" }),
    columnHelper.accessor("brandName", { header: "Brand", cell: (info) => info.getValue() ?? "—" }),
    columnHelper.accessor("categoryName", { header: "Category", cell: (info) => info.getValue() ?? "—" }),
    columnHelper.accessor("supplierName", { header: "Supplier", cell: (info) => info.getValue() ?? "—" }),
    columnHelper.accessor("purchasePrice", { header: "Purchase Price", cell: (info) => formatCurrency(info.getValue()) }),
    columnHelper.accessor("sellingPrice", { header: "Selling Price", cell: (info) => formatCurrency(info.getValue()) }),
    columnHelper.accessor("currentStock", { header: "Current Stock" }),
    columnHelper.accessor("minStock", { header: "Minimum Stock" }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <Badge variant={STOCK_STATUS_BADGE_VARIANT[info.getValue()]}>{STOCK_STATUS_LABEL[info.getValue()]}</Badge>
      ),
    }),
    columnHelper.accessor("nearestExpiryDate", {
      header: "Expiry",
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

"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { type Column } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-0"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span>{title}</span>
      {sorted === "asc" ? (
        <ArrowUp className="ml-2 size-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 size-4" />
      ) : (
        <ArrowUpDown className="ml-2 size-4" />
      )}
    </Button>
  );
}

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { getPaymentMethodIcon, getPaymentMethodIconKey } from "@/lib/payments/method-icon";
import type { Payment } from "@/hooks/use-payments";

function formatAmount(amount: number): string {
  return `$ ${amount.toFixed(2)}`;
}

function formatDate(createdAt: string): string {
  return createdAt.split("T")[0] ?? createdAt;
}

export const cuentasCorrientesTableColumns: ColumnDef<Payment>[] = [
  {
    id: "budget",
    accessorKey: "budget_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Presupuesto" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/budgets/${row.original.budget_id}/payments`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.budget_number}
      </Link>
    ),
    meta: {
      label: "Presupuesto",
      headerClassName: "w-[20%]",
      cellClassName: "w-[20%]"
    }
  },
  {
    id: "patient",
    accessorFn: (payment) => `${payment.first_name} ${payment.last_name}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Paciente" />,
    meta: { label: "Paciente", headerClassName: "w-[24%]", cellClassName: "w-[24%]" }
  },
  {
    accessorKey: "method",
    header: "Método",
    cell: ({ row }) => {
      const method = row.original.method;
      const MethodIcon = getPaymentMethodIcon(method);
      const iconTestId = getPaymentMethodIconKey(method);

      return (
        <div className="flex items-center gap-2">
          <MethodIcon className="size-4" data-testid={`payment-method-icon-${iconTestId}`} />
          <span>{method}</span>
        </div>
      );
    },
    meta: { label: "Método", headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
    enableSorting: false
  },
  {
    id: "amount",
    accessorFn: (payment) => formatAmount(payment.amount),
    header: "Monto",
    meta: { label: "Monto", headerClassName: "w-[16%]", cellClassName: "w-[16%]" }
  },
  {
    id: "created_at",
    accessorFn: (payment) => formatDate(payment.created_at),
    header: "Fecha",
    meta: { label: "Fecha", headerClassName: "w-[20%]", cellClassName: "w-[20%]" }
  }
];

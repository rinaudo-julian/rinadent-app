import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { LedgerMovement } from "@/components/payments/types/patient-ledger.types";
import { formatCurrencyArs, formatDateEsAr } from "@/lib/formatters";

interface PatientLedgerTableProps {
  rows: LedgerMovement[];
}

export function PatientLedgerTable({ rows }: PatientLedgerTableProps) {
  return (
    <section className="space-y-3" aria-label="Historial de pagos">
      <h2 className="text-xl font-semibold">Historial</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Método</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Sin movimientos para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.method}</TableCell>
                <TableCell>{formatCurrencyArs(row.amount)}</TableCell>
                <TableCell>{formatDateEsAr(row.date)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}

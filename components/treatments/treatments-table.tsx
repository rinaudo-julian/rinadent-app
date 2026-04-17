"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { Treatment } from "@/hooks/use-treatments";

interface TreatmentsTableProps {
  data: {
    items: Treatment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  states: {
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  methods: {
    onPageChange: (page: number) => void;
  };
}

export function TreatmentsTable({ data, states, methods }: TreatmentsTableProps) {
  const { items, total, page, totalPages } = data;
  const { isLoading, isError } = states;

  if (isError) {
    return <div className="text-center p-4 text-red-500">Error al cargar tratamientos</div>;
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Código</TableHead>
              <TableHead>Nombre</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  Cargando tratamientos...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No se encontraron tratamientos
                </TableCell>
              </TableRow>
            ) : (
              items.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell className="font-medium">{treatment.code}</TableCell>
                  <TableCell>{treatment.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Mostrando {items.length} de {total} tratamientos
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => methods.onPageChange(page - 1)}
            disabled={isLoading || page <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">Página {page} de {Math.max(totalPages, 1)}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => methods.onPageChange(page + 1)}
            disabled={isLoading || page >= totalPages || totalPages === 0}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

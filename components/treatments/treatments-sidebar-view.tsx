"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { UseTreatmentsSidebarViewLogicResult } from "@/hooks/useTreatmentsSidebarViewLogic";

const arsPriceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

interface TreatmentsSidebarViewProps {
  logic: UseTreatmentsSidebarViewLogicResult;
}

export function TreatmentsSidebarView({ logic }: TreatmentsSidebarViewProps) {
  const { data, states, methods } = logic;

  const canOpenDialog =
    !states.isLoading &&
    !states.isFetchError &&
    data.treatments.length > 0 &&
    data.selectedCodes.length > 0;

  const isAllSelected =
    data.treatments.length > 0 && data.selectedCodes.length === data.treatments.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Seleccionados: {data.selectedCodes.length}
        </p>
        <Button onClick={() => methods.setDialogOpen(true)} disabled={!canOpenDialog}>
          Actualizar precios
        </Button>
      </div>

      {states.isFetchError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">No se pudieron cargar los tratamientos.</p>
        </div>
      ) : null}

      {!states.isFetchError && data.treatments.length === 0 && !states.isLoading ? (
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">No hay tratamientos cargados.</p>
        </div>
      ) : null}

      {states.isUpdateError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">
              No se pudo actualizar precios. Reintentá nuevamente.
            </p>
            <Button variant="outline" size="sm" onClick={methods.clearUpdateError}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                aria-label="Seleccionar todos"
                checked={isAllSelected}
                disabled={states.isLoading || states.isFetchError || data.treatments.length === 0}
                onChange={methods.toggleAllSelection}
              />
            </TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Tipo de tratamiento</TableHead>
            <TableHead>Precio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.treatments.map((treatment) => (
            <TableRow key={treatment.code}>
              <TableCell>
                <input
                  type="checkbox"
                  aria-label={`Seleccionar ${treatment.code}`}
                  checked={data.selectedCodes.includes(treatment.code)}
                  onChange={() => methods.toggleSelection(treatment.code)}
                />
              </TableCell>
              <TableCell>{treatment.code}</TableCell>
              <TableCell>{treatment.name}</TableCell>
              <TableCell>{arsPriceFormatter.format(treatment.price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={data.form.isDialogOpen} onOpenChange={methods.setDialogOpen}>
        <DialogContent showCloseButton={!states.isSubmitting}>
          <DialogHeader>
            <DialogTitle>Actualización masiva</DialogTitle>
            <DialogDescription>
              Elegí modo y valor para actualizar {data.selectedCodes.length} tratamientos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="update-mode">Modo</Label>
              <Select value={data.form.mode} onValueChange={methods.setMode}>
                <SelectTrigger id="update-mode" className="w-full">
                  <SelectValue placeholder="Seleccionar modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit">Aumento por unidad</SelectItem>
                  <SelectItem value="percentage">Aumento por porcentaje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="unit-value">Valor unitario</Label>
              <Input
                id="unit-value"
                type="number"
                min="0"
                step="0.01"
                value={data.form.unitValue}
                disabled={states.isUnitInputDisabled}
                onChange={(event) => methods.setUnitValue(event.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="percentage-value">Valor porcentaje</Label>
              <Input
                id="percentage-value"
                type="number"
                min="0"
                step="0.01"
                value={data.form.percentageValue}
                disabled={states.isPercentageInputDisabled}
                onChange={(event) => methods.setPercentageValue(event.target.value)}
              />
            </div>

            {data.form.validationError ? (
              <p role="alert" className="text-sm text-destructive">
                {data.form.validationError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => methods.setDialogOpen(false)}
              disabled={states.isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void methods.submitBulkUpdate()}
              disabled={states.isSubmitting}
            >
              {states.isSubmitting ? "Actualizando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
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
import { Button } from "@/components/ui/button";
import { useCreatePatient } from "@/hooks/use-create-patient";

interface CreatePatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePatientForm({
  open,
  onOpenChange
}: CreatePatientFormProps) {
  const { formData, errors, states, methods } = useCreatePatient();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      methods.reset();
    }
    onOpenChange(newOpen);
  };

  const handleSuccess = () => {
    if (states.isSuccess) {
      methods.reset();
      onOpenChange(false);
    }
  };

  if (states.isSuccess) {
    handleSuccess();
    return null;
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Paciente</DialogTitle>
          <DialogDescription>
            Complete los datos del nuevo paciente. Los campos marcados con * son
            obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={methods.handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Row 1: Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    methods.setField("first_name", e.target.value)
                  }
                  placeholder="Juan"
                  className={errors.first_name ? "border-destructive" : ""}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">
                    {errors.first_name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    methods.setField("last_name", e.target.value)
                  }
                  placeholder="Pérez"
                  className={errors.last_name ? "border-destructive" : ""}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Row 2: Fecha de nacimiento y Género */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Fecha de nacimiento *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    methods.setField("date_of_birth", e.target.value)
                  }
                  max={today}
                  className={errors.date_of_birth ? "border-destructive" : ""}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-destructive">
                    {errors.date_of_birth}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => methods.setField("gender", value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Teléfono y Cobertura */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => methods.setField("phone", e.target.value)}
                  placeholder="3534184508"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition_coverage">Cobertura</Label>
                <Select
                  value={formData.condition_coverage}
                  onValueChange={(value) =>
                    methods.setField("condition_coverage", value)
                  }
                >
                  <SelectTrigger id="condition_coverage">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health_insurance">
                      Obra Social
                    </SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Calle y Número */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Calle *</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => methods.setField("street", e.target.value)}
                  placeholder="Av. Rivadavia"
                  className={errors.street ? "border-destructive" : ""}
                />
                {errors.street && (
                  <p className="text-sm text-destructive">{errors.street}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="street_number">Número *</Label>
                <Input
                  id="street_number"
                  type="text"
                  value={formData.street_number}
                  onChange={(e) =>
                    methods.setField("street_number", e.target.value)
                  }
                  placeholder="1234"
                  className={errors.street_number ? "border-destructive" : ""}
                />
                {errors.street_number && (
                  <p className="text-sm text-destructive">
                    {errors.street_number}
                  </p>
                )}
              </div>
            </div>

            {/* Row 5: Localidad y Código Postal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locality">Localidad *</Label>
                <Input
                  id="locality"
                  value={formData.locality}
                  onChange={(e) => methods.setField("locality", e.target.value)}
                  placeholder="Buenos Aires"
                  className={errors.locality ? "border-destructive" : ""}
                />
                {errors.locality && (
                  <p className="text-sm text-destructive">{errors.locality}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Código Postal *</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    methods.setField("postal_code", e.target.value)
                  }
                  placeholder="C1000"
                  className={errors.postal_code ? "border-destructive" : ""}
                />
                {errors.postal_code && (
                  <p className="text-sm text-destructive">
                    {errors.postal_code}
                  </p>
                )}
              </div>
            </div>

            {/* Error message */}
            {states.isError && (
              <div className="text-sm text-destructive">
                Error al crear paciente: {states.error?.message}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={states.isPending}>
              {states.isPending ? "Creando..." : "Crear Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

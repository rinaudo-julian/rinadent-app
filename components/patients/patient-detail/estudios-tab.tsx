"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEstudiosTabLogic } from "@/hooks/useEstudiosTabLogic";
import { studyTypeLabels } from "@/lib/schemas/studies-schema";
import { Expand, Plus } from "lucide-react";

interface EstudiosTabProps {
  patientId: string;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${date}T00:00:00`));
}

export function EstudiosTab({ patientId }: EstudiosTabProps) {
  const { data, states, methods } = useEstudiosTabLogic({ patientId });

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Estudios</h2>

        <Button onClick={methods.openUploadDialog}>
          <Plus className="size-4 mr-2" />
          Subir estudio
        </Button>
      </div>

      {states.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Cargando estudios...</p>
        </div>
      ) : null}

      {!states.isLoading && states.isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Error al cargar estudios: {states.studiesError?.message}
        </div>
      ) : null}

      {!states.isLoading && !states.isError && data.studies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border rounded-lg border-dashed">
          <p className="text-muted-foreground">No hay estudios cargados para este paciente</p>
        </div>
      ) : null}

      {!states.isLoading && !states.isError && data.studies.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.studies.map((study) => (
            <Card key={study.id} className="overflow-hidden py-0">
              {study.preview_url ? (
                <img
                  src={study.preview_url}
                  alt={`Estudio ${study.type}`}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  Sin vista previa
                </div>
              )}

              <CardHeader className="pb-0">
                <CardTitle>{studyTypeLabels[study.type]}</CardTitle>
                <CardDescription>Fecha de estudio: {formatDate(study.study_date)}</CardDescription>
              </CardHeader>

              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => methods.openImageViewer(study)}
                  disabled={!study.preview_url}
                >
                  <Expand className="size-4 mr-2" />
                  Ver ampliado
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : null}

      <Dialog open={states.isUploadDialogOpen} onOpenChange={methods.closeUploadDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Subir estudio</DialogTitle>
            <DialogDescription>
              Cargá una imagen JPG, PNG o WEBP de hasta 5MB.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={methods.handleUploadSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="study-file">Archivo</Label>
              <Input
                id="study-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => methods.setStudyFile(event.target.files?.[0] ?? null)}
              />
              {data.errors.file ? (
                <p className="text-xs text-destructive">{data.errors.file}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="study-type">Tipo de estudio</Label>
              <Select value={data.formData.type} onValueChange={methods.setStudyType}>
                <SelectTrigger id="study-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {data.studyTypeOptions.map((typeOption) => (
                    <SelectItem key={typeOption.value} value={typeOption.value}>
                      {typeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {data.errors.type ? <p className="text-xs text-destructive">{data.errors.type}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="study-date">Fecha del estudio</Label>
              <Input
                id="study-date"
                type="date"
                value={data.formData.study_date}
                max={data.todayDate}
                onChange={(event) => methods.setStudyDate(event.target.value)}
              />
              {data.errors.study_date ? (
                <p className="text-xs text-destructive">{data.errors.study_date}</p>
              ) : null}
            </div>

            {states.uploadError ? (
              <p className="text-sm text-destructive">Error al subir estudio: {states.uploadError.message}</p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={methods.closeUploadDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={states.isUploading}>
                {states.isUploading ? "Subiendo..." : "Subir"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={states.isViewerDialogOpen} onOpenChange={methods.closeImageViewer}>
        <DialogContent className="sm:max-w-[880px]">
          <DialogHeader>
            <DialogTitle>Vista ampliada</DialogTitle>
            <DialogDescription>
              {data.selectedStudy
                ? `${studyTypeLabels[data.selectedStudy.type]} - ${formatDate(data.selectedStudy.study_date)}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {data.selectedStudy?.preview_url ? (
            <img
              src={data.selectedStudy.preview_url}
              alt={`Vista ampliada ${data.selectedStudy.type}`}
              className="w-full max-h-[70vh] object-contain rounded-md bg-muted"
            />
          ) : (
            <div className="rounded-md bg-muted p-8 text-center text-muted-foreground">
              No se pudo generar la vista previa
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

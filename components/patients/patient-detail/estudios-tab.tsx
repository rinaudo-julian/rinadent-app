"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
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
import { ALLOWED_STUDY_FILE_MIME_TYPES, studyTypeLabels } from "@/lib/schemas/studies-schema";
import { CalendarDays, Expand, ImagePlus, Plus, Upload } from "lucide-react";
import { DicomPreview } from "./dicom-preview";

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

function isImagePreviewable(fileUrl: string) {
  const extension = fileUrl.split("?")[0]?.split(".").pop()?.toLowerCase();
  return extension === "jpg" || extension === "jpeg" || extension === "png" || extension === "webp";
}

function isDicomFile(fileUrl: string) {
  const extension = fileUrl.split("?")[0]?.split(".").pop()?.toLowerCase();
  return extension === "dcm";
}

export function EstudiosTab({ patientId }: EstudiosTabProps) {
  const { data, states, methods } = useEstudiosTabLogic({ patientId });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOriginRef = useRef({ x: 0, y: 0 });
  const dialogDragCounterRef = useRef(0);

  const zoomIn = () => setZoom((prev) => Math.min(4, Number((prev + 0.2).toFixed(2))));
  const zoomOut = () => setZoom((prev) => Math.max(0.5, Number((prev - 0.2).toFixed(2))));
  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleOpenImageViewer = (study: (typeof data.studies)[number]) => {
    resetZoom();
    setIsDragging(false);
    methods.openImageViewer(study);
  };

  const handleViewerOpenChange = (open: boolean) => {
    if (!open) {
      setIsDragging(false);
      resetZoom();
      methods.closeImageViewer();
    }
  };

  const isAllowedDroppedFile = (file: File) => {
    const mimeAllowed = ALLOWED_STUDY_FILE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_STUDY_FILE_MIME_TYPES)[number]
    );
    const name = file.name.toLowerCase();
    const extensionAllowed = [".jpg", ".jpeg", ".png", ".webp", ".dcm"].some((ext) =>
      name.endsWith(ext)
    );

    return mimeAllowed || extensionAllowed;
  };

  const handleDialogDragEnter: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dialogDragCounterRef.current += 1;
    setIsDropZoneActive(true);
  };

  const handleDialogDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDropZoneActive) {
      setIsDropZoneActive(true);
    }
  };

  const handleDialogDragLeave: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dialogDragCounterRef.current = Math.max(0, dialogDragCounterRef.current - 1);

    if (dialogDragCounterRef.current === 0) {
      setIsDropZoneActive(false);
    }
  };

  const handleDialogDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dialogDragCounterRef.current = 0;
    setIsDropZoneActive(false);

    const file = event.dataTransfer.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!isAllowedDroppedFile(file)) {
      methods.setStudyFile(null);
      setDropError("Formato inválido. Solo se permiten JPG, PNG, WEBP o DICOM (.dcm)");
      return;
    }

    setDropError(null);
    methods.setStudyFile(file);
  };

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    dragOriginRef.current = { ...offset };
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!isDragging) {
      return;
    }

    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;

    setOffset({
      x: dragOriginRef.current.x + deltaX,
      y: dragOriginRef.current.y + deltaY,
    });
  };

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
  };

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
              {study.preview_url && isImagePreviewable(study.file_url) ? (
                <button
                  type="button"
                  onClick={() => handleOpenImageViewer(study)}
                  className="group relative block h-48 w-full cursor-pointer overflow-hidden"
                  aria-label={`Ampliar ${studyTypeLabels[study.type]}`}
                >
                  <img
                    src={study.preview_url}
                    alt={`Estudio ${study.type}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/25" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow">
                      <Expand className="size-3.5" />
                      Ver ampliado
                    </span>
                  </div>
                </button>
              ) : study.preview_url && isDicomFile(study.file_url) ? (
                <button
                  type="button"
                  onClick={() => handleOpenImageViewer(study)}
                  className="group relative block h-48 w-full cursor-pointer overflow-hidden bg-black"
                  aria-label={`Ampliar ${studyTypeLabels[study.type]}`}
                >
                  <DicomPreview imageUrl={study.preview_url} className="h-full w-full" />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow">
                      <Expand className="size-3.5" />
                      Ver ampliado
                    </span>
                  </div>
                </button>
              ) : (
                <div className="h-48 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  Vista previa no disponible
                </div>
              )}

              <CardHeader className="py-5">
                <CardTitle>{studyTypeLabels[study.type]}</CardTitle>
                <CardDescription>Fecha de estudio: {formatDate(study.study_date)}</CardDescription>
              </CardHeader>

            </Card>
          ))}
        </div>
      ) : null}

      <Dialog open={states.isUploadDialogOpen} onOpenChange={methods.closeUploadDialog}>
        <DialogContent
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0"
          onDragEnter={handleDialogDragEnter}
          onDragOver={handleDialogDragOver}
          onDragLeave={handleDialogDragLeave}
          onDrop={handleDialogDrop}
        >
          {isDropZoneActive ? (
            <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-primary/12 backdrop-blur-[1px]">
              <div className="rounded-2xl border-2 border-dashed border-primary bg-background/95 px-8 py-6 text-center shadow-lg">
                <p className="text-xl font-semibold text-foreground">Soltá la imagen acá</p>
                <p className="mt-1 text-sm text-muted-foreground">La cargamos automáticamente al formulario</p>
              </div>
            </div>
          ) : null}

          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Subir estudio</DialogTitle>
            <DialogDescription className="mt-2 text-muted-foreground">
              Cargá una imagen JPG, PNG, WEBP o DICOM de hasta 5MB.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={methods.handleUploadSubmit} className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <Label
                htmlFor="study-file"
                className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-5 py-10 text-center transition-colors hover:bg-muted/50"
              >
                <span className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-muted text-foreground">
                  <Upload className="size-7" />
                </span>
                <span className="text-xl font-semibold text-foreground">Arrastrá una imagen o seleccionala</span>
                <span className="mt-1 text-base text-muted-foreground">JPG, PNG, WEBP o DICOM · hasta 5MB</span>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                  <ImagePlus className="size-4" />
                  Recomendado: radiografía en alta resolución
                </span>
              </Label>
              <Input
                id="study-file"
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp,application/dicom,.dcm"
                onChange={(event) => methods.setStudyFile(event.target.files?.[0] ?? null)}
              />

              {data.formData.file ? (
                <p className="text-sm text-muted-foreground">Archivo seleccionado: {data.formData.file.name}</p>
              ) : null}

              {data.errors.file ? (
                <p className="text-xs text-destructive">{data.errors.file}</p>
              ) : null}
              {dropError ? <p className="text-xs text-destructive">{dropError}</p> : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="study-type">Tipo de estudio</Label>
                <Select value={data.formData.type} onValueChange={methods.setStudyType}>
                  <SelectTrigger id="study-type" className="h-11">
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
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="study-date"
                    type="date"
                    className="h-11 pl-11"
                    value={data.formData.study_date}
                    max={data.todayDate}
                    onChange={(event) => methods.setStudyDate(event.target.value)}
                  />
                </div>
                {data.errors.study_date ? (
                  <p className="text-xs text-destructive">{data.errors.study_date}</p>
                ) : null}
              </div>
            </div>

            {states.uploadError ? (
              <p className="text-sm text-destructive">Error al subir estudio: {states.uploadError.message}</p>
            ) : null}

            <DialogFooter className="mx-[-1.5rem] mb-[-1.25rem] mt-1 px-6 py-5">
              <Button type="button" variant="outline" onClick={methods.closeUploadDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={states.isUploading}>
                <Upload className="size-4 mr-2" />
                {states.isUploading ? "Subiendo..." : "Subir estudio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={states.isViewerDialogOpen} onOpenChange={handleViewerOpenChange}>
        <DialogContent className="!top-0 !left-0 !h-screen !w-screen !max-w-none !translate-x-0 !translate-y-0 rounded-none border-0 bg-black p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Vista ampliada</DialogTitle>
            <DialogDescription>
              {data.selectedStudy
                ? `${studyTypeLabels[data.selectedStudy.type]} - ${formatDate(data.selectedStudy.study_date)}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="absolute top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/70 px-2 py-1 text-white">
            <Button type="button" variant="ghost" className="text-white hover:bg-white/15 hover:text-white" onClick={zoomOut}>
              -
            </Button>
            <span className="min-w-14 text-center text-xs font-medium">{Math.round(zoom * 100)}%</span>
            <Button type="button" variant="ghost" className="text-white hover:bg-white/15 hover:text-white" onClick={zoomIn}>
              +
            </Button>
            <Button type="button" variant="ghost" className="text-white hover:bg-white/15 hover:text-white" onClick={resetZoom}>
              Reset
            </Button>
          </div>

          {data.selectedStudy?.preview_url ? (
            <div
              className="flex h-full w-full items-center justify-center overflow-hidden"
              onWheel={(event) => {
                event.preventDefault();
                if (event.deltaY < 0) {
                  zoomIn();
                  return;
                }
                zoomOut();
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onDragStart={(event) => event.preventDefault()}
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
            >
              {isDicomFile(data.selectedStudy.file_url) ? (
                <div
                  className="h-[85vh] w-[85vw] max-h-[85vh] max-w-[85vw] origin-center transition-transform duration-100"
                  style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
                >
                  <DicomPreview imageUrl={data.selectedStudy.preview_url} className="h-full w-full" />
                </div>
              ) : (
                <img
                  src={data.selectedStudy.preview_url}
                  alt={`Vista ampliada ${data.selectedStudy.type}`}
                  draggable={false}
                  className="max-h-[85vh] max-w-[85vw] h-auto w-auto origin-center object-contain transition-transform duration-100"
                  style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
                />
              )}
            </div>
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

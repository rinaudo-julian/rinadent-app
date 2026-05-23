"use client";

import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  odontogramSnapshotSchema,
  type EventAction,
  type OdontogramSnapshot,
  type SurfaceKey,
  type SurfaceStatus,
  type TreatmentStatus,
  type ToothStatus
} from "@/lib/schemas/odontogram-schema";

type ColorMode = "blue" | "red" | "green";

interface ToothState {
  status?: ToothStatus;
  treatment_status?: TreatmentStatus;
  surfaces?: Partial<
    Record<
      SurfaceKey,
      {
        status: SurfaceStatus;
        treatment_status?: TreatmentStatus;
      }
    >
  >;
}

interface ClinicalEvent {
  id: string;
  timestamp: number;
  tooth: number;
  surface?: SurfaceKey;
  action: EventAction;
  label: string;
}

const COLOR_PLANNED = "var(--condition-planned)";
const COLOR_EXISTING = "var(--condition-existing)";
const COLOR_DONE = "var(--condition-done)";
const COLOR_ABSENT = "var(--condition-absent)";

const ACTION_COLORS: Record<EventAction, string> = {
  "surface-cavity-pending": COLOR_PLANNED,
  "surface-pre-existing": COLOR_EXISTING,
  "surface-cavity-completed": COLOR_DONE,
  "tooth-extract-pending": COLOR_PLANNED,
  "tooth-extract-completed": COLOR_DONE,
  missing: COLOR_ABSENT,
  "clear-surface": "var(--muted-foreground)",
  "clear-tooth": "var(--muted-foreground)",
  "clear-all": "var(--foreground)"
};

const ACTION_LABELS: Record<EventAction, string> = {
  "surface-cavity-pending": "Caries a tratar",
  "surface-pre-existing": "Restauración preexistente",
  "surface-cavity-completed": "Restauración realizada",
  "tooth-extract-pending": "Extracción pendiente",
  "tooth-extract-completed": "Extracción realizada",
  missing: "Pieza marcada como ausente",
  "clear-surface": "Hallazgo removido",
  "clear-tooth": "Estado de pieza removido",
  "clear-all": "Odontograma limpiado totalmente"
};

const SURFACE_KEYS: SurfaceKey[] = [
  "oclusal",
  "vestibular",
  "mesial",
  "distal",
  "palatino"
];

const SURFACE_LABELS: Record<SurfaceKey, string> = {
  oclusal: "Oclusal/Incisal",
  vestibular: "Vestibular",
  mesial: "Mesial",
  distal: "Distal",
  palatino: "Palatino"
};

const SURFACE_STATE_LABELS: Record<
  `${SurfaceStatus}:${TreatmentStatus | "none"}`,
  string
> = {
  "cavity:pending": "Caries a tratar",
  "cavity:completed": "Restauración realizada",
  "pre_existing_restoration:none": "Restauración preexistente"
};

const COLOR_MODE_MAP: Record<ColorMode, string> = {
  blue: COLOR_PLANNED,
  red: COLOR_EXISTING,
  green: COLOR_DONE
};

const TOOTH_NAMES: Record<number, string> = {
  1: "Incisivo central",
  2: "Incisivo lateral",
  3: "Canino",
  4: "Primer premolar",
  5: "Segundo premolar",
  6: "Primer molar",
  7: "Segundo molar",
  8: "Tercer molar"
};

const PERMANENT = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38]
};

function defaultTooth(): ToothState {
  return {};
}

interface ToothProps {
  number: number;
  state: ToothState;
  flipped: boolean;
  selectedColor: ColorMode;
  xActionActive: boolean;
  onSurfaceClick: (s: SurfaceKey) => void;
  onToothClick: () => void;
}

function Tooth({
  number,
  state,
  flipped,
  selectedColor,
  xActionActive,
  onSurfaceClick,
  onToothClick
}: ToothProps) {
  const [hovered, setHovered] = useState(false);
  const [hoveredSurface, setHoveredSurface] = useState<SurfaceKey | null>(null);
  const isMissingTooth = state.status === "missing";
  const isToExtract = state.status === "to_extract";
  const size = 44;
  const i = 12;
  const inner = `${i},${i} ${size - i},${i} ${size - i},${size - i} ${i},${size - i}`;

  const topKey: SurfaceKey = flipped ? "palatino" : "vestibular";
  const bottomKey: SurfaceKey = flipped ? "vestibular" : "palatino";

  const quadrant = Math.floor(number / 10);
  const isRightQuadrant =
    quadrant === 1 || quadrant === 4 || quadrant === 5 || quadrant === 8;
  const sideMap: Record<string, SurfaceKey> = isRightQuadrant
    ? { left: "distal", right: "mesial" }
    : { left: "mesial", right: "distal" };

  const polys: { key: SurfaceKey; points: string }[] = [
    { key: topKey, points: `0,0 ${size},0 ${size - i},${i} ${i},${i}` },
    {
      key: sideMap.right,
      points: `${size},0 ${size},${size} ${size - i},${size - i} ${size - i},${i}`
    },
    {
      key: bottomKey,
      points: `${size},${size} 0,${size} ${i},${size - i} ${size - i},${size - i}`
    },
    { key: sideMap.left, points: `0,${size} 0,0 ${i},${i} ${i},${size - i}` },
    { key: "oclusal", points: inner }
  ];

  const toothName = TOOTH_NAMES[number % 10] ?? "Diente";

  const summary = SURFACE_KEYS.filter((s) => state.surfaces?.[s] !== undefined)
    .map((s) => {
      const surface = state.surfaces?.[s];
      if (!surface) return "";
      const key = `${surface.status}:${surface.treatment_status ?? "none"}` as const;
      return `${SURFACE_LABELS[s]}: ${SURFACE_STATE_LABELS[key]}`;
    })
    .filter(Boolean)
    .join(" · ");

  const showToothPreview = xActionActive && hovered;
  const previewToothColor =
    selectedColor === "red"
      ? COLOR_ABSENT
      : selectedColor === "green"
        ? COLOR_DONE
        : COLOR_PLANNED;

  const handleSvgClick = () => {
    if (xActionActive) onToothClick();
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => {
                setHovered(false);
                setHoveredSurface(null);
              }}
              onClick={handleSvgClick}
              className={cn(
                "transition-all rounded-[3px]",
                hovered && "ring-1 ring-foreground/20",
                showToothPreview && "ring-2",
                xActionActive && "cursor-pointer"
              )}
              style={{
                background: showToothPreview
                  ? `color-mix(in oklab, ${previewToothColor} 18%, var(--surface))`
                  : "var(--surface)",
                ...(showToothPreview
                  ? { boxShadow: `0 0 0 2px ${previewToothColor}` }
                  : {})
              }}
            >
              {polys.map((p) => {
                const cond = state.surfaces?.[p.key];
                const baseFill = cond
                  ? cond.status === "pre_existing_restoration"
                    ? COLOR_EXISTING
                    : cond.treatment_status === "completed"
                      ? COLOR_DONE
                      : COLOR_PLANNED
                  : "transparent";

                const isHoveredSurface = hoveredSurface === p.key;
                let fill = baseFill;
                let strokeColor = "var(--tooth-stroke)";
                let strokeW = 0.75;

                if (!xActionActive && isHoveredSurface) {
                  const previewColor = COLOR_MODE_MAP[selectedColor];
                  if (!cond) {
                    fill = `color-mix(in oklab, ${previewColor} 45%, transparent)`;
                  }
                  strokeColor = previewColor;
                  strokeW = 1.25;
                }

                return (
                  <polygon
                    key={p.key}
                    points={p.points}
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    className={cn("transition-[fill,stroke] duration-150", !xActionActive && "cursor-pointer")}
                    onMouseEnter={() => setHoveredSurface(p.key)}
                    onMouseLeave={() => setHoveredSurface(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (xActionActive) {
                        onToothClick();
                        return;
                      }
                      onSurfaceClick(p.key);
                    }}
                  />
                );
              })}
              {(isToExtract || isMissingTooth) &&
                (() => {
                  const xColor =
                    state.status === "missing"
                      ? COLOR_ABSENT
                      : state.treatment_status === "completed"
                        ? COLOR_DONE
                        : COLOR_PLANNED;
                  return (
                    <>
                      <line
                        x1={4}
                        y1={4}
                        x2={size - 4}
                        y2={size - 4}
                        stroke={xColor}
                        strokeWidth={2.3}
                        strokeLinecap="round"
                      />
                      <line
                        x1={size - 4}
                        y1={4}
                        x2={4}
                        y2={size - 4}
                        stroke={xColor}
                        strokeWidth={2.3}
                        strokeLinecap="round"
                      />
                    </>
                  );
                })()}
              {showToothPreview && (
                <>
                  <line
                    x1={4}
                    y1={4}
                    x2={size - 4}
                    y2={size - 4}
                    stroke={previewToothColor}
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    opacity={0.7}
                    strokeLinecap="round"
                  />
                  <line
                    x1={size - 4}
                    y1={4}
                    x2={4}
                    y2={size - 4}
                    stroke={previewToothColor}
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    opacity={0.7}
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <div className="font-semibold">Diente {number}</div>
            <div className="text-muted-foreground">{toothName}</div>
            {state.status && (
              <div className="capitalize text-foreground/80 mt-1">
                {state.status === "to_extract" &&
                  (state.treatment_status === "completed"
                    ? "Extracción realizada"
                    : "Extracción pendiente")}
                {state.status === "missing" && "Ausente"}
              </div>
            )}
            {summary && <div className="mt-1 max-w-[200px]">{summary}</div>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="text-[11px] font-medium tabular-nums text-muted-foreground tracking-wide">
        {number}
      </span>
    </div>
  );
}

interface ArchRowProps {
  teeth: number[];
  flipped: boolean;
  state: Record<number, ToothState>;
  selectedColor: ColorMode;
  xActionActive: boolean;
  onSurface: (n: number, s: SurfaceKey) => void;
  onToothClick: (n: number) => void;
}

function ArchRow({
  teeth,
  flipped,
  state,
  selectedColor,
  xActionActive,
  onSurface,
  onToothClick
}: ArchRowProps) {
  return (
    <div className="flex items-center gap-1.5">
      {teeth.map((n) => (
        <Tooth
          key={n}
          number={n}
          state={state[n] ?? defaultTooth()}
          flipped={flipped}
          selectedColor={selectedColor}
          xActionActive={xActionActive}
          onSurfaceClick={(s) => onSurface(n, s)}
          onToothClick={() => onToothClick(n)}
        />
      ))}
    </div>
  );
}

type LegendIcon = "square" | "cross";
const LEGEND: { colorMode: ColorMode; label: string; color: string; icon: LegendIcon }[] =
  [
    {
      colorMode: "blue",
      label: "Azul",
      color: COLOR_PLANNED,
      icon: "square"
    },
    {
      colorMode: "red",
      label: "Rojo",
      color: COLOR_EXISTING,
      icon: "square"
    },
    {
      colorMode: "green",
      label: "Verde",
      color: COLOR_DONE,
      icon: "square"
    }
  ];

function LegendSwatch({
  icon,
  color,
  active
}: {
  icon: LegendIcon;
  color: string;
  active: boolean;
}) {
  if (icon === "square") {
    return (
      <span
        className="inline-block h-3 w-3 rounded-[2px] border"
        style={{
          background: color,
          borderColor: active ? "rgba(255,255,255,0.6)" : color
        }}
      />
    );
  }
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" className="inline-block">
      {icon === "cross" && (
        <>
          <line
            x1={1.5}
            y1={1.5}
            x2={10.5}
            y2={10.5}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={10.5}
            y1={1.5}
            x2={1.5}
            y2={10.5}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

interface OdontogramEventRow {
  id: string;
  occurred_at: string;
  tooth: number;
  surface: SurfaceKey | null;
  action: EventAction;
}

function toSnapshot(data: Record<number, ToothState>): OdontogramSnapshot {
  const snapshot: OdontogramSnapshot = {};

  Object.entries(data).forEach(([tooth, value]) => {
    if (!value.status && (!value.surfaces || Object.keys(value.surfaces).length === 0)) {
      return;
    }

    snapshot[tooth] = value;
  });

  return snapshot;
}

function fromSnapshot(snapshot: OdontogramSnapshot | null): Record<number, ToothState> {
  if (!snapshot) return {};

  return Object.entries(snapshot).reduce<Record<number, ToothState>>(
    (acc, [tooth, value]) => {
      acc[Number(tooth)] = value;
      return acc;
    },
    {}
  );
}

function mapEventRowToClinicalEvent(event: OdontogramEventRow): ClinicalEvent {
  return {
    id: event.id,
    timestamp: new Date(event.occurred_at).getTime(),
    tooth: event.tooth,
    surface: event.surface ?? undefined,
    action: event.action,
    label: ACTION_LABELS[event.action]
  };
}

function resolveApiUrl(path: string) {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

function hasOdontogramContent(state: Record<number, ToothState>) {
  return Object.values(state).some((tooth) => {
    if (tooth.status) {
      return true;
    }

    return SURFACE_KEYS.some((surface) => tooth.surfaces?.[surface] !== undefined);
  });
}

interface OdontogramTabProps {
  patientId: string;
}

export function OdontogramTab({ patientId }: OdontogramTabProps) {
  const [data, setData] = useState<Record<number, ToothState>>({});
  const [savedData, setSavedData] = useState<Record<number, ToothState>>({});
  const [selectedColor, setSelectedColor] = useState<ColorMode>("blue");
  const [xActionActive, setXActionActive] = useState(false);
  const [events, setEvents] = useState<ClinicalEvent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<ClinicalEvent[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const historyRef = useRef<HTMLDivElement | null>(null);

  // Click outside the history closes any expanded detail
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!historyRef.current) return;
      if (!historyRef.current.contains(e.target as Node)) {
        setExpanded({});
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const loadOdontogram = async () => {
      try {
        const response = await fetch(
          resolveApiUrl(`/api/patients/${patientId}/odontogram`)
        );

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          snapshot: unknown;
          events: OdontogramEventRow[];
        };

        const parsedSnapshot =
          payload.snapshot === null
            ? null
            : odontogramSnapshotSchema.safeParse(payload.snapshot);

        if (parsedSnapshot !== null && !parsedSnapshot.success) {
          return;
        }

        const nextData = fromSnapshot(
          parsedSnapshot === null ? null : parsedSnapshot.data
        );
        setData(nextData);
        setSavedData(nextData);
        setEvents((payload.events ?? []).map(mapEventRowToClinicalEvent));
        setPendingEvents([]);
      } catch {
        // Keep UI usable when API is unavailable (e.g. isolated tests).
        return;
      }
    };

    void loadOdontogram();
  }, [patientId]);

  const layout = PERMANENT;
  const canClearAll = hasOdontogramContent(savedData);

  // Registra un evento pendiente, pero si ese cambio devuelve el target a su
  // estado guardado (savedData), elimina los eventos previos del mismo target
  // sin agregar uno nuevo (cancelan el cambio en lugar de sumar).
  const logEvent = (
    e: Omit<ClinicalEvent, "id" | "timestamp" | "label">,
    nextTargetState: string
  ) => {
    const targetKey = e.surface ? `s:${e.tooth}:${e.surface}` : `t:${e.tooth}`;
    const savedTooth = savedData[e.tooth] ?? defaultTooth();
    const savedValue = e.surface
      ? JSON.stringify(savedTooth.surfaces?.[e.surface] ?? null)
      : JSON.stringify({
          status: savedTooth.status ?? null,
          treatment_status: savedTooth.treatment_status ?? null
        });

    setPendingEvents((prev) => {
      // quitar pendientes previos del mismo target
      const filtered = prev.filter((p) => {
        const k = p.surface ? `s:${p.tooth}:${p.surface}` : `t:${p.tooth}`;
        return k !== targetKey;
      });
      // si el nuevo estado coincide con el guardado, no se registra cambio
      if (nextTargetState === savedValue) return filtered;
      return [
        {
          ...e,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          label: ACTION_LABELS[e.action]
        },
        ...filtered
      ];
    });
  };

  const handleSurface = (n: number, s: SurfaceKey) => {
    const t = data[n] ?? defaultTooth();
    if (xActionActive) {
      return;
    }

    const current = t.surfaces?.[s];
    const nextSurfaceState =
      selectedColor === "blue"
        ? ({ status: "cavity", treatment_status: "pending" } as const)
        : selectedColor === "red"
          ? ({
              status: "pre_existing_restoration",
              treatment_status: undefined
            } as const)
          : ({ status: "cavity", treatment_status: "completed" } as const);

    const shouldClear =
      current?.status === nextSurfaceState.status &&
      current?.treatment_status === nextSurfaceState.treatment_status;

    const next = shouldClear ? null : nextSurfaceState;
    const action: EventAction = shouldClear
      ? "clear-surface"
      : selectedColor === "blue"
        ? "surface-cavity-pending"
        : selectedColor === "red"
          ? "surface-pre-existing"
          : "surface-cavity-completed";

    const nextSurfaces = { ...(t.surfaces ?? {}) };
    if (next) {
      nextSurfaces[s] = next;
    } else {
      delete nextSurfaces[s];
    }

    const nextTooth: ToothState = {
      surfaces: Object.keys(nextSurfaces).length ? nextSurfaces : undefined
    };

    logEvent({ tooth: n, surface: s, action }, JSON.stringify(next ?? null));
    setData({ ...data, [n]: nextTooth });
  };

  const handleToothClick = (n: number) => {
    if (!xActionActive) return;

    const t = data[n] ?? defaultTooth();
    let next: ToothState;
    let action: EventAction;

    if (selectedColor === "red") {
      const isSame = t.status === "missing";
      next = isSame ? {} : { status: "missing" };
      action = isSame ? "clear-tooth" : "missing";
    } else if (selectedColor === "green") {
      const isSame =
        t.status === "to_extract" && t.treatment_status === "completed";
      next = isSame
        ? {}
        : { status: "to_extract", treatment_status: "completed" };
      action = isSame ? "clear-tooth" : "tooth-extract-completed";
    } else {
      const isSame = t.status === "to_extract" && t.treatment_status === "pending";
      next = isSame ? {} : { status: "to_extract", treatment_status: "pending" };
      action = isSame ? "clear-tooth" : "tooth-extract-pending";
    }

    logEvent(
      { tooth: n, action },
      JSON.stringify({
        status: next.status ?? null,
        treatment_status: next.treatment_status ?? null
      })
    );
    setData({ ...data, [n]: next });
  };

  const reset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(resolveApiUrl(`/api/patients/${patientId}/odontogram`), {
        method: "DELETE"
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        snapshot: null;
        events: OdontogramEventRow[];
      };

      setData({});
      setSavedData({});
      setEvents((payload.events ?? []).map(mapEventRowToClinicalEvent));
      setPendingEvents([]);
      setExpanded({});
    } finally {
      setIsResetting(false);
    }
  };

  const save = async () => {
    if (pendingEvents.length === 0) return;

    setIsSaving(true);
    try {
      const response = await fetch(resolveApiUrl(`/api/patients/${patientId}/odontogram`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          snapshot: toSnapshot(data),
          events: pendingEvents.map((event) => ({
            tooth: event.tooth,
            surface: event.surface,
            action: event.action,
            timestamp: event.timestamp
          }))
        })
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        snapshot: OdontogramSnapshot;
        events: OdontogramEventRow[];
      };

      const nextData = fromSnapshot(payload.snapshot);
      setData(nextData);
      setSavedData(nextData);
      setEvents((payload.events ?? []).map(mapEventRowToClinicalEvent));
      setPendingEvents([]);
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    if (pendingEvents.length === 0) return;
    setData(savedData);
    setPendingEvents([]);
  };

  const toolHint = xActionActive
    ? "Modo X activo · tocá la pieza completa"
    : "Modo caras activo · tocá una cara";

  return (
    <div
      className="font-sans"
      style={{ fontFamily: "DM Sans, ui-sans-serif, system-ui" }}
    >
      <div className="grid gap-8">
        <div className="rounded-2xl border border-border bg-[var(--surface)] p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Odontograma
              </h2>
              <p className="text-sm text-muted-foreground">{toolHint}</p>
            </div>
            <div className="flex items-center gap-2">
              {pendingEvents.length > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {pendingEvents.length} cambio
                  {pendingEvents.length === 1 ? "" : "s"} sin guardar
                </span>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={save}
                disabled={pendingEvents.length === 0 || isSaving || isResetting}
                className="text-sm h-9"
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={discardChanges}
                disabled={pendingEvents.length === 0 || isResetting}
                className="text-sm h-9"
              >
                Deshacer cambios
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm h-9"
                    disabled={!canClearAll || isResetting || isSaving}
                  >
                    Limpiar todo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Limpiar todo el odontograma?</DialogTitle>
                    <DialogDescription>
                      Esta acción limpiará por completo el odontograma actual.
                      Se conservará la trazabilidad en el historial con un
                      registro de limpieza total. No se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={reset}
                        disabled={isResetting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isResetting ? "Limpiando..." : "Sí, limpiar todo"}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quadrant labels */}
          <div className="mb-2 grid grid-cols-2 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            <div className="text-right pr-4">Superior derecho</div>
            <div className="pl-4">Superior izquierdo</div>
          </div>

          {/* Upper arch */}
          <div className="relative">
            <div className="flex items-center justify-center gap-4 pb-4">
              <ArchRow
                teeth={layout.upperRight}
                flipped={false}
                state={data}
                selectedColor={selectedColor}
                xActionActive={xActionActive}
                onSurface={handleSurface}
                onToothClick={handleToothClick}
              />
              <div className="h-12 w-px bg-border" />
              <ArchRow
                teeth={layout.upperLeft}
                flipped={false}
                state={data}
                selectedColor={selectedColor}
                xActionActive={xActionActive}
                onSurface={handleSurface}
                onToothClick={handleToothClick}
              />
            </div>

            <div className="my-2 h-px w-full bg-border" />

            {/* Lower arch */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <ArchRow
                teeth={layout.lowerRight}
                flipped={true}
                state={data}
                selectedColor={selectedColor}
                xActionActive={xActionActive}
                onSurface={handleSurface}
                onToothClick={handleToothClick}
              />
              <div className="h-12 w-px bg-border" />
              <ArchRow
                teeth={layout.lowerLeft}
                flipped={true}
                state={data}
                selectedColor={selectedColor}
                xActionActive={xActionActive}
                onSurface={handleSurface}
                onToothClick={handleToothClick}
              />
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            <div className="text-right pr-4">Inferior derecho</div>
            <div className="pl-4">Inferior izquierdo</div>
          </div>

          {/* Legend / Tool selector */}
          <div className="mt-8 border-t border-border pt-5">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground text-center">
              Color activo
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              {LEGEND.map((l) => {
                const active = selectedColor === l.colorMode;
                return (
                  <button
                    key={l.colorMode}
                    type="button"
                    onClick={() => setSelectedColor(l.colorMode)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all",
                      active
                        ? "border-foreground bg-foreground text-background shadow-sm"
                        : "border-border bg-[var(--surface)] text-foreground/70 hover:border-foreground/40 hover:text-foreground"
                    )}
                    style={
                      active
                        ? {
                            borderColor: l.color,
                            background: l.color,
                            color: "#fff"
                          }
                        : undefined
                    }
                  >
                    <LegendSwatch
                      icon={l.icon}
                      color={active ? "#fff" : l.color}
                      active={active}
                    />
                    {l.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-1 mb-3 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground text-center">
              Representaciones
            </div>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setXActionActive((prev) => !prev)}
                className={cn(
                  "group flex items-center justify-center h-12 w-12 cursor-pointer transition-all",
                  xActionActive
                    ? "scale-105 rounded-md bg-foreground/5 ring-2 ring-offset-1"
                    : "hover:scale-105 hover:opacity-80"
                )}
                style={
                  xActionActive
                    ? {
                        boxShadow: `0 0 0 2px ${COLOR_MODE_MAP[selectedColor]}`
                      }
                    : undefined
                }
                aria-pressed={xActionActive}
                aria-label="Acción sobre pieza completa"
              >
                <svg width={28} height={28} viewBox="0 0 44 44" className="inline-block">
                  <polygon
                    points="0,0 44,0 32,12 12,12"
                    fill="transparent"
                    stroke="var(--tooth-stroke)"
                    strokeWidth={1}
                  />
                  <polygon
                    points="44,0 44,44 32,32 32,12"
                    fill="transparent"
                    stroke="var(--tooth-stroke)"
                    strokeWidth={1}
                  />
                  <polygon
                    points="44,44 0,44 12,32 32,32"
                    fill="transparent"
                    stroke="var(--tooth-stroke)"
                    strokeWidth={1}
                  />
                  <polygon
                    points="0,44 0,0 12,12 12,32"
                    fill="transparent"
                    stroke="var(--tooth-stroke)"
                    strokeWidth={1}
                  />
                  <polygon
                    points="12,12 32,12 32,32 12,32"
                    fill="transparent"
                    stroke="var(--tooth-stroke)"
                    strokeWidth={1}
                  />
                  <line
                    x1={8}
                    y1={8}
                    x2={36}
                    y2={36}
                    stroke={COLOR_MODE_MAP[selectedColor]}
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={xActionActive ? 1 : 0.9}
                  />
                  <line
                    x1={36}
                    y1={8}
                    x2={8}
                    y2={36}
                    stroke={COLOR_MODE_MAP[selectedColor]}
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={xActionActive ? 1 : 0.9}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Historial clínico */}
        <div
          ref={historyRef}
          className="rounded-2xl border border-border bg-[var(--surface)] p-6 shadow-sm h-fit max-h-[80vh] flex flex-col"
        >
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-base font-semibold text-foreground">
              Historial clínico
            </h3>
            <span className="text-xs tabular-nums text-muted-foreground">
              {events.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Registro cronológico de hallazgos
          </p>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground/70 italic">
              Aún no hay registros. Cada acción sobre el odontograma quedará
              registrada con fecha, pieza y cara.
            </p>
          ) : (
            <ol className="space-y-2 overflow-y-auto pr-1">
              {(() => {
                // Group events by tooth + surface (or tooth-only for tooth-level actions)
                const groups = new Map<
                  string,
                  {
                    tooth: number;
                    surface?: SurfaceKey;
                    events: ClinicalEvent[];
                  }
                >();
                // events are stored newest-first; iterate in chronological order to build timelines correctly
                const chronological = [...events].reverse();
                for (const ev of chronological) {
                  const key = ev.surface
                    ? `${ev.tooth}-${ev.surface}`
                    : `${ev.tooth}-tooth`;
                  if (!groups.has(key)) {
                    groups.set(key, {
                      tooth: ev.tooth,
                      surface: ev.surface,
                      events: []
                    });
                  }
                  groups.get(key)!.events.push(ev);
                }
                // Sort groups by most recent event (newest first)
                const sorted = [...groups.entries()].sort((a, b) => {
                  const aLast = a[1].events[a[1].events.length - 1].timestamp;
                  const bLast = b[1].events[b[1].events.length - 1].timestamp;
                  return bLast - aLast;
                });

                return sorted.map(([key, group]) => {
                  const latest = group.events[group.events.length - 1];
                  const canExpand = group.events.length > 1;
                  const isOpen = canExpand && (expanded[key] ?? false);
                  const lastDate = new Date(latest.timestamp);
                  const lastWhen = `${lastDate.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })} · ${lastDate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;

                  return (
                    <li
                      key={key}
                      className="rounded-lg border border-border/70 bg-background/40 overflow-hidden"
                    >
                      <Collapsible
                        open={isOpen}
                        onOpenChange={(o) =>
                          canExpand && setExpanded((p) => ({ ...p, [key]: o }))
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            type="button"
                            disabled={!canExpand}
                            className={cn(
                              "w-full flex items-start gap-2.5 p-3 text-left transition-colors",
                              canExpand
                                ? "hover:bg-muted/40 cursor-pointer"
                                : "cursor-default"
                            )}
                          >
                            <span
                              className="mt-1.5 h-2.5 w-2.5 rounded-full shrink-0"
                              style={{
                                background: ACTION_COLORS[latest.action]
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-foreground tabular-nums">
                                  {group.tooth === 0
                                    ? "Odontograma eliminado"
                                    : `Diente ${group.tooth}`}
                                  {group.tooth !== 0 && group.surface && (
                                    <span className="ml-1.5 font-normal capitalize text-muted-foreground">
                                      · {SURFACE_LABELS[group.surface]}
                                    </span>
                                  )}
                                </span>
                                {canExpand && (
                                  <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                                    {group.events.length}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="text-[13px] text-foreground/70 truncate">
                                  {latest.label}
                                </span>
                                <span className="text-xs tabular-nums text-muted-foreground/80 shrink-0">
                                  {lastWhen}
                                </span>
                              </div>
                            </div>
                            {canExpand && (
                              <span
                                className={cn(
                                  "text-muted-foreground text-sm transition-transform duration-200 mt-0.5",
                                  isOpen && "rotate-90"
                                )}
                              >
                                ›
                              </span>
                            )}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                          <div
                            className="border-t border-dashed border-border/70 bg-muted/40 pl-7 pr-4 py-3"
                            style={{
                              boxShadow: "inset 3px 0 0 0 var(--border)"
                            }}
                          >
                            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
                              {group.tooth === 0
                                ? "Historial general"
                                : "Historial de esta cara"}
                            </div>
                            <ol className="relative space-y-1.5 before:absolute before:left-[2px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-border/70">
                              {group.events.map((e, idx) => {
                                const d = new Date(e.timestamp);
                                const isLatest =
                                  idx === group.events.length - 1;
                                return (
                                  <li
                                    key={e.id}
                                    className="relative pl-3.5 py-0.5"
                                  >
                                    <span
                                      className="absolute left-0 top-[8px] h-[6px] w-[6px] rounded-full"
                                      style={{
                                        background: ACTION_COLORS[e.action],
                                        opacity: isLatest ? 1 : 0.55
                                      }}
                                    />
                                    <div className="flex items-baseline justify-between gap-2">
                                      <span
                                        className={cn(
                                          "text-[13px] leading-tight",
                                          isLatest
                                            ? "text-foreground/85"
                                            : "text-muted-foreground"
                                        )}
                                      >
                                        {e.label}
                                      </span>
                                      <span className="text-[11px] tabular-nums text-muted-foreground/70 shrink-0 leading-tight">
                                        {d.toLocaleDateString("es-AR", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric"
                                        })}
                                        {" · "}
                                        {d.toLocaleTimeString("es-AR", {
                                          hour: "2-digit",
                                          minute: "2-digit"
                                        })}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </li>
                  );
                });
              })()}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

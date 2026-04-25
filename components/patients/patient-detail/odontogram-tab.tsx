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
  type SurfaceState,
  type ToothState as ToothCondition
} from "@/lib/schemas/odontogram-schema";

type Tool =
  | "healthy"
  | "planned"
  | "existing"
  | "completed"
  | "extraction"
  | "missing";

interface ToothState {
  surfaces: Record<SurfaceKey, SurfaceState>;
  tooth: ToothCondition;
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
  planned: COLOR_PLANNED,
  existing: COLOR_EXISTING,
  completed: COLOR_DONE,
  "planned-extraction": COLOR_PLANNED,
  "completed-extraction": COLOR_DONE,
  missing: COLOR_ABSENT,
  "clear-surface": "var(--muted-foreground)",
  "clear-tooth": "var(--muted-foreground)",
  "clear-all": "var(--foreground)"
};

const ACTION_LABELS: Record<EventAction, string> = {
  planned: "Tratamiento planificado",
  existing: "Hallazgo previo (trae hecho)",
  completed: "Tratamiento realizado",
  "planned-extraction": "Extracción planificada",
  "completed-extraction": "Extracción realizada",
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
  "lingual"
];

const SURFACE_LABELS: Record<SurfaceKey, string> = {
  oclusal: "Oclusal/Incisal",
  vestibular: "Vestibular",
  mesial: "Mesial",
  distal: "Distal",
  lingual: "Palatino/Lingual"
};

const SURFACE_STATE_LABELS: Record<SurfaceState, string> = {
  healthy: "Sano",
  planned: "Planificado",
  existing: "Pre-existente",
  completed: "Realizado"
};

const CONDITION_COLORS: Record<SurfaceState, string> = {
  healthy: "transparent",
  planned: COLOR_PLANNED,
  existing: COLOR_EXISTING,
  completed: COLOR_DONE
};

const TOOL_COLORS: Record<Tool, string> = {
  healthy: "var(--tooth-stroke)",
  planned: COLOR_PLANNED,
  existing: COLOR_EXISTING,
  completed: COLOR_DONE,
  extraction: COLOR_PLANNED,
  missing: COLOR_ABSENT
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
  return {
    tooth: "none",
    surfaces: {
      oclusal: "healthy",
      vestibular: "healthy",
      mesial: "healthy",
      distal: "healthy",
      lingual: "healthy"
    }
  };
}

interface ToothProps {
  number: number;
  state: ToothState;
  flipped: boolean;
  tool: Tool;
  onSurfaceClick: (s: SurfaceKey) => void;
  onToothClick: () => void;
}

function Tooth({
  number,
  state,
  flipped,
  tool,
  onSurfaceClick,
  onToothClick
}: ToothProps) {
  const [hovered, setHovered] = useState(false);
  const [hoveredSurface, setHoveredSurface] = useState<SurfaceKey | null>(null);
  const hasPlannedExtraction = state.tooth === "planned-extraction";
  // 'completed' acts on tooth-level if extraction is already planned
  const completedOnExtraction = tool === "completed" && hasPlannedExtraction;
  const isToothTool =
    tool === "extraction" || tool === "missing" || completedOnExtraction;
  const isSurfaceTool =
    (tool === "planned" || tool === "existing" || tool === "completed") &&
    !completedOnExtraction;
  const isEraser = tool === "healthy";

  const isMissingTooth = state.tooth === "missing";
  const size = 44;
  const i = 12;
  const inner = `${i},${i} ${size - i},${i} ${size - i},${size - i} ${i},${size - i}`;

  const topKey: SurfaceKey = flipped ? "lingual" : "vestibular";
  const bottomKey: SurfaceKey = flipped ? "vestibular" : "lingual";

  const quadrant = Math.floor(number / 10);
  const isRightQuadrant =
    quadrant === 1 || quadrant === 4 || quadrant === 5 || quadrant === 8;
  const sideMap: Record<string, SurfaceKey> = isRightQuadrant
    ? { left: "mesial", right: "distal" }
    : { left: "distal", right: "mesial" };

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

  const summary = SURFACE_KEYS.filter((s) => state.surfaces[s] !== "healthy")
    .map((s) => `${SURFACE_LABELS[s]}: ${SURFACE_STATE_LABELS[state.surfaces[s]]}`)
    .join(" · ");

  // Tooth-level preview (extraction/missing/completed-on-extraction hover on tooth)
  const showToothPreview = isToothTool && hovered && !isMissingTooth;
  const previewToothColor =
    tool === "missing"
      ? COLOR_ABSENT
      : completedOnExtraction
        ? COLOR_DONE
        : COLOR_PLANNED;

  // Disabled if missing (unless eraser/missing tool to undo)
  const interactionsLocked =
    isMissingTooth && tool !== "healthy" && tool !== "missing";

  const handleSvgClick = () => {
    if (isToothTool) onToothClick();
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
                hovered && !interactionsLocked && "ring-1 ring-foreground/20",
                showToothPreview && "ring-2",
                isToothTool && !interactionsLocked && "cursor-pointer",
                isMissingTooth &&
                  tool !== "healthy" &&
                  tool !== "missing" &&
                  "opacity-60"
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
                const cond = state.surfaces[p.key];
                const baseFill = CONDITION_COLORS[cond];

                // Surface preview when using caries/restauracion
                const isHoveredSurface = hoveredSurface === p.key;
                let fill = baseFill;
                let strokeColor = "var(--tooth-stroke)";
                let strokeW = 0.75;

                if (isSurfaceTool && isHoveredSurface && !interactionsLocked) {
                  const previewColor = TOOL_COLORS[tool];
                  if (cond === "healthy") {
                    // soft preview tint
                    fill = `color-mix(in oklab, ${previewColor} 45%, transparent)`;
                  }
                  strokeColor = previewColor;
                  strokeW = 1.25;
                }

                if (
                  isEraser &&
                  isHoveredSurface &&
                  cond !== "healthy" &&
                  !isMissingTooth
                ) {
                  // eraser preview: dashed darker stroke
                  strokeColor = "var(--foreground)";
                  strokeW = 1.25;
                }

                return (
                  <polygon
                    key={p.key}
                    points={p.points}
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeDasharray={
                      isEraser && isHoveredSurface && cond !== "healthy"
                        ? "2 1.5"
                        : undefined
                    }
                    className={cn(
                      "transition-[fill,stroke] duration-150",
                      !interactionsLocked && !isToothTool && "cursor-pointer"
                    )}
                    onMouseEnter={() => setHoveredSurface(p.key)}
                    onMouseLeave={() => setHoveredSurface(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isToothTool) {
                        onToothClick();
                        return;
                      }
                      if (interactionsLocked) return;
                      onSurfaceClick(p.key);
                    }}
                  />
                );
              })}
              {(state.tooth === "planned-extraction" ||
                state.tooth === "completed-extraction") &&
                (() => {
                  const xColor =
                    state.tooth === "completed-extraction"
                      ? COLOR_DONE
                      : COLOR_PLANNED;
                  // diagonal "/" from bottom-left to top-right
                  return (
                    <line
                      x1={2}
                      y1={size - 2}
                      x2={size - 2}
                      y2={2}
                      stroke={xColor}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                  );
                })()}
              {isMissingTooth && (
                <>
                  <line
                    x1={4}
                    y1={4}
                    x2={size - 4}
                    y2={size - 4}
                    stroke={COLOR_ABSENT}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <line
                    x1={size - 4}
                    y1={4}
                    x2={4}
                    y2={size - 4}
                    stroke={COLOR_ABSENT}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </>
              )}
              {/* Tooth-level preview overlay marks */}
              {showToothPreview &&
                tool === "extraction" &&
                state.tooth !== "planned-extraction" &&
                state.tooth !== "completed-extraction" && (
                  <line
                    x1={2}
                    y1={size - 2}
                    x2={size - 2}
                    y2={2}
                    stroke={COLOR_PLANNED}
                    strokeWidth={2}
                    strokeDasharray="2 2"
                    opacity={0.7}
                    strokeLinecap="round"
                  />
                )}
              {showToothPreview && completedOnExtraction && (
                <line
                  x1={2}
                  y1={size - 2}
                  x2={size - 2}
                  y2={2}
                  stroke={COLOR_DONE}
                  strokeWidth={2.5}
                  opacity={0.85}
                  strokeLinecap="round"
                />
              )}
              {showToothPreview && tool === "missing" && (
                <>
                  <line
                    x1={4}
                    y1={4}
                    x2={size - 4}
                    y2={size - 4}
                    stroke={COLOR_ABSENT}
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
                    stroke={COLOR_ABSENT}
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
            {state.tooth !== "none" && (
              <div className="capitalize text-foreground/80 mt-1">
                {state.tooth === "planned-extraction" &&
                  "Extracción planificada"}
                {state.tooth === "completed-extraction" &&
                  "Extracción realizada"}
                {state.tooth === "missing" && "Ausente"}
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
  tool: Tool;
  onSurface: (n: number, s: SurfaceKey) => void;
  onToothClick: (n: number) => void;
}

function ArchRow({
  teeth,
  flipped,
  state,
  tool,
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
          tool={tool}
          onSurfaceClick={(s) => onSurface(n, s)}
          onToothClick={() => onToothClick(n)}
        />
      ))}
    </div>
  );
}

type LegendIcon = "square" | "diagonal" | "cross";
const LEGEND: { tool: Tool; label: string; color: string; icon: LegendIcon }[] =
  [
    {
      tool: "planned",
      label: "Carie",
      color: COLOR_PLANNED,
      icon: "square"
    },
    {
      tool: "existing",
      label: "Pre-existente",
      color: COLOR_EXISTING,
      icon: "square"
    },
    {
      tool: "completed",
      label: "Realizado",
      color: COLOR_DONE,
      icon: "square"
    },
    {
      tool: "extraction",
      label: "Extracción",
      color: COLOR_PLANNED,
      icon: "diagonal"
    },
    { tool: "missing", label: "Ausente", color: COLOR_ABSENT, icon: "cross" }
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
      {icon === "diagonal" && (
        <line
          x1={1}
          y1={11}
          x2={11}
          y2={1}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
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
  const teeth: OdontogramSnapshot["teeth"] = {};

  Object.entries(data).forEach(([tooth, value]) => {
    teeth[tooth] = {
      tooth: value.tooth,
      surfaces: value.surfaces
    };
  });

  return { teeth };
}

function fromSnapshot(snapshot: OdontogramSnapshot | null): Record<number, ToothState> {
  if (!snapshot) return {};

  return Object.entries(snapshot.teeth).reduce<Record<number, ToothState>>(
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
    if (tooth.tooth !== "none") {
      return true;
    }

    return SURFACE_KEYS.some((surface) => tooth.surfaces[surface] !== "healthy");
  });
}

interface OdontogramTabProps {
  patientId: string;
}

export function OdontogramTab({ patientId }: OdontogramTabProps) {
  const [data, setData] = useState<Record<number, ToothState>>({});
  const [savedData, setSavedData] = useState<Record<number, ToothState>>({});
  const [tool, setTool] = useState<Tool>("planned");
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
    nextTargetState: SurfaceState | ToothCondition
  ) => {
    const targetKey = e.surface ? `s:${e.tooth}:${e.surface}` : `t:${e.tooth}`;
    const savedTooth = savedData[e.tooth] ?? defaultTooth();
    const savedValue: SurfaceState | ToothCondition = e.surface
      ? savedTooth.surfaces[e.surface]
      : savedTooth.tooth;

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
    if (t.tooth === "missing" && tool !== "healthy" && tool !== "missing") {
      return;
    }

    if (tool === "healthy") {
      if (t.surfaces[s] === "healthy") return;
      logEvent({ tooth: n, surface: s, action: "clear-surface" }, "healthy");
      setData({
        ...data,
        [n]: { ...t, surfaces: { ...t.surfaces, [s]: "healthy" } }
      });
      return;
    }

    if (tool === "planned" || tool === "existing" || tool === "completed") {
      const current = t.surfaces[s];
      const next: SurfaceState = current === tool ? "healthy" : tool;
      const action: EventAction = next === "healthy" ? "clear-surface" : next;
      logEvent({ tooth: n, surface: s, action }, next);
      setData({
        ...data,
        [n]: { ...t, surfaces: { ...t.surfaces, [s]: next } }
      });
    }
  };

  const handleToothClick = (n: number) => {
    const t = data[n] ?? defaultTooth();

    if (tool === "healthy") {
      if (t.tooth === "none") return;
      logEvent({ tooth: n, action: "clear-tooth" }, "none");
      setData({ ...data, [n]: { ...t, tooth: "none" } });
      return;
    }
    if (tool === "extraction") {
      let next: ToothCondition;
      let action: EventAction;
      if (t.tooth === "planned-extraction") {
        next = "none";
        action = "clear-tooth";
      } else if (t.tooth === "none" || t.tooth === "missing") {
        next = "planned-extraction";
        action = "planned-extraction";
      } else {
        next = "none";
        action = "clear-tooth";
      }
      logEvent({ tooth: n, action }, next);
      setData({ ...data, [n]: { ...t, tooth: next } });
      return;
    }
    if (tool === "missing") {
      const next: ToothCondition = t.tooth === "missing" ? "none" : "missing";
      logEvent(
        { tooth: n, action: next === "none" ? "clear-tooth" : "missing" },
        next
      );
      setData({ ...data, [n]: { ...t, tooth: next } });
      return;
    }
    if (tool === "completed" && t.tooth === "planned-extraction") {
      const next: ToothCondition = "completed-extraction";
      logEvent({ tooth: n, action: "completed-extraction" }, next);
      setData({ ...data, [n]: { ...t, tooth: next } });
    }
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

  const toolHint: Record<Tool, string> = {
    healthy: "Click para limpiar el estado de una cara o diente",
    planned: "Azul · marca un tratamiento a realizar",
    existing: "Rojo · marca un hallazgo previo del paciente",
    completed: "Verde · marca un tratamiento ya realizado",
    extraction: "Marca extracción planificada · click de nuevo para borrar",
    missing: "Marca el diente como ausente"
  };

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
              <p className="text-sm text-muted-foreground">{toolHint[tool]}</p>
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
                tool={tool}
                onSurface={handleSurface}
                onToothClick={handleToothClick}
              />
              <div className="h-12 w-px bg-border" />
              <ArchRow
                teeth={layout.upperLeft}
                flipped={false}
                state={data}
                tool={tool}
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
                tool={tool}
                onSurface={handleSurface}
                onToothClick={handleToothClick}
              />
              <div className="h-12 w-px bg-border" />
              <ArchRow
                teeth={layout.lowerLeft}
                flipped={true}
                state={data}
                tool={tool}
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
              Herramienta activa
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {LEGEND.map((l) => {
                const active = tool === l.tool;
                return (
                  <button
                    key={l.tool}
                    type="button"
                    onClick={() => setTool(l.tool)}
                    className={cn(
                      "group flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all",
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

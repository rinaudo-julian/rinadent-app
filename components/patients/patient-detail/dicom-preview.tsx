"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ensureCornerstoneInitialized } from "@/lib/cornerstone/init";

interface DicomPreviewProps {
  imageUrl: string;
  className?: string;
}

export function DicomPreview({ imageUrl, className }: DicomPreviewProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<{
    setStack: (imageIds: string[], currentImageIdIndex: number) => Promise<void>;
    render: () => void;
    resetCamera?: () => void;
  } | null>(null);
  const renderingEngineRef = useRef<{
    resize: (immediate?: boolean, keepCamera?: boolean) => void;
    disableElement: (viewportId: string) => void;
    destroy: () => void;
  } | null>(null);
  const [hasError, setHasError] = useState(false);
  const viewportId = useId().replace(/:/g, "-");
  const renderingEngineId = `dicom-engine-${viewportId}`;

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let rafId: number | null = null;

    async function renderDicom() {
      const element = elementRef.current;
      if (!element) return;

      try {
        setHasError(false);
        await ensureCornerstoneInitialized();
        if (cancelled) return;

        const cornerstone = await import("@cornerstonejs/core");
        if (cancelled) return;

        const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);
        renderingEngineRef.current = renderingEngine as {
          resize: (immediate?: boolean, keepCamera?: boolean) => void;
          disableElement: (viewportId: string) => void;
          destroy: () => void;
        };

        renderingEngine.enableElement({
          viewportId,
          type: cornerstone.Enums.ViewportType.STACK,
          element,
          defaultOptions: {
            background: [0, 0, 0],
          },
        });

        const viewport = renderingEngine.getViewport(viewportId) as unknown as {
          setStack: (imageIds: string[], currentImageIdIndex: number) => Promise<void>;
          render: () => void;
          resetCamera?: () => void;
        };
        viewportRef.current = viewport;

        await viewport.setStack([`wadouri:${imageUrl}`], 0);
        viewport.resetCamera?.();
        viewport.render();

        rafId = window.requestAnimationFrame(() => {
          renderingEngineRef.current?.resize(true, false);
          viewportRef.current?.render();
        });

        resizeObserver = new ResizeObserver(() => {
          renderingEngineRef.current?.resize(true, false);
          viewportRef.current?.render();
        });

        resizeObserver.observe(element);
      } catch {
        if (!cancelled) {
          setHasError(true);
        }
      }
    }

    void renderDicom();

    return () => {
      cancelled = true;

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (renderingEngineRef.current) {
        try {
          renderingEngineRef.current.disableElement(viewportId);
          renderingEngineRef.current.destroy();
        } catch {
          // noop
        }
      }

      renderingEngineRef.current = null;
      viewportRef.current = null;
    };
  }, [imageUrl, renderingEngineId, viewportId]);

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
        No se pudo previsualizar DICOM
      </div>
    );
  }

  return <div ref={elementRef} className={className} />;
}

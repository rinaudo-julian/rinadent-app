"use client";

let initPromise: Promise<void> | null = null;

export function ensureCornerstoneInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      if (typeof window === "undefined") {
        return;
      }

      const [{ init: initCornerstone }, { init: initDicomImageLoader }] = await Promise.all([
        import("@cornerstonejs/core"),
        import("@cornerstonejs/dicom-image-loader"),
      ]);

      await initCornerstone();
      initDicomImageLoader({
        maxWebWorkers:
          typeof navigator !== "undefined"
            ? Math.max(1, Math.min(4, navigator.hardwareConcurrency || 1))
            : 1,
      });
    })();
  }

  return initPromise;
}

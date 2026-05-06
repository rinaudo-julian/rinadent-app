"use client";

import { createContext, useContext, useMemo, useState } from "react";

type PrivateBreadcrumbsContextValue = {
  currentPageLabel: string | null;
  setCurrentPageLabel: (label: string | null) => void;
};

const PrivateBreadcrumbsContext = createContext<PrivateBreadcrumbsContextValue | null>(null);

export function PrivateBreadcrumbsProvider({ children }: { children: React.ReactNode }) {
  const [currentPageLabel, setCurrentPageLabel] = useState<string | null>(null);

  const value = useMemo(
    () => ({ currentPageLabel, setCurrentPageLabel }),
    [currentPageLabel]
  );

  return (
    <PrivateBreadcrumbsContext.Provider value={value}>
      {children}
    </PrivateBreadcrumbsContext.Provider>
  );
}

export function usePrivateBreadcrumbs() {
  const context = useContext(PrivateBreadcrumbsContext);

  if (!context) {
    throw new Error("usePrivateBreadcrumbs must be used within PrivateBreadcrumbsProvider");
  }

  return context;
}

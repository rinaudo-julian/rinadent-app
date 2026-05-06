"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { usePrivateBreadcrumbs } from "@/components/private-breadcrumbs-context";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Panel",
  patients: "Pacientes",
  treatments: "Tratamientos"
};

function formatSegmentLabel(segment: string, parent?: string) {
  if (SEGMENT_LABELS[segment]) {
    return SEGMENT_LABELS[segment];
  }

  if (parent === "patients") {
    return "Paciente";
  }

  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function PrivateBreadcrumbs() {
  const segments = useSelectedLayoutSegments();
  const { currentPageLabel } = usePrivateBreadcrumbs();

  const crumbs = segments.map((segment, index) => ({
    segment,
    label:
      index === segments.length - 1 && currentPageLabel
        ? currentPageLabel
        : formatSegmentLabel(segment, segments[index - 1]),
    href: `/${segments.slice(0, index + 1).join("/")}`
  }));

  const currentCrumb = crumbs.at(-1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">RinaDent</BreadcrumbLink>
        </BreadcrumbItem>

        {currentCrumb ? <BreadcrumbSeparator className="hidden md:block" /> : null}

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <BreadcrumbItem key={crumb.href}>
              {isLast ? (
                <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
              {!isLast ? <BreadcrumbSeparator /> : null}
            </BreadcrumbItem>
          );
        })}

        {!currentCrumb ? (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">Panel</BreadcrumbPage>
          </BreadcrumbItem>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

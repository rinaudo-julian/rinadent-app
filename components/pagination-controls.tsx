"use client";

import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  page: number;
  limit: number;
  totalPages: number;
}

export function PaginationControls({
  page,
  limit,
  totalPages
}: PaginationControlsProps) {
  const router = useRouter();

  const goToPage = (newPage: number) => {
    router.push(`/patients?page=${newPage}&limit=${limit}`);
  };

  const goToPrev = () => {
    if (page > 1) {
      goToPage(page - 1);
    }
  };

  const goToNext = () => {
    if (page < totalPages) {
      goToPage(page + 1);
    }
  };

  // Generate pagination items
  const items: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    if (page <= 3) {
      items.push(1, 2, 3, 4, "ellipsis", totalPages);
    } else if (page >= totalPages - 2) {
      items.push(
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      items.push(
        1,
        "ellipsis",
        page - 1,
        page,
        page + 1,
        "ellipsis",
        totalPages
      );
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <button
            onClick={goToPrev}
            disabled={page <= 1}
            className="pointer-events-auto flex size-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label="Previous page"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </PaginationItem>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <button
                onClick={() => goToPage(item)}
                className={
                  item === page
                    ? "flex size-10 items-center justify-center rounded-md bg-background font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    : "flex size-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <button
            onClick={goToNext}
            disabled={page >= totalPages}
            className="pointer-events-auto flex size-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label="Next page"
          >
            <span className="sr-only">Next</span>
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

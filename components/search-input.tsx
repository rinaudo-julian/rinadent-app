"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialValue = searchParams.get("search") || "";
  const [value, setValue] = useState(initialValue);

  // Debounce search - wait 300ms after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      params.set("page", "1");
      if (value.trim()) {
        params.set("search", value.trim());
      }
      router.push(`/patients?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, router]);

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="Buscar paciente..."
        className="pl-10"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface LimitSelectorProps {
  limit: number;
  total: number;
}

export function LimitSelector({ limit, total }: LimitSelectorProps) {
  const router = useRouter();

  const handleLimitChange = (value: string) => {
    const newLimit = parseInt(value);
    router.push(`/patients?page=1&limit=${newLimit}`);
  };

  return (
    <>
      <span className="text-sm text-muted-foreground">Mostrar</span>
      <Select value={limit.toString()} onValueChange={handleLimitChange}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground">
        de {total} pacientes
      </span>
    </>
  );
}

import { Button } from "@/components/ui/button";
import { PatientsTable } from "@/components/patients/patients-table";
import { SearchInput } from "@/components/search-input";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function PatientsPage() {
  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <Button asChild>
            <Link href="/patients/new">
              <Plus className="size-4 mr-2" />
              Nuevo Paciente
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <SearchInput />
        </div>
      </div>

      <PatientsTable />
    </div>
  );
}

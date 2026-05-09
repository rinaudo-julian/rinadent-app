"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import type { PaginatedPatientsResponse } from "@/hooks/use-patients"

async function searchPatientsByName(search: string): Promise<PaginatedPatientsResponse> {
  const params = new URLSearchParams({
    page: "1",
    limit: "20",
    search
  })

  const response = await fetch(`/api/patients?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to search patients")
  }

  return response.json()
}

export function PatientSearchCommand() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => clearTimeout(timer)
  }, [query])

  const shouldSearch = debouncedQuery.length > 0

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      setQuery("")
      setDebouncedQuery("")
    }
  }

  const { data, isFetching, isError } = useQuery({
    queryKey: ["patients", "command-search", debouncedQuery],
    queryFn: () => searchPatientsByName(debouncedQuery),
    enabled: shouldSearch
  })

  const patients = data?.data ?? []

  return (
    <>
      <div className="relative w-full max-w-sm ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Buscar paciente..."
          className="pl-10 cursor-text"
          readOnly
          onClick={() => setOpen(true)}
          onFocus={(event) => {
            event.target.blur()
            setOpen(true)
          }}
          aria-label="Buscar paciente"
        />
      </div>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Buscar paciente"
        description="Buscar paciente por nombre"
        className="max-w-2xl"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar paciente por nombre..."
          />

          <CommandList>
            <CommandEmpty>
              {query.trim().length === 0
                ? "Escribí el nombre del paciente para buscar."
                : "No se encontraron pacientes."}
            </CommandEmpty>

            {shouldSearch && isFetching ? (
              <CommandGroup heading="Pacientes">
                <CommandItem disabled>Buscando pacientes...</CommandItem>
              </CommandGroup>
            ) : null}

            {shouldSearch && isError ? (
              <CommandGroup heading="Pacientes">
                <CommandItem disabled>No pudimos buscar pacientes. Intentá de nuevo.</CommandItem>
              </CommandGroup>
            ) : null}

            {shouldSearch && !isFetching && !isError ? (
              <CommandGroup heading="Pacientes">
                {patients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={`${patient.first_name} ${patient.last_name}`}
                    onSelect={() => {
                      setOpen(false)
                      router.push(`/patients/${patient.id}`)
                    }}
                  >
                    <div className="flex flex-col">
                      <span>
                        {patient.first_name} {patient.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">DNI: {patient.dni}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

import type { PatientLedger } from "@/components/payments/types/patient-ledger.types";

export const PATIENT_LEDGER_MOCKS: PatientLedger[] = [
  {
    patientId: "123",
    initialBudgetDate: "2026-03-15",
    initialBudgetAmount: 310000,
    currentBudgetAmount: 372000,
    coveredAmount: 170000,
    movements: [
      { id: "m1", method: "Transferencia", amount: 35000, date: "2026-04-01" },
      { id: "m2", method: "Tarjeta", amount: 25000, date: "2026-04-03" },
      { id: "m3", method: "Efectivo", amount: 30000, date: "2026-04-07" },
      { id: "m4", method: "Transferencia", amount: 18000, date: "2026-04-10" },
      { id: "m5", method: "Tarjeta", amount: 28000, date: "2026-04-14" },
      { id: "m6", method: "Efectivo", amount: 34000, date: "2026-04-17" },
      { id: "m7", method: "Transferencia", amount: 22000, date: "2026-04-19" },
      { id: "m8", method: "Tarjeta", amount: 26000, date: "2026-04-22" },
      { id: "m9", method: "Efectivo", amount: 28000, date: "2026-04-25" },
      { id: "m10", method: "Transferencia", amount: 24000, date: "2026-04-27" },
      { id: "m11", method: "Tarjeta", amount: 40000, date: "2026-04-30" }
    ]
  },
  {
    patientId: "empty",
    initialBudgetDate: undefined,
    initialBudgetAmount: 0,
    currentBudgetAmount: 0,
    coveredAmount: 0,
    movements: []
  }
];

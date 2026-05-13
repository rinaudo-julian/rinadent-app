import { NextResponse } from "next/server";

import { DEFAULT_LIMIT, normalizePage, normalizePageSize } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

interface PaymentApiRow {
  budget_id: string;
  budget_number: string;
  first_name: string;
  last_name: string;
  method: string;
  amount: number;
  created_at: string;
}

type PaymentJoinPatient = {
  first_name: string;
  last_name: string;
};

type PaymentJoinMethod = {
  name: string;
};

type PaymentJoinBudget = {
  id: string;
  budget_number: string;
  patients: PaymentJoinPatient | PaymentJoinPatient[] | null;
};

function getJoinedPatient(joined: PaymentJoinPatient | PaymentJoinPatient[] | null | undefined): PaymentJoinPatient {
  if (Array.isArray(joined)) {
    return joined[0] ?? { first_name: "", last_name: "" };
  }

  return joined ?? { first_name: "", last_name: "" };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPage = searchParams.get("page");
  const rawLimit = searchParams.get("limit");

  const page = normalizePage(rawPage);
  const limit = normalizePageSize(rawLimit, DEFAULT_LIMIT);
  const offset = Math.max(0, (page - 1) * limit);

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("payments")
    .select(
      `
      amount,
      created_at,
      payment_methods!inner(name),
      patient_budgets!inner(
        id,
        budget_number,
        patients!inner(first_name,last_name)
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: "Error fetching payments", details: error.message },
      { status: 500 }
    );
  }

  function getJoinedMethod(
    joined: PaymentJoinMethod | PaymentJoinMethod[] | null | undefined
  ): PaymentJoinMethod {
    if (Array.isArray(joined)) {
      return joined[0] ?? { name: "" };
    }

    return joined ?? { name: "" };
  }

  function getJoinedBudget(
    joined: PaymentJoinBudget | PaymentJoinBudget[] | null | undefined
  ): PaymentJoinBudget {
    if (Array.isArray(joined)) {
      return joined[0] ?? { id: "", budget_number: "", patients: null };
    }

    return joined ?? { id: "", budget_number: "", patients: null };
  }

  const rows: PaymentApiRow[] =
    (data ?? []).map((item) => {
      const method = getJoinedMethod(item.payment_methods);
      const budget = getJoinedBudget(item.patient_budgets);
      const patient = getJoinedPatient(budget.patients);

      return {
        budget_id: budget.id,
        budget_number: budget.budget_number,
        first_name: patient.first_name,
        last_name: patient.last_name,
        method: method.name,
        amount: Number(item.amount),
        created_at: item.created_at
      };
    });

  const total = count ?? 0;

  return NextResponse.json({
    data: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type BudgetRow = {
  id: string;
  initial_total: number;
  created_at: string;
  settled_at: string | null;
  settled_paid_total: number | null;
};

type BudgetItemJoinTreatment = {
  price: number;
};

type BudgetItemRow = {
  quantity: number;
  treatments: BudgetItemJoinTreatment | BudgetItemJoinTreatment[] | null;
};

function getJoinedTreatment(
  joined: BudgetItemJoinTreatment | BudgetItemJoinTreatment[] | null | undefined
): BudgetItemJoinTreatment {
  if (Array.isArray(joined)) {
    return joined[0] ?? { price: 0 };
  }

  return joined ?? { price: 0 };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

  if (!uuidRegex.test(patientId)) {
    return NextResponse.json(
      { error: "ID de paciente inválido", details: "Formato UUID inválido" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: budgetRows, error: budgetError } = await supabase
    .from("patient_budgets")
    .select("id, initial_total, created_at, settled_at, settled_paid_total")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (budgetError) {
    return NextResponse.json(
      { error: "Error fetching patient budget", details: budgetError.message },
      { status: 500 }
    );
  }

  const budget = (budgetRows?.[0] as BudgetRow | undefined) ?? null;

  if (!budget) {
    return NextResponse.json({
      budgetId: null,
      patientId,
      budgetDate: null,
      initialTotal: 0,
      currentTotal: 0,
      coveredTotal: 0,
      pendingTotal: 0,
      increaseAmount: 0,
      increasePct: 0
    });
  }

  let budgetItems: BudgetItemRow[] | null = null;

  if (budget.settled_paid_total === null) {
    const { data: itemsData, error: itemsError } = await supabase
      .from("patient_budget_items")
      .select(
        `
        quantity,
        treatments!inner(price)
      `
      )
      .eq("budget_id", budget.id);

    if (itemsError) {
      return NextResponse.json(
        { error: "Error fetching patient budget", details: itemsError.message },
        { status: 500 }
      );
    }

    budgetItems = (itemsData as BudgetItemRow[] | null) ?? [];
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("amount")
    .eq("patient_id", patientId);

  if (paymentsError) {
    return NextResponse.json(
      { error: "Error fetching patient budget", details: paymentsError.message },
      { status: 500 }
    );
  }

  const initialTotal = Number(budget.initial_total);
  const currentTotal =
    budget.settled_paid_total !== null
      ? Number(budget.settled_paid_total)
      : (budgetItems as BudgetItemRow[] | null)?.reduce((acc, item) => {
          const treatment = getJoinedTreatment(item.treatments);
          return acc + Number(item.quantity) * Number(treatment.price);
        }, 0) ?? 0;

  const coveredTotal = payments?.reduce((acc, payment) => acc + Number(payment.amount), 0) ?? 0;
  const pendingTotal = Math.max(currentTotal - coveredTotal, 0);
  const increaseAmount = currentTotal - initialTotal;
  const increasePct = initialTotal > 0 ? Math.round((increaseAmount / initialTotal) * 100) : 0;

  return NextResponse.json({
    budgetId: budget.id,
    patientId,
    budgetDate: budget.created_at,
    initialTotal,
    currentTotal,
    coveredTotal,
    pendingTotal,
    increaseAmount,
    increasePct
  });
}

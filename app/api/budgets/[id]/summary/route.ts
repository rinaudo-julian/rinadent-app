import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type BudgetRow = {
  id: string;
  patient_id: string;
  budget_number: string;
  initial_total: number;
  created_at: string;
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
  const { id: budgetId } = await params;

  if (!uuidRegex.test(budgetId)) {
    return NextResponse.json(
      { error: "ID de presupuesto inválido", details: "Formato UUID inválido" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: budgetData, error: budgetError } = await supabase
    .from("patient_budgets")
    .select("id, patient_id, budget_number, initial_total, created_at, settled_paid_total")
    .eq("id", budgetId)
    .maybeSingle();

  if (budgetError) {
    return NextResponse.json(
      { error: "Error fetching budget summary", details: budgetError.message },
      { status: 500 }
    );
  }

  const budget = budgetData as BudgetRow | null;

  if (!budget) {
    return NextResponse.json(
      { error: "Presupuesto no encontrado", details: "Budget not found" },
      { status: 404 }
    );
  }

  let currentTotal = 0;

  if (budget.settled_paid_total !== null) {
    currentTotal = Number(budget.settled_paid_total);
  } else {
    const { data: budgetItems, error: itemsError } = await supabase
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
        { error: "Error fetching budget summary", details: itemsError.message },
        { status: 500 }
      );
    }

    currentTotal =
      (budgetItems as BudgetItemRow[] | null)?.reduce((acc, item) => {
        const treatment = getJoinedTreatment(item.treatments);
        return acc + Number(item.quantity) * Number(treatment.price);
      }, 0) ?? 0;
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("amount")
    .eq("budget_id", budget.id);

  if (paymentsError) {
    return NextResponse.json(
      { error: "Error fetching budget summary", details: paymentsError.message },
      { status: 500 }
    );
  }

  const initialTotal = Number(budget.initial_total);
  const coveredTotal = payments?.reduce((acc, payment) => acc + Number(payment.amount), 0) ?? 0;
  const pendingTotal = Math.max(currentTotal - coveredTotal, 0);
  const increaseAmount = currentTotal - initialTotal;
  const increasePct = initialTotal > 0 ? Math.round((increaseAmount / initialTotal) * 100) : 0;

  return NextResponse.json({
    budgetId: budget.id,
    budgetNumber: budget.budget_number,
    patientId: budget.patient_id,
    budgetDate: budget.created_at,
    initialTotal,
    currentTotal,
    coveredTotal,
    pendingTotal,
    increaseAmount,
    increasePct
  });
}

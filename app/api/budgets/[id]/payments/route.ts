import { NextResponse } from "next/server";

import { DEFAULT_LIMIT, normalizePage, normalizePageSize } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PaymentJoinMethod = {
  name: string;
};

function getJoinedMethod(joined: PaymentJoinMethod | PaymentJoinMethod[] | null | undefined): PaymentJoinMethod {
  if (Array.isArray(joined)) {
    return joined[0] ?? { name: "" };
  }

  return joined ?? { name: "" };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: budgetId } = await params;

  if (!uuidRegex.test(budgetId)) {
    return NextResponse.json(
      { error: "ID de presupuesto inválido", details: "Formato UUID inválido" },
      { status: 400 }
    );
  }

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
      id,
      amount,
      created_at,
      payment_methods!inner(name)
    `,
      { count: "exact" }
    )
    .eq("budget_id", budgetId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: "Error fetching budget payments", details: error.message },
      { status: 500 }
    );
  }

  const rows =
    data?.map((item) => {
      const method = getJoinedMethod(item.payment_methods);

      return {
        id: item.id,
        method: method.name,
        amount: Number(item.amount),
        created_at: item.created_at
      };
    }) ?? [];

  const total = count ?? 0;

  return NextResponse.json({
    data: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}

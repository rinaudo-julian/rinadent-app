import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bulkPriceUpdateSchema } from "@/lib/schemas/treatments-schema";

export async function PUT(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body inválido", details: "JSON mal formado" },
      { status: 400 }
    );
  }

  const parsed = bulkPriceUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("bulk_update_treatment_prices", {
    p_codes: parsed.data.codes,
    p_mode: parsed.data.mode,
    p_value: parsed.data.value
  });

  if (error) {
    return NextResponse.json(
      { error: "Error updating treatment prices", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ updatedCount: Number(data ?? 0) });
}

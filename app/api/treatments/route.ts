import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { treatmentsListSchema } from "@/lib/schemas/treatments-schema";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("treatments")
    .select("code,name,price")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Error fetching treatments", details: error.message },
      { status: 500 }
    );
  }

  const parsed = treatmentsListSchema.safeParse(data ?? []);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Error parsing treatments",
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 500 }
    );
  }

  return NextResponse.json(parsed.data);
}

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasDbIntegrationEnv = Boolean(supabaseUrl && serviceRoleKey);

describe("payments DB integration", () => {
  if (!hasDbIntegrationEnv) {
    it.skip("requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY", () => {
      // Intentionally skipped when DB integration env is unavailable.
    });
    return;
  }

  const admin = createClient(supabaseUrl as string, serviceRoleKey as string, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  it("accepts valid payment rows and auto-populates created_at", async () => {
    const unique = crypto.randomUUID();
    const dni = `${Math.floor(Math.random() * 90_000_000) + 10_000_000}`;

    const { data: patient, error: patientError } = await admin
      .from("patients")
      .insert({
        first_name: `Test-${unique}`,
        last_name: "Paciente",
        dni,
        date_of_birth: "1990-01-01",
        street: "Calle Falsa",
        street_number: "123",
        locality: "CABA",
        postal_code: "1000",
        gender: "other",
        condition_coverage: "private",
        phone: "1100000000"
      })
      .select("id")
      .single();

    expect(patientError).toBeNull();
    expect(patient?.id).toBeTypeOf("string");

    const { data: method, error: methodError } = await admin
      .from("payment_methods")
      .insert({ name: `Metodo-${unique}` })
      .select("id")
      .single();

    expect(methodError).toBeNull();
    expect(method?.id).toBeTypeOf("string");

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .insert({
        patient_id: patient!.id,
        method_id: method!.id,
        amount: 100
      })
      .select("id, patient_id, method_id, amount, created_at")
      .single();

    expect(paymentError).toBeNull();
    expect(payment?.patient_id).toBe(patient!.id);
    expect(payment?.method_id).toBe(method!.id);
    expect(Number(payment?.amount)).toBe(100);
    expect(payment?.created_at).toBeTypeOf("string");
    expect(Number.isNaN(Date.parse(payment!.created_at))).toBe(false);

    await admin.from("payments").delete().eq("id", payment!.id);
    await admin.from("payment_methods").delete().eq("id", method!.id);
    await admin.from("patients").delete().eq("id", patient!.id);
  });

  it("rejects amount <= 0 and invalid foreign keys", async () => {
    const unique = crypto.randomUUID();
    const dni = `${Math.floor(Math.random() * 90_000_000) + 10_000_000}`;

    const { data: patient, error: patientError } = await admin
      .from("patients")
      .insert({
        first_name: `Test-${unique}`,
        last_name: "Paciente",
        dni,
        date_of_birth: "1990-01-01",
        street: "Calle Falsa",
        street_number: "123",
        locality: "CABA",
        postal_code: "1000",
        gender: "other",
        condition_coverage: "private",
        phone: "1100000000"
      })
      .select("id")
      .single();

    expect(patientError).toBeNull();

    const { data: method, error: methodError } = await admin
      .from("payment_methods")
      .insert({ name: `Metodo-${unique}` })
      .select("id")
      .single();

    expect(methodError).toBeNull();

    const { error: amountConstraintError } = await admin.from("payments").insert({
      patient_id: patient!.id,
      method_id: method!.id,
      amount: 0
    });

    expect(amountConstraintError).toBeTruthy();
    expect(amountConstraintError?.message.toLowerCase()).toContain("check constraint");

    const { error: fkError } = await admin.from("payments").insert({
      patient_id: crypto.randomUUID(),
      method_id: method!.id,
      amount: 250
    });

    expect(fkError).toBeTruthy();
    expect(fkError?.message.toLowerCase()).toContain("foreign key");

    await admin.from("payment_methods").delete().eq("id", method!.id);
    await admin.from("patients").delete().eq("id", patient!.id);
  });
});

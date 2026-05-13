CREATE TABLE IF NOT EXISTS patient_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  initial_total NUMERIC(12,2) NOT NULL CHECK (initial_total >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES patient_budgets(id) ON DELETE CASCADE,
  treatment_code TEXT NOT NULL REFERENCES treatments(code) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_budgets_patient_id_created_at_desc
  ON patient_budgets(patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_budget_items_budget_id
  ON patient_budget_items(budget_id);

CREATE INDEX IF NOT EXISTS idx_patient_budget_items_treatment_code
  ON patient_budget_items(treatment_code);

ALTER TABLE patient_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_budget_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated reads patient_budgets" ON patient_budgets
    FOR SELECT TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated insert patient_budgets" ON patient_budgets
    FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated update patient_budgets" ON patient_budgets
    FOR UPDATE TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated reads patient_budget_items" ON patient_budget_items
    FOR SELECT TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated insert patient_budget_items" ON patient_budget_items
    FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated update patient_budget_items" ON patient_budget_items
    FOR UPDATE TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

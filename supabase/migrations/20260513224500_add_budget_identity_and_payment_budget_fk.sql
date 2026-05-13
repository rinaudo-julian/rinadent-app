ALTER TABLE patient_budgets
  ADD COLUMN IF NOT EXISTS budget_number TEXT;

ALTER TABLE patient_budgets
  ALTER COLUMN budget_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_budgets_budget_number_unique
  ON patient_budgets(budget_number);

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES patient_budgets(id) ON DELETE RESTRICT;

ALTER TABLE payments
  ALTER COLUMN budget_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_budget_id
  ON payments(budget_id);

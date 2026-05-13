ALTER TABLE patient_budgets
  ADD COLUMN IF NOT EXISTS settled_at TIMESTAMP WITH TIME ZONE NULL,
  ADD COLUMN IF NOT EXISTS settled_paid_total NUMERIC(12,2) NULL CHECK (settled_paid_total >= 0);

ALTER TABLE patient_budget_items
  ADD COLUMN IF NOT EXISTS unit_price_snapshot NUMERIC(12,2);

UPDATE patient_budget_items
SET unit_price_snapshot = CASE
  WHEN quantity > 0 THEN ROUND(subtotal / quantity, 2)
  ELSE 0
END
WHERE unit_price_snapshot IS NULL;

ALTER TABLE patient_budget_items
  ALTER COLUMN unit_price_snapshot SET NOT NULL;

ALTER TABLE patient_budget_items
  ADD CONSTRAINT patient_budget_items_unit_price_snapshot_non_negative
  CHECK (unit_price_snapshot >= 0);

ALTER TABLE patient_budget_items
  DROP COLUMN IF EXISTS subtotal;

-- Add dni and remove is_active from existing patients table
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS dni TEXT;

UPDATE patients
SET dni = COALESCE(dni, 'PENDIENTE')
WHERE dni IS NULL;

ALTER TABLE patients
  ALTER COLUMN dni SET NOT NULL;

DROP INDEX IF EXISTS idx_patients_active;

ALTER TABLE patients
  DROP COLUMN IF EXISTS is_active;

DROP POLICY IF EXISTS "Allow authenticated reads active patients" ON patients;

CREATE POLICY "Allow authenticated reads patients" ON patients
  FOR SELECT TO authenticated USING (true);

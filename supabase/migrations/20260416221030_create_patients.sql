-- Create patients table
DO $$ BEGIN
  CREATE TYPE condition_coverage AS ENUM ('health_insurance', 'private');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gender AS ENUM ('male', 'female', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  street TEXT NOT NULL,
  street_number TEXT NOT NULL,
  locality TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  gender gender NOT NULL,
  condition_coverage condition_coverage NOT NULL,
  phone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(is_active);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated reads active patients" ON patients
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow authenticated insert patients" ON patients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update patients" ON patients
  FOR UPDATE TO authenticated USING (true);

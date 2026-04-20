-- Create study_type enum
DO $$ BEGIN
  CREATE TYPE study_type AS ENUM ('radiography', 'tomography', 'photography');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create studies table
CREATE TABLE IF NOT EXISTS studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type study_type NOT NULL,
  study_date DATE NOT NULL CHECK (study_date <= CURRENT_DATE),
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studies_patient_created_at
  ON studies(patient_id, created_at DESC);

ALTER TABLE studies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated read studies" ON studies
    FOR SELECT TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated insert studies" ON studies
    FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated update studies" ON studies
    FOR UPDATE TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Storage bucket for patient studies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pacients-studies-bucket',
  'pacients-studies-bucket',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated read studies objects" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'pacients-studies-bucket');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated upload studies objects" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'pacients-studies-bucket'
      AND name LIKE 'patient-%-studies/%'
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

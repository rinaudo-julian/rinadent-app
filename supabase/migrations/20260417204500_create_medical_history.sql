-- Create medical_history table
DO $$ BEGIN
  CREATE TYPE oncological_treatment AS ENUM ('completed', 'ongoing', 'none');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lab_result_status AS ENUM ('none', 'normal', 'altered');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Boolean fields (0 = No, 1 = Yes)
  allergies INTEGER NOT NULL CHECK (allergies IN (0,1)),
  heart_condition INTEGER NOT NULL CHECK (heart_condition IN (0,1)),
  diabetes INTEGER NOT NULL CHECK (diabetes IN (0,1)),
  hypertension INTEGER NOT NULL CHECK (hypertension IN (0,1)),
  anticoagulation INTEGER NOT NULL CHECK (anticoagulation IN (0,1)),
  bisphosphonates INTEGER NOT NULL CHECK (bisphosphonates IN (0,1)),
  osteoporosis INTEGER NOT NULL CHECK (osteoporosis IN (0,1)),
  hemophilia INTEGER NOT NULL CHECK (hemophilia IN (0,1)),
  covid INTEGER NOT NULL CHECK (covid IN (0,1)),
  covid_observation TEXT,
  bone_density_studies INTEGER NOT NULL CHECK (bone_density_studies IN (0,1)),
  
  -- Text fields
  medications TEXT,
  
  -- Enums
  oncological_treatment oncological_treatment NOT NULL DEFAULT 'none',
  previous_lab_results lab_result_status NOT NULL DEFAULT 'none',
  current_lab_results lab_result_status NOT NULL DEFAULT 'none',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by patient
CREATE INDEX IF NOT EXISTS idx_medical_history_patient ON medical_history(patient_id);

-- RLS
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read medical_history" ON medical_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert medical_history" ON medical_history
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update medical_history" ON medical_history
  FOR UPDATE TO authenticated USING (true);
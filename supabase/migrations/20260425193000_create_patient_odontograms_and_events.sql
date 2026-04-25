-- Create patient odontograms snapshot table
CREATE TABLE IF NOT EXISTS patient_odontograms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  snapshot JSONB NULL DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID NULL REFERENCES auth.users(id),
  UNIQUE (patient_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_odontograms_patient_id
  ON patient_odontograms(patient_id);

ALTER TABLE patient_odontograms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated read odontograms" ON patient_odontograms
    FOR SELECT TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated insert odontograms" ON patient_odontograms
    FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated update odontograms" ON patient_odontograms
    FOR UPDATE TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create patient odontogram events history table
CREATE TABLE IF NOT EXISTS patient_odontogram_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  odontogram_id UUID NOT NULL REFERENCES patient_odontograms(id) ON DELETE CASCADE,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  tooth SMALLINT NOT NULL,
  surface TEXT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NULL REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_patient_odontogram_events_odontogram_id_occurred_at
  ON patient_odontogram_events(odontogram_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_odontogram_events_odontogram_id_tooth
  ON patient_odontogram_events(odontogram_id, tooth);

ALTER TABLE patient_odontogram_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated read odontogram events" ON patient_odontogram_events
    FOR SELECT TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated insert odontogram events" ON patient_odontogram_events
    FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

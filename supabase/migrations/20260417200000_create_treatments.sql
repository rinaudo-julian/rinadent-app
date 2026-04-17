CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatments_created_at ON treatments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_treatments_code ON treatments(code);
CREATE INDEX IF NOT EXISTS idx_treatments_name ON treatments(name);

ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated reads treatments" ON treatments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert treatments" ON treatments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update treatments" ON treatments
  FOR UPDATE TO authenticated USING (true);

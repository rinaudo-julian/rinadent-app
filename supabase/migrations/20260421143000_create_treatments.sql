CREATE TABLE IF NOT EXISTS treatments (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_treatments_name ON treatments(name);

ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated read treatments" ON treatments
    FOR SELECT TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated update treatments" ON treatments
    FOR UPDATE TO authenticated USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE OR REPLACE FUNCTION bulk_update_treatment_prices(
  p_codes TEXT[],
  p_mode TEXT,
  p_value NUMERIC
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  requested_count INTEGER;
  existing_count INTEGER;
  updated_count INTEGER;
BEGIN
  IF p_codes IS NULL OR array_length(p_codes, 1) IS NULL THEN
    RAISE EXCEPTION 'codes_empty';
  END IF;

  IF p_value < 0 THEN
    RAISE EXCEPTION 'invalid_value';
  END IF;

  IF p_mode NOT IN ('unit', 'percentage') THEN
    RAISE EXCEPTION 'invalid_mode';
  END IF;

  WITH requested_codes AS (
    SELECT DISTINCT unnest(p_codes) AS code
  )
  SELECT COUNT(*) INTO requested_count FROM requested_codes;

  WITH requested_codes AS (
    SELECT DISTINCT unnest(p_codes) AS code
  )
  SELECT COUNT(*)
  INTO existing_count
  FROM treatments t
  INNER JOIN requested_codes rc ON rc.code = t.code;

  IF existing_count <> requested_count THEN
    RAISE EXCEPTION 'missing_codes';
  END IF;

  UPDATE treatments
  SET price = CASE
    WHEN p_mode = 'unit' THEN price + p_value
    WHEN p_mode = 'percentage' THEN ROUND(price * (1 + p_value / 100.0), 2)
    ELSE price
  END
  WHERE code = ANY(p_codes);

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  RETURN updated_count;
END;
$$;

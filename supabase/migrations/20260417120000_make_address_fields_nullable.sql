-- Make address fields optional (nullable)
ALTER TABLE patients ALTER COLUMN street DROP NOT NULL;
ALTER TABLE patients ALTER COLUMN street_number DROP NOT NULL;
ALTER TABLE patients ALTER COLUMN locality DROP NOT NULL;
ALTER TABLE patients ALTER COLUMN postal_code DROP NOT NULL;
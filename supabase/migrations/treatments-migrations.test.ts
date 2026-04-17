import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const CREATE_MIGRATION_PATH = join(
  process.cwd(),
  "supabase/migrations/20260417200000_create_treatments.sql"
);

const RESTRICT_MIGRATION_PATH = join(
  process.cwd(),
  "supabase/migrations/20260417223000_restrict_treatments_rls_get_only.sql"
);

describe("treatments migrations", () => {
  it("defines treatments table with required columns and no out-of-scope columns", () => {
    expect(existsSync(CREATE_MIGRATION_PATH)).toBe(true);

    const sql = readFileSync(CREATE_MIGRATION_PATH, "utf8");

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS treatments");
    expect(sql).toContain("id UUID PRIMARY KEY");
    expect(sql).toContain("code TEXT UNIQUE NOT NULL");
    expect(sql).toContain("name TEXT NOT NULL");
    expect(sql).toContain("created_at TIMESTAMP WITH TIME ZONE");
    expect(sql).toContain("updated_at TIMESTAMP WITH TIME ZONE");

    expect(sql).not.toMatch(/\bdescription\b/i);
    expect(sql).not.toMatch(/\bis_active\b/i);
  });

  it("provides a corrective migration that enforces read-only RLS policies", () => {
    expect(existsSync(RESTRICT_MIGRATION_PATH)).toBe(true);

    const createSql = readFileSync(CREATE_MIGRATION_PATH, "utf8");
    const sql = readFileSync(RESTRICT_MIGRATION_PATH, "utf8");

    expect(createSql).toContain('CREATE POLICY "Allow authenticated reads treatments" ON treatments');
    expect(createSql).toContain('CREATE POLICY "Allow authenticated insert treatments" ON treatments');
    expect(createSql).toContain('CREATE POLICY "Allow authenticated update treatments" ON treatments');

    expect(sql).toContain('DROP POLICY IF EXISTS "Allow authenticated insert treatments" ON treatments;');
    expect(sql).toContain('DROP POLICY IF EXISTS "Allow authenticated update treatments" ON treatments;');
    expect(sql).not.toContain('DROP POLICY IF EXISTS "Allow authenticated reads treatments" ON treatments;');
    expect(sql).not.toMatch(/ON\s+patients/i);
    expect(sql).not.toMatch(/FOR\s+INSERT/i);
    expect(sql).not.toMatch(/FOR\s+UPDATE/i);
  });
});

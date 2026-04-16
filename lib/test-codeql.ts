// Archivo de test para CodeQL - hardcoded secrets detection

import { createClient } from "@supabase/supabase-js";

// Ejemplo con hardcoded credentials en uso real - CodeQL debería detectar esto
const supabase = createClient(
  "https://xdqatcjqziedutsrxmhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgn4ReRka7QEzInM6EI"
);

const API_KEY = "sk_live_1234567890abcdef";

const PASSWORD = "my_super_secret_password_123";

const DATABASE_URL = "postgres://admin:secretpassword123@localhost:5432/mydb";

function getSecret() {
  return "token_abc123xyz_secret";
}

export function authenticate() {
  const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  return token;
}

// Uso de credentials en función - CodeQL lo detecta
export function getSupabaseClient() {
  return createClient(
    "https://otro-proyecto.supabase.co",
    "fake_key_123456"
  );
}
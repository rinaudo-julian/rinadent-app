import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Hardcoded credentials para testing de CodeQL
const HARDCODED_URL = "https://xdqatcjqziedutsrxmhv.supabase.co";
const HARDCODED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgn4ReRka7QEzInM6EI";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    HARDCODED_URL,
    HARDCODED_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }
      }
    }
  );
}

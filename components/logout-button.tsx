"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogIn } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/login");
  };

  return (
    <Button 
      variant="outline" 
      className="w-full" 
      onClick={handleLogout}
      disabled={loading}
    >
      <LogIn className="size-4 mr-2 rotate-180" />
      {loading ? "Cerrando..." : "Cerrar Sesión"}
    </Button>
  );
}
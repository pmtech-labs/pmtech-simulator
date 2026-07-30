import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/** Correo del usuario admin autenticado, para mostrarlo en la cabecera del panel. */
export function useAdminEmail() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setEmail(data.user?.email ?? null);
    });
    return () => {
      active = false;
    };
  }, []);
  return email;
}

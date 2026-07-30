import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/services/adminService";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel interno · Simulador PMP" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Herramientas internas de gestión del banco de preguntas." },
      { property: "og:title", content: "Panel interno" },
      { property: "og:description", content: "Uso interno del equipo." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  const access = useQuery({
    queryKey: ["admin-access"],
    queryFn: checkIsAdmin,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [access.data]);

  useEffect(() => {
    if (access.data && access.data.authenticated && !access.data.isAdmin) {
      navigate({ to: "/", replace: true });
    }
  }, [access.data, navigate]);

  if (access.isPending || access.isFetching) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!access.data?.authenticated) {
    return <AdminLogin onSignedIn={() => access.refetch()} />;
  }

  if (!access.data.isAdmin) {
    return <div className="min-h-screen bg-muted/40" />;
  }

  return <AdminContext.Provider value={{ email }}>{<Outlet />}</AdminContext.Provider>;
}

import { createContext, useContext } from "react";

const AdminContext = createContext<{ email: string | null }>({ email: null });

export function useAdminEmail() {
  return useContext(AdminContext).email;
}

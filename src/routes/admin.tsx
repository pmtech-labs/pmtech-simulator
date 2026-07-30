import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { AdminLogin } from "@/components/admin/AdminLogin";
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

  const access = useQuery({
    queryKey: ["admin-access"],
    queryFn: checkIsAdmin,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const denied = Boolean(access.data && access.data.authenticated && !access.data.isAdmin);

  useEffect(() => {
    if (denied) navigate({ to: "/", replace: true });
  }, [denied, navigate]);

  if (access.isPending) {
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

  return <Outlet />;
}

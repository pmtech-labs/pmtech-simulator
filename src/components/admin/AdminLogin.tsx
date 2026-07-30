import { useState } from "react";
import { Lock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export function AdminLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          setPassword("");
          setLoading(false);
          if (signInError) {
            setError("No se ha podido iniciar sesión. Revisa las credenciales.");
            return;
          }
          onSignedIn();
        }}
        className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold">Acceso interno</h1>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="admin-email">
            Correo electrónico
          </label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="admin-pass">
            Contraseña
          </label>
          <input
            id="admin-pass"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Comprobando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

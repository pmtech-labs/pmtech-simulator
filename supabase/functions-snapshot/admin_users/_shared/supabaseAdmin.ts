import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

export function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const jwt = authHeader.replace("Bearer ", "");
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(jwt);
  if (error || !data?.user) return null;
  return data.user;
}

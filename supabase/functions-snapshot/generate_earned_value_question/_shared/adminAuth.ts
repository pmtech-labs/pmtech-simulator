import { getSupabaseAdmin } from "./supabaseAdmin.ts";

export async function requireAdmin(userId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

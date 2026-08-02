import { supabase } from "@/integrations/supabase/client";

export interface CredentialsInput {
  email: string;
  password: string;
  fullName?: string;
}

/** Traduce los errores de Supabase Auth a mensajes claros en español. */
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "Tu correo aún no está confirmado. Revisa tu bandeja de entrada.";
  if (m.includes("user already registered") || m.includes("already registered"))
    return "Ya existe una cuenta con este correo. Inicia sesión.";
  if (m.includes("password should be at least"))
    return "La contraseña debe tener al menos 8 caracteres.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
  return "No hemos podido completar la operación. Inténtalo de nuevo.";
}

export async function signUpCandidate({ email, password, fullName }: CredentialsInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });
  if (error) throw new Error(authErrorMessage(error.message));
  // Con confirmación por correo activada, session es null: el usuario aún no está dentro.
  return { session: data.session, needsEmailConfirmation: !data.session };
}

/**
 * Aprovisiona la licencia gratuita del candidato recién registrado.
 * Es idempotente: si ya existe una licencia activa devuelve created=false.
 */
export async function provisionFreeLicense(): Promise<{ created: boolean }> {
  const { data, error } = await supabase.functions.invoke("provision_free_license", {
    method: "POST",
  });
  if (error) throw new Error("No hemos podido activar tu plan gratuito.");
  return { created: Boolean((data as { created?: boolean } | null)?.created) };
}

export async function signInCandidate({ email, password }: CredentialsInput) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(authErrorMessage(error.message));
  return data.session;
}

export async function signOutCandidate() {
  await supabase.auth.signOut();
}

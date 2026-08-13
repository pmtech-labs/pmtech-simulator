import { supabase } from "@/integrations/supabase/client";

export interface PartnerContactPayload {
  nombre: string;
  empresa: string;
  email: string;
  telefono?: string;
  mensaje: string;
  /** Honeypot -- campo oculto que un humano nunca rellena, un bot sí. */
  website?: string;
}

export async function sendPartnerContact(
  payload: PartnerContactPayload,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke("partner_contact", {
    method: "POST",
    body: payload,
  });
  if (error) {
    return { ok: false, error: "No se pudo enviar el mensaje. Inténtalo de nuevo en unos minutos." };
  }
  if (data?.error) {
    return { ok: false, error: data.error as string };
  }
  return { ok: true };
}

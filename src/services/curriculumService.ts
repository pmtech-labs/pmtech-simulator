import { supabase } from "@/integrations/supabase/client";

/** Unidades del currículo visibles para el candidato (solo `published`, por RLS). */
export interface PublishedUnit {
  id: string;
  title: string;
  description: string | null;
  sequence: number;
}

export async function listPublishedUnits(): Promise<PublishedUnit[]> {
  const { data, error } = await supabase
    .from("course_units")
    .select("id, title, description, sequence")
    .eq("status", "published")
    .order("sequence");
  if (error) throw new Error(error.message);
  return (data ?? []) as PublishedUnit[];
}

import { supabase } from "@/integrations/supabase/client";

/**
 * Catálogo de etiquetas de preguntas (`question_tag_defs`).
 * Es la fuente de verdad de las 6 dimensiones (DO, CI, AE, DD, FO, NT) y
 * sustituye a las constantes hardcodeadas de `questionTags.ts`.
 */
export interface TagDef {
  code: string;
  tag_type: string;
  tag_type_label: string;
  label: string;
  exclusive: boolean;
  sort_order: number;
}

let cached: TagDef[] | null = null;
let inflight: Promise<TagDef[]> | null = null;

export async function getTagDefs(): Promise<TagDef[]> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    const { data, error } = await supabase
      .from("question_tag_defs")
      .select("code, tag_type, tag_type_label, label, exclusive, sort_order")
      .order("tag_type")
      .order("sort_order");
    if (error) {
      inflight = null;
      throw error;
    }
    cached = (data ?? []) as TagDef[];
    inflight = null;
    return cached;
  })();

  return inflight;
}

export async function getTagLabel(code: string): Promise<string> {
  const defs = await getTagDefs();
  return defs.find((d) => d.code === code)?.label ?? code;
}

/** Tipo de etiqueta a partir del código ("AEMC" -> "AE"). */
export function tagTypeOf(code: string): string {
  return code.slice(0, 2);
}

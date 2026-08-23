import { useQuery } from "@tanstack/react-query";

import { getTagDefs, tagTypeOf, type TagDef } from "@/lib/questionTagDefs";

/** Acceso cómodo al catálogo de etiquetas desde componentes React. */
export function useTagDefs() {
  const query = useQuery({
    queryKey: ["question-tag-defs"],
    queryFn: getTagDefs,
    staleTime: Infinity,
  });

  const defs: TagDef[] = query.data ?? [];
  const labelOf = (code: string) => defs.find((d) => d.code === code)?.label ?? code;
  const typeLabelOf = (code: string) =>
    defs.find((d) => d.code === code)?.tag_type_label ?? tagTypeOf(code);
  /** % objetivo almacenado en BD (undefined si la etiqueta no tiene objetivo). */
  const targetOf = (code: string) => {
    const pct = defs.find((d) => d.code === code)?.target_pct;
    return pct === null || pct === undefined ? undefined : Number(pct);
  };
  const targets: Record<string, number | null> = Object.fromEntries(
    defs.map((d) => [d.code, d.target_pct === null || d.target_pct === undefined ? null : Number(d.target_pct)]),
  );

  return { defs, labelOf, typeLabelOf, targetOf, targets, isPending: query.isPending };
}

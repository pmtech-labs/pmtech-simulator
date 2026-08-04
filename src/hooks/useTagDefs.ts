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

  return { defs, labelOf, typeLabelOf, isPending: query.isPending };
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookMarked, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/glosario")({
  head: () => ({
    meta: [
      { title: "Glosario PMP: términos clave del examen · PMTech" },
      {
        name: "description",
        content:
          "Glosario PMP con definiciones propias y claras de los términos predictivos, ágiles y generales que necesitas para el examen ECO 2026.",
      },
      { property: "og:title", content: "Glosario PMP · PMTech Simulator" },
      {
        property: "og:description",
        content: "Definiciones breves y en español de los términos clave del examen PMP, filtrables por enfoque.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GlossaryPage,
});

type Category = "general" | "predictive" | "agile";

const CATEGORY_LABELS: Record<Category, string> = {
  general: "General",
  predictive: "Predictivo",
  agile: "Ágil",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");

  const termsQuery = useQuery({
    queryKey: ["glossary-terms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("term, definition, category")
        .order("term");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    return (termsQuery.data ?? []).filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return normalize(`${t.term} ${t.definition}`).includes(q);
    });
  }, [termsQuery.data, search, category]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((t) => {
      const letter = normalize(t.term).charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : "#";
      map.set(key, [...(map.get(key) ?? []), t]);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const availableLetters = new Set(groups.map(([l]) => l));

  return (
    <AppShell
      title="Glosario PMP"
      subtitle="Términos clave del examen PMP (ECO 2026)"
    >
      <div className="mx-auto max-w-4xl">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookMarked className="h-4 w-4" />
          <span>Recursos PMTech</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Definiciones breves y en palabras propias de los términos que más aparecen en el examen PMP
          (ECO 2026). No son citas del PMBOK® ni de ninguna otra fuente con derechos de autor.
        </p>
      </header>


      <div className="mt-6 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar término o definición…"
            aria-label="Buscar en el glosario"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          {(["all", "general", "predictive", "agile"] as const).map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                {c === "all" ? "Todos" : CATEGORY_LABELS[c]}
              </button>
            );
          })}
        </div>

        <nav className="flex flex-wrap gap-1" aria-label="Índice alfabético">
          {LETTERS.map((letter) => {
            const enabled = availableLetters.has(letter);
            return enabled ? (
              <a
                key={letter}
                href={`#letra-${letter}`}
                className="grid h-7 w-7 place-items-center rounded-md border border-border text-xs font-semibold hover:bg-secondary"
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                aria-disabled="true"
                className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-xs text-muted-foreground/40"
              >
                {letter}
              </span>
            );
          })}
        </nav>
      </div>

      <section className="mt-8 space-y-8">
        {termsQuery.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-muted/40" />
            ))}
          </div>
        ) : termsQuery.isError ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            No hemos podido cargar el glosario. Recarga la página en unos segundos.
          </p>
        ) : groups.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No hay términos que coincidan con tu búsqueda.
          </p>
        ) : (
          groups.map(([letter, items]) => (
            <div key={letter} id={`letra-${letter}`} className="scroll-mt-20">
              <h2 className="mb-3 text-lg font-bold text-primary">{letter}</h2>
              <ul className="space-y-3">
                {items.map((t) => (
                  <li key={t.term} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{t.term}</h3>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {CATEGORY_LABELS[(t.category as Category) ?? "general"] ?? "General"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.definition}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        ¿Quieres practicar estos conceptos?{" "}
        <Link to="/practica" className="font-medium text-primary hover:underline">
          Ve al modo de práctica
        </Link>
        .
      </p>
      </div>
    </AppShell>

  );
}

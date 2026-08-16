import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Navegación agrupada compartida por la home y las landings de marketing.
 * Las entradas de sección de la home se resuelven como ancla (#x) cuando ya
 * estamos en la home y como Link a "/" con hash cuando estamos en otra ruta.
 */

type NavItem = { label: string; hash?: string; to?: string; description?: string };
type NavGroup = { label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    label: "Producto",
    items: [
      { label: "Características", hash: "caracteristicas", description: "Qué incluye el simulador" },
      { label: "Cómo funciona", hash: "como-funciona", description: "Tu ruta de estudio paso a paso" },
      { label: "Simulador PMP", to: "/simulador-examen-pmp", description: "Simulacros de 180 preguntas" },
      { label: "Garantías", hash: "garantias", description: "Compromisos y condiciones" },
      { label: "Opiniones", hash: "opiniones", description: "Qué dicen quienes ya lo usan" },
    ],
  },
  {
    label: "Recursos",
    items: [
      { label: "Certificación PMP", to: "/certificacion-pmp" },
      { label: "Examen PMP", to: "/examen-pmp" },
      { label: "Requisitos y precio", to: "/requisitos-pmp" },
      { label: "Curso PMP online", to: "/curso-pmp-online" },
      { label: "PMBOK 7 vs 8", to: "/pmbok-8" },
      { label: "Glosario PMP", to: "/glosario" },
      { label: "Preguntas frecuentes", to: "/faq" },
    ],
  },
  {
    label: "Comparativas",
    items: [
      { label: "vs PMI Study Hall", to: "/pmtech-vs-pmi-study-hall" },
      { label: "vs PrepCast", to: "/pmtech-vs-prepcast" },
    ],
  },
  {
    label: "Empresas",
    items: [
      { label: "Partners y centros", to: "/partners", description: "Licencias por volumen" },
      { label: "Formación en abierto", hash: "formacion", description: "Cursos con instructor" },
    ],
  },
];

const DIRECT: NavItem[] = [
  { label: "Precios", hash: "precios" },
  { label: "Sobre nosotros", hash: "sobre-nosotros" },
];

function ItemLink({
  item,
  onHome,
  className,
  onClick,
}: {
  item: NavItem;
  onHome: boolean;
  className?: string;
  onClick?: () => void;
}) {
  if (item.to) {
    return (
      <Link to={item.to} className={className} onClick={onClick}>
        {item.label}
      </Link>
    );
  }
  if (onHome) {
    return (
      <a href={`#${item.hash}`} className={className} onClick={onClick}>
        {item.label}
      </a>
    );
  }
  return (
    <Link to="/" hash={item.hash} className={className} onClick={onClick}>
      {item.label}
    </Link>
  );
}

function Dropdown({ group, onHome }: { group: NavGroup; onHome: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-foreground"
      >
        {group.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 w-64 pt-2">
          <div className="rounded-xl border border-border bg-card p-2 shadow-lg">
            {group.items.map((item) => (
              <ItemLink
                key={item.label}
                item={item}
                onHome={onHome}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HeaderNav({ onHome }: { onHome: boolean }) {
  return (
    <nav className="flex items-center gap-7 text-[13px] font-medium text-muted-foreground">
      {GROUPS.map((g) => (
        <Dropdown key={g.label} group={g} onHome={onHome} />
      ))}
      {DIRECT.map((item) => (
        <ItemLink
          key={item.label}
          item={item}
          onHome={onHome}
          className="whitespace-nowrap transition-colors hover:text-foreground"
        />
      ))}
    </nav>
  );
}

export function MobileNav({ onHome, onNavigate }: { onHome: boolean; onNavigate: () => void }) {
  return (
    <nav className="flex flex-col gap-5 text-sm">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {g.label}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {g.items.map((item) => (
              <ItemLink
                key={item.label}
                item={item}
                onHome={onHome}
                onClick={onNavigate}
                className="font-medium text-foreground"
              />
            ))}
          </div>
        </div>
      ))}
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        {DIRECT.map((item) => (
          <ItemLink
            key={item.label}
            item={item}
            onHome={onHome}
            onClick={onNavigate}
            className="font-medium text-foreground"
          />
        ))}
        <ItemLink
          item={{ label: "Contacto", hash: "contacto" }}
          onHome={onHome}
          onClick={onNavigate}
          className="font-medium text-foreground"
        />
      </div>
    </nav>
  );
}

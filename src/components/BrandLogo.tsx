import { cn } from "@/lib/utils";

import markColor from "@/assets/brand-mark-color.png.asset.json";
import markWhite from "@/assets/brand-mark-white.png.asset.json";
import horizontalColor from "@/assets/brand-horizontal-color.png.asset.json";
import horizontalWhite from "@/assets/brand-horizontal-white.png.asset.json";

/**
 * Logo horizontal completo (oso + GLACIMONTO + TOP PM SIMULATOR).
 * Sustituye al bloque de marca con textos: no requiere copy adicional.
 */
export function BrandHorizontal({
  tone = "auto",
  className,
}: {
  tone?: BrandTone;
  className?: string;
}) {
  const base = "h-full w-auto object-contain";
  return (
    <span className={cn("inline-block shrink-0", className)}>
      {tone !== "onDark" && (
        <img
          src={horizontalColor.url}
          alt="Top PM Simulator, por Glacimonto"
          className={cn(base, tone === "auto" && "dark:hidden")}
        />
      )}
      {tone !== "onLight" && (
        <img
          src={horizontalWhite.url}
          alt="Top PM Simulator, por Glacimonto"
          className={cn(base, tone === "auto" && "hidden dark:block")}
        />
      )}
    </span>
  );
}

export type BrandTone = "auto" | "onDark" | "onLight";

/**
 * Marca del oso Glacimonto sin recuadro: usa la versión a color sobre fondos
 * claros y la versión blanca sobre fondos oscuros.
 * - `auto`: sigue el tema (claro/oscuro)
 * - `onDark` / `onLight`: fuerza la variante para superficies fijas
 */
export function BrandMark({
  tone = "auto",
  className,
}: {
  tone?: BrandTone;
  className?: string;
}) {
  const base = "h-full w-auto object-contain";
  return (
    <span className={cn("inline-block shrink-0", className)}>
      {tone !== "onDark" && (
        <img
          src={markColor.url}
          alt=""
          aria-hidden
          className={cn(base, tone === "auto" && "dark:hidden")}
        />
      )}
      {tone !== "onLight" && (
        <img
          src={markWhite.url}
          alt=""
          aria-hidden
          className={cn(base, tone === "auto" && "hidden dark:block")}
        />
      )}
    </span>
  );
}

/**
 * Bloque de marca con jerarquía coherente:
 * nombre de producto principal y firma de Glacimonto en segundo nivel.
 */
export function BrandLockup({
  tone = "auto",
  size = "md",
  subtitle = "por Glacimonto",
  className,
}: {
  tone?: BrandTone;
  size?: "sm" | "md" | "lg";
  subtitle?: string | null;
  className?: string;
}) {
  const markSize = size === "sm" ? "h-7 w-auto" : size === "lg" ? "h-11 w-auto" : "h-9 w-auto";
  const titleSize = size === "lg" ? "text-base" : "text-sm";
  const muted =
    tone === "onDark" ? "text-hero-muted/80" : "text-muted-foreground";

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark tone={tone} className={markSize} />
      <span className="min-w-fit">
        <span
          className={cn(
            "block whitespace-nowrap font-display font-semibold leading-tight",
            titleSize,
            tone === "onDark" && "text-hero-foreground",
          )}
        >
          Top PM Simulator
        </span>
        {subtitle && (
          <span className={cn("block whitespace-nowrap text-[11px] leading-tight", muted)}>
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}

export const brandLogoAssets = { markColor, markWhite };

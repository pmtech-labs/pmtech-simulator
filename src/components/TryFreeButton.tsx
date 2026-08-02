import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface TryFreeButtonProps {
  to?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export function TryFreeButton({
  to = "/registro",
  size = "md",
  showIcon = true,
  className = "",
  children = "Probar gratis",
  onClick,
}: TryFreeButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-[13px]",
    md: "px-3 py-2 text-[13px]",
    lg: "px-5 py-2.5 text-sm",
  };

  const base =
    "group inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-accent font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${base} ${sizeClasses[size]} ${className}`}
    >
      {children}
      {showIcon && (
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        />
      )}
    </Link>
  );
}

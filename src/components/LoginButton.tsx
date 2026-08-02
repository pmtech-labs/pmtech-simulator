import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface LoginButtonProps {
  to?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "ghost";
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export function LoginButton({
  to = "/login",
  size = "md",
  variant = "solid",
  className = "",
  children = "Iniciar sesión",
  onClick,
}: LoginButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-[13px]",
    md: "px-3 py-2 text-[13px]",
    lg: "px-5 py-2.5 text-sm",
  };

  const variantClasses = {
    solid:
      "rounded-lg bg-primary font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5",
    ghost:
      "rounded-lg font-semibold text-foreground transition-colors hover:text-primary hover:underline",
  };

  const base =
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

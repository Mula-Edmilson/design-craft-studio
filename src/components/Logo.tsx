import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
}

export function Logo({ className = "", variant = "dark" }: LogoProps) {
  const color = variant === "light" ? "hsl(var(--background))" : "hsl(var(--foreground))";
  const accent = "hsl(var(--accent))";

  return (
    <Link to="/" aria-label="PrintPalette — Início" className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path
          d="M16 3c-4.5 6-9 10.2-9 15.4C7 24.3 11 28 16 28s9-3.7 9-9.6C25 13.2 20.5 9 16 3z"
          fill={accent}
        />
        <circle cx="13" cy="20" r="2" fill="hsl(var(--background))" />
      </svg>
      <span className="text-xl tracking-tight font-medium" style={{ color }}>
        Print<span className="font-serif italic" style={{ color: accent }}>Palette</span>
      </span>
    </Link>
  );
}

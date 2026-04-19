import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, User, LogOut, PaintbrushVertical } from "lucide-react";
import { Logo } from "../Logo";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Catálogo" },
  { to: "/encomenda-personalizada", label: "Personalizado", icon: PaintbrushVertical },
  { to: "/sobre", label: "O Ateliê" },
  { to: "/contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user, authed } = useAuth();
  const location = useLocation();

  const panelHref = user
    ? user.role === "admin"
      ? "/admin"
      : user.role === "entregador"
        ? "/entrega-painel"
        : "/cliente-painel"
    : "/cliente-login";

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-px mx-auto max-w-7xl flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação principal">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5",
                  isActive(item.to)
                    ? "text-accent"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary/60",
                )}
              >
                {Icon && <Icon className="size-3.5" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {authed ? (
            <Link
              to={panelHref}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-foreground/80 hover:bg-secondary/60 transition-colors"
            >
              <User className="size-3.5" />
              <span className="max-w-[6rem] truncate">{(user?.nome || "Conta").split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              to="/cliente-login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-foreground/80 hover:bg-secondary/60 transition-colors"
            >
              <User className="size-3.5" />
              Entrar
            </Link>
          )}

          <Link
            to="/checkout"
            aria-label="Carrinho de compras"
            className="relative inline-flex items-center justify-center size-10 rounded-full hover:bg-secondary/60 transition-colors"
          >
            <ShoppingBag className="size-4" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {authed && (
            <button
              onClick={() => logout("/cliente-login")}
              aria-label="Sair"
              className="hidden sm:inline-flex items-center justify-center size-10 rounded-full hover:bg-secondary/60 transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="lg:hidden inline-flex items-center justify-center size-10 rounded-full hover:bg-secondary/60 transition-colors"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background animate-fade-up">
          <nav className="container-px mx-auto max-w-7xl py-3 flex flex-col gap-1" aria-label="Menu móvel">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2",
                    isActive(item.to)
                      ? "bg-secondary text-foreground"
                      : "text-foreground/80 hover:bg-secondary/60",
                  )}
                >
                  {Icon && <Icon className="size-4 text-accent" />}
                  {item.label}
                </Link>
              );
            })}
            <div className="h-px bg-border my-2" />
            {authed ? (
              <>
                <Link
                  to={panelHref}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/60 flex items-center gap-2"
                >
                  <User className="size-4" /> Minha conta
                </Link>
                <Link
                  to="/pedidos"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/60 flex items-center gap-2"
                >
                  <ShoppingBag className="size-4" /> Os meus pedidos
                </Link>
                <button
                  onClick={() => { setOpen(false); logout("/cliente-login"); }}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/60 flex items-center gap-2"
                >
                  <LogOut className="size-4" /> Sair
                </button>
              </>
            ) : (
              <Link
                to="/cliente-login"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/60 flex items-center gap-2"
              >
                <User className="size-4" /> Entrar / Criar conta
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

import { Link } from "react-router-dom";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "../Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 mt-24">
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-xs">
              A gráfica criativa de Maputo. Impressão personalizada com alma artesanal e entrega rápida.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" aria-label="Instagram" className="size-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors">
                <Instagram className="size-4" />
              </a>
              <a href="#" aria-label="Facebook" className="size-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors">
                <Facebook className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-5 text-foreground">Catálogo</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-accent transition-colors">Todos os produtos</Link></li>
              <li><Link to="/encomenda-personalizada?tipo=Banner" className="hover:text-accent transition-colors">Banners</Link></li>
              <li><Link to="/encomenda-personalizada?tipo=Canvas" className="hover:text-accent transition-colors">Canvas</Link></li>
              <li><Link to="/encomenda-personalizada?tipo=Vinil" className="hover:text-accent transition-colors">Vinil</Link></li>
              <li><Link to="/encomenda-personalizada" className="hover:text-accent transition-colors">Encomenda personalizada</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-5 text-foreground">PrintPalette</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/sobre" className="hover:text-accent transition-colors">O Ateliê</Link></li>
              <li><Link to="/contacto" className="hover:text-accent transition-colors">Contacto</Link></li>
              <li><Link to="/privacidade" className="hover:text-accent transition-colors">Privacidade</Link></li>
              <li><Link to="/termos" className="hover:text-accent transition-colors">Termos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-5 text-foreground">Maputo</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5 text-accent shrink-0" />
                <span>Av. Julius Nyerere, 1247<br/>Sommerschield, Maputo</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-accent" />
                <a href="tel:+258840000000" className="hover:text-accent">+258 84 000 0000</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-accent" />
                <a href="mailto:ola@printpalette.mz" className="hover:text-accent">ola@printpalette.mz</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-10 mt-12 border-t border-border text-[11px] uppercase tracking-widest text-muted-foreground">
          <p>© {new Date().getFullYear()} PrintPalette — Feito com orgulho em Moçambique.</p>
          <div className="flex gap-6">
            <Link to="/privacidade" className="hover:text-accent">Privacidade</Link>
            <Link to="/termos" className="hover:text-accent">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

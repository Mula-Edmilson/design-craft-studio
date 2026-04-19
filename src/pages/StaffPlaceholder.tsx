import { Link } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";

export default function StaffPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="container-px mx-auto max-w-2xl py-20 text-center">
      <div className="size-16 mx-auto rounded-full bg-accent/10 text-accent flex items-center justify-center">
        <Construction className="size-8" />
      </div>
      <h1 className="mt-6 text-4xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{description}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        Esta área está a ser redesenhada na <span className="font-semibold text-foreground">Fase 2</span>. Enquanto isso, pode usar o painel original em{" "}
        <a href="https://loja-print-palette.onrender.com" className="text-accent font-semibold underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
          loja-print-palette.onrender.com
        </a>.
      </p>
      <Link to="/" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-semibold">
        <ArrowLeft className="size-4" /> Voltar à loja
      </Link>
    </div>
  );
}

import { cn } from "@/lib/utils";

export const ORDER_STATUSES = [
  "Pendente",
  "Em Processamento",
  "Em Entrega",
  "Entregue",
  "Cancelado",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export function StatusPill({ status, className }: { status?: string; className?: string }) {
  const map: Record<string, string> = {
    "Pendente": "bg-warning/15 text-warning-foreground border-warning/40",
    "Em Processamento": "bg-clay/15 text-clay border-clay/40",
    "Em Entrega": "bg-accent/15 text-accent border-accent/40",
    "Entregue": "bg-success/15 text-success border-success/40",
    "Cancelado": "bg-destructive/15 text-destructive border-destructive/40",
  };
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap",
      map[status || ""] || "bg-muted text-muted-foreground border-border",
      className,
    )}>
      {status || "—"}
    </span>
  );
}

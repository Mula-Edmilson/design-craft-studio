import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Package, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { isLoggedIn, getOrders, logout } from "@/lib/api";
import { formatMZN, formatDateTime } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  pendente: "bg-warning/15 text-warning",
  confirmado: "bg-clay/15 text-clay",
  producao: "bg-accent/15 text-accent",
  entregue: "bg-success/15 text-success",
  cancelado: "bg-destructive/15 text-destructive",
};

export default function Pedidos() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/cliente-login?redirect=/pedidos"); return; }
    (async () => {
      try {
        const list = await getOrders();
        setOrders(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (e.status === 401) { logout("/cliente-login"); return; }
        toast.error(e.message || "Erro a carregar pedidos.");
      } finally { setLoading(false); }
    })();
  }, [navigate]);

  return (
    <div className="container-px mx-auto max-w-5xl py-12 lg:py-16">
      <header className="mb-10">
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-accent">Histórico</span>
        <h1 className="mt-3 text-4xl lg:text-5xl">Os meus pedidos</h1>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-12 text-center">
          <Package className="size-10 mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-2xl">Sem pedidos ainda</h2>
          <p className="mt-2 text-muted-foreground">Quando fizer a sua primeira encomenda, aparecerá aqui.</p>
          <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-full bg-foreground text-background font-semibold">Explorar loja</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const status = (o.status || "pendente").toLowerCase();
            return (
              <li key={o._id} className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-mono text-muted-foreground">#{(o._id || "").slice(-8)}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-semibold ${STATUS_STYLES[status] || "bg-secondary text-foreground"}`}>{status}</span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold">{(o.items || []).length} item(s) — {o.fulfillmentMethod === "pickup" ? "Levantamento" : "Entrega"}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(o.createdAt || o.data)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{formatMZN(o.total)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{o.pagamento}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground hidden sm:block" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

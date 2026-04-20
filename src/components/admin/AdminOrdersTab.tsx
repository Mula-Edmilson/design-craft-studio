import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X, Phone, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getOrders, updateOrder, getDeliverers } from "@/lib/api";
import { formatMZN, formatDateTime } from "@/lib/format";
import { ORDER_STATUSES, StatusPill } from "./StatusPill";

export function AdminOrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [o, d] = await Promise.all([
        getOrders(),
        getDeliverers().catch(() => []),
      ]);
      setOrders(Array.isArray(o) ? o : []);
      setDrivers(Array.isArray(d) ? d : []);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar encomendas.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(o => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o._id?.toLowerCase().includes(q) ||
        o.cliente?.nome?.toLowerCase().includes(q) ||
        o.cliente?.contacto?.toLowerCase().includes(q)
      );
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar por cliente, ID ou telefone..." className="w-full pl-9 pr-3 py-2.5 rounded-full border border-input bg-background text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-full border border-input bg-background text-sm">
          <option value="">Todos os estados</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/30">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-right px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Sem encomendas.</td></tr>
                )}
                {filtered.map((o) => (
                  <tr key={o._id} onClick={() => setSelected(o)} className="border-b border-border/40 last:border-0 hover:bg-muted/30 cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs">{String(o._id).slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.cliente?.nome || "—"}</p>
                      <p className="text-xs text-muted-foreground">{o.cliente?.contacto}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{o.fulfillmentMethod === "pickup" ? "Levantamento" : "Entrega"}</span>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMZN(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          drivers={drivers}
          onClose={() => setSelected(null)}
          onSaved={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, drivers, onClose, onSaved }: { order: any; drivers: any[]; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState<string>(order.status || "Pendente");
  const [entregadorId, setEntregadorId] = useState<string>(order.entregadorId?._id || order.entregadorId || "");
  const [notas, setNotas] = useState<string>(order.notas || "");
  const [saving, setSaving] = useState(false);

  const isPickup = order.fulfillmentMethod === "pickup";

  const onSave = async () => {
    setSaving(true);
    try {
      await updateOrder(order._id, {
        status,
        entregadorId: isPickup ? null : (entregadorId || null),
        notas,
      });
      toast.success("Encomenda atualizada.");
      onSaved();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-3xl border border-border/60 shadow-card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/60 sticky top-0 bg-card z-10">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Encomenda</p>
            <h2 className="text-xl font-serif">#{String(order._id).slice(-6).toUpperCase()}</h2>
          </div>
          <button onClick={onClose} className="size-9 rounded-full hover:bg-secondary inline-flex items-center justify-center"><X className="size-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cliente */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Cliente</h3>
            <div className="bg-muted/40 rounded-2xl p-4 space-y-1.5 text-sm">
              <p className="font-semibold">{order.cliente?.nome}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><Phone className="size-3.5" /> {order.cliente?.contacto}</p>
              {order.cliente?.morada && (
                <p className="flex items-start gap-2 text-muted-foreground"><MapPin className="size-3.5 mt-0.5" /> {order.cliente?.morada}</p>
              )}
              {order.cliente?.linkMapa && (
                <a href={order.cliente.linkMapa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-accent font-semibold">
                  Abrir mapa <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </section>

          {/* Items */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Itens</h3>
            <div className="border border-border/60 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {(order.items || []).map((it: any, i: number) => (
                    <tr key={i} className="border-b border-border/40 last:border-0">
                      <td className="px-4 py-2.5">{it.nome} <span className="text-muted-foreground">× {it.quantidade}</span></td>
                      <td className="px-4 py-2.5 text-right font-medium">{formatMZN(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td className="px-4 py-2 text-xs text-muted-foreground">Subtotal</td>
                    <td className="px-4 py-2 text-right">{formatMZN(order.subtotalProducts)}</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-4 py-2 text-xs text-muted-foreground">Entrega</td>
                    <td className="px-4 py-2 text-right">{formatMZN(order.deliveryFee || 0)}</td>
                  </tr>
                  <tr className="bg-foreground text-background">
                    <td className="px-4 py-2.5 font-semibold">Total</td>
                    <td className="px-4 py-2.5 text-right font-bold">{formatMZN(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Gestão */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm">
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {!isPickup && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entregador</label>
                <select value={entregadorId} onChange={(e) => setEntregadorId(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm">
                  <option value="">— Sem entregador —</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.nome}</option>)}
                </select>
              </div>
            )}
          </section>

          <section>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notas internas</label>
            <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm" />
          </section>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-secondary/60">Fechar</button>
            <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-60">
              {saving && <Loader2 className="size-4 animate-spin" />}
              Guardar alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

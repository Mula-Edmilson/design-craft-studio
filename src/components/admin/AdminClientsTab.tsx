import { useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { getClients, getClientById, updateClient } from "@/lib/api";
import { formatMZN, formatDate } from "@/lib/format";

export function AdminClientsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);

  const load = async (q = search, p = page) => {
    setLoading(true);
    try {
      const res = await getClients({ search: q, page: p, limit: 20 });
      setItems(res.items || []);
      setPages(res.pagination?.pages || 1);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load("", 1); }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(search, 1);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar cliente por nome, email ou telefone..." className="w-full pl-9 pr-3 py-2.5 rounded-full border border-input bg-background text-sm" />
      </form>

      <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/30">
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3">Contacto</th>
                  <th className="text-right px-4 py-3">Pedidos</th>
                  <th className="text-right px-4 py-3">Total gasto</th>
                  <th className="text-left px-4 py-3">Última atividade</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Sem clientes.</td></tr>}
                {items.map((c) => (
                  <tr key={c._id} onClick={async () => {
                    try { const full = await getClientById(c._id); setSelected(full); } catch (e: any) { toast.error(e?.message); }
                  }} className="border-b border-border/40 last:border-0 hover:bg-muted/30 cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.telefone || "—"}</td>
                    <td className="px-4 py-3 text-right">{c.totalOrders || 0}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMZN(c.totalSpent || 0)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(c.lastActivity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(search, page - 1); }} className="px-3 py-1.5 rounded-full border border-border text-sm disabled:opacity-40">Anterior</button>
          <span className="text-sm text-muted-foreground">Página {page} de {pages}</span>
          <button disabled={page >= pages} onClick={() => { setPage(p => p + 1); load(search, page + 1); }} className="px-3 py-1.5 rounded-full border border-border text-sm disabled:opacity-40">Próxima</button>
        </div>
      )}

      {selected && <ClientDetailModal client={selected} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); load(); }} />}
    </div>
  );
}

function ClientDetailModal({ client, onClose, onSaved }: { client: any; onClose: () => void; onSaved: () => void }) {
  const [notes, setNotes] = useState(client.notes || "");
  const [tags, setTags] = useState((client.tags || []).join(", "));
  const [marketingOptIn, setMarketingOptIn] = useState(!!client.marketingOptIn);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateClient(client._id, { notes, tags, marketingOptIn });
      toast.success("Cliente atualizado.");
      onSaved();
    } catch (err: any) { toast.error(err?.message || "Erro ao atualizar."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-3xl border border-border/60 shadow-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/60 sticky top-0 bg-card z-10">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Cliente</p>
            <h2 className="text-xl font-serif">{client.nome}</h2>
          </div>
          <button onClick={onClose} className="size-9 rounded-full hover:bg-secondary inline-flex items-center justify-center"><X className="size-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <Stat label="Pedidos" value={client.totalOrders || 0} />
            <Stat label="Total gasto" value={formatMZN(client.totalSpent || 0)} />
            <Stat label="Email" value={client.email} small />
            <Stat label="Telefone" value={client.telefone || "—"} small />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags (separadas por vírgula)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notas internas</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={marketingOptIn} onChange={(e) => setMarketingOptIn(e.target.checked)} className="size-4 accent-accent" />
            Aceita comunicações de marketing
          </label>

          {Array.isArray(client.orders) && client.orders.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Últimas encomendas</h3>
              <div className="border border-border/60 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {client.orders.slice(0, 6).map((o: any) => (
                      <tr key={o._id} className="border-b border-border/40 last:border-0">
                        <td className="px-3 py-2 font-mono text-xs">{String(o._id).slice(-6).toUpperCase()}</td>
                        <td className="px-3 py-2 text-muted-foreground">{formatDate(o.createdAt)}</td>
                        <td className="px-3 py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{o.status}</span></td>
                        <td className="px-3 py-2 text-right font-medium">{formatMZN(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-secondary/60">Fechar</button>
            <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-60">
              {saving && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, small = false }: { label: string; value: any; small?: boolean }) {
  return (
    <div className="bg-muted/40 rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={small ? "mt-1 text-xs font-medium truncate" : "mt-1 text-base font-serif"}>{value}</p>
    </div>
  );
}

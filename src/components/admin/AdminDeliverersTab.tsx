import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, X, KeyRound, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import {
  getDeliverers, createDeliverer, updateDeliverer, deleteDeliverer,
  resetDelivererPassword, getDelivererStats,
} from "@/lib/api";
import { formatMZN } from "@/lib/format";

export function AdminDeliverersTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [resetting, setResetting] = useState<any | null>(null);
  const [statsOf, setStatsOf] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDeliverers();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) { toast.error(err?.message || "Erro ao carregar entregadores."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onDelete = async (d: any) => {
    if (!confirm(`Eliminar entregador ${d.nome}?`)) return;
    try {
      await deleteDeliverer(d._id);
      toast.success("Entregador eliminado.");
      load();
    } catch (err: any) { toast.error(err?.message || "Erro ao eliminar."); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold">
          <Plus className="size-4" /> Novo entregador
        </button>
      </div>

      <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/30">
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Telefone</th>
                  <th className="text-right px-4 py-3">Comissão</th>
                  <th className="text-right px-4 py-3">Entregas</th>
                  <th className="text-right px-4 py-3">Ganhos</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Ainda sem entregadores.</td></tr>}
                {items.map((d) => (
                  <tr key={d._id} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{d.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.telefone || "—"}</td>
                    <td className="px-4 py-3 text-right">{d.comissao ?? 10}%</td>
                    <td className="px-4 py-3 text-right">{d.stats?.totalCompleted ?? 0}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMZN(d.stats?.totalEarnings ?? 0)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setStatsOf(d)} className="size-8 rounded-full hover:bg-secondary inline-flex items-center justify-center" title="Estatísticas"><BarChart3 className="size-3.5" /></button>
                        <button onClick={() => setResetting(d)} className="size-8 rounded-full hover:bg-secondary inline-flex items-center justify-center" title="Reset password"><KeyRound className="size-3.5" /></button>
                        <button onClick={() => setEditing(d)} className="size-8 rounded-full hover:bg-secondary inline-flex items-center justify-center" title="Editar"><Pencil className="size-3.5" /></button>
                        <button onClick={() => onDelete(d)} className="size-8 rounded-full hover:bg-destructive/10 text-destructive inline-flex items-center justify-center" title="Eliminar"><Trash2 className="size-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <DelivererForm deliverer={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {resetting && <PasswordResetModal deliverer={resetting} onClose={() => setResetting(null)} />}
      {statsOf && <StatsModal deliverer={statsOf} onClose={() => setStatsOf(null)} />}
    </div>
  );
}

function DelivererForm({ deliverer, onClose, onSaved }: { deliverer: any; onClose: () => void; onSaved: () => void }) {
  const isNew = !deliverer._id;
  const [form, setForm] = useState({
    nome: deliverer.nome || "",
    email: deliverer.email || "",
    telefone: deliverer.telefone || "",
    password: "",
    comissao: deliverer.comissao ?? 10,
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        if (!form.password || form.password.length < 6) { toast.error("Password mínima 6 caracteres."); setSaving(false); return; }
        await createDeliverer(form as any);
      } else {
        const payload: any = { nome: form.nome, email: form.email, telefone: form.telefone, comissao: Number(form.comissao) };
        if (form.password) payload.password = form.password;
        await updateDeliverer(deliverer._id, payload);
      }
      toast.success(isNew ? "Entregador criado." : "Entregador atualizado.");
      onSaved();
    } catch (err: any) { toast.error(err?.message || "Erro ao guardar."); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isNew ? "Novo entregador" : "Editar entregador"} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nome" required><input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inputCls} /></Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email" required><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></Field>
          <Field label="Telefone"><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={isNew ? "Password (obrigatória)" : "Nova password (opcional)"}>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} placeholder="Mínimo 6 caracteres" />
          </Field>
          <Field label="Comissão (%)"><input type="number" min={0} max={100} step="0.1" value={form.comissao} onChange={(e) => setForm({ ...form, comissao: Number(e.target.value) })} className={inputCls} /></Field>
        </div>
        <ModalFooter onClose={onClose} saving={saving} />
      </form>
    </Modal>
  );
}

function PasswordResetModal({ deliverer, onClose }: { deliverer: any; onClose: () => void }) {
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) { toast.error("Mínimo 6 caracteres."); return; }
    setSaving(true);
    try {
      await resetDelivererPassword(deliverer._id, pwd);
      toast.success("Password redefinida. O entregador será obrigado a alterá-la no próximo login.");
      onClose();
    } catch (err: any) { toast.error(err?.message || "Erro."); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={`Reset password — ${deliverer.nome}`} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nova password" required>
          <input required type="text" value={pwd} onChange={(e) => setPwd(e.target.value)} className={inputCls} placeholder="Mínimo 6 caracteres" />
        </Field>
        <p className="text-xs text-muted-foreground">A password é definida por si e o entregador terá de a usar para entrar.</p>
        <ModalFooter onClose={onClose} saving={saving} label="Redefinir" />
      </form>
    </Modal>
  );
}

function StatsModal({ deliverer, onClose }: { deliverer: any; onClose: () => void }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { setData(await getDelivererStats(deliverer._id)); }
      catch (e: any) { toast.error(e?.message); }
      finally { setLoading(false); }
    })();
  }, [deliverer._id]);

  return (
    <Modal title={`Estatísticas — ${deliverer.nome}`} onClose={onClose}>
      {loading ? <Loader2 className="size-5 animate-spin mx-auto my-8 text-muted-foreground" /> : data?.stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <KpiBox label="Total entregas" value={data.stats.totalDeliveries} />
          <KpiBox label="Concluídas" value={data.stats.totalCompleted} />
          <KpiBox label="Canceladas" value={data.stats.totalCancelled} />
          <KpiBox label="Em curso" value={data.stats.totalProcessing} />
          <KpiBox label="Horas em entrega" value={data.stats.totalHours} />
          <KpiBox label="Ganhos totais" value={formatMZN(data.stats.totalEarnings)} accent />
        </div>
      ) : <p className="text-sm text-muted-foreground">Sem dados.</p>}
    </Modal>
  );
}

function KpiBox({ label, value, accent = false }: { label: string; value: any; accent?: boolean }) {
  return (
    <div className={accent ? "bg-foreground text-background rounded-xl p-3" : "bg-muted/40 rounded-xl p-3"}>
      <p className={accent ? "text-[10px] uppercase tracking-wider text-background/70" : "text-[10px] uppercase tracking-wider text-muted-foreground"}>{label}</p>
      <p className="mt-1 text-base font-serif">{value}</p>
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (<div><label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label} {required && <span className="text-destructive">*</span>}</label><div className="mt-1.5">{children}</div></div>);
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-3xl border border-border/60 shadow-card w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/60 sticky top-0 bg-card z-10">
          <h2 className="text-xl font-serif">{title}</h2>
          <button onClick={onClose} className="size-9 rounded-full hover:bg-secondary inline-flex items-center justify-center"><X className="size-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
function ModalFooter({ onClose, saving, label = "Guardar" }: { onClose: () => void; saving: boolean; label?: string }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
      <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-secondary/60">Cancelar</button>
      <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-60">
        {saving && <Loader2 className="size-4 animate-spin" />} {label}
      </button>
    </div>
  );
}

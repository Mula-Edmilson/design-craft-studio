import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2, Bike, LogOut, Phone, MapPin, ExternalLink, Check, Truck,
  KeyRound, X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  logout, getMyDeliveries, updateDeliveryStatus, getMyDeliveryStats,
  changeMyDriverPassword,
} from "@/lib/api";
import { Logo } from "@/components/Logo";
import { formatMZN, formatDateTime } from "@/lib/format";
import { StatusPill } from "@/components/admin/StatusPill";
import { cn } from "@/lib/utils";

export default function EntregaPainel() {
  const navigate = useNavigate();
  const { user, authed } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ativas" | "historico">("ativas");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!authed) { navigate("/entrega-login", { replace: true }); return; }
    if (user && user.role !== "entregador" && user.role !== "admin") {
      toast.error("Acesso restrito.");
      navigate("/", { replace: true });
    }
  }, [authed, user, navigate]);

  const load = async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([
        getMyDeliveries().catch(() => []),
        getMyDeliveryStats().catch(() => null),
      ]);
      setOrders(Array.isArray(o) ? o : []);
      setStats(s);
    } finally { setLoading(false); }
  };
  useEffect(() => { if (authed) load(); }, [authed]);

  // Force reset password if required
  useEffect(() => {
    if (stats?.user?.passwordResetRequired) setShowPwd(true);
  }, [stats]);

  const ativas = useMemo(() => orders.filter(o => o.status === "Em Processamento" || o.status === "Em Entrega"), [orders]);
  const historico = useMemo(() => orders.filter(o => o.status === "Entregue" || o.status === "Cancelado"), [orders]);

  const onUpdate = async (orderId: string, status: string) => {
    try {
      await updateDeliveryStatus(orderId, status);
      toast.success(`Marcado como "${status}".`);
      load();
    } catch (err: any) { toast.error(err?.message || "Erro a atualizar."); }
  };

  if (!authed) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="container-px mx-auto max-w-5xl py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center"><Bike className="size-5" /></div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Painel Entregas</p>
            <h1 className="text-2xl">Olá, {user?.nome?.split(" ")[0] || "Equipa"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPwd(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-secondary/60">
            <KeyRound className="size-3.5" /> Password
          </button>
          <button onClick={() => logout("/entrega-login")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-secondary/60">
            <LogOut className="size-3.5" /> Sair
          </button>
        </div>
      </div>

      {/* KPIs */}
      {stats?.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Kpi label="Ativas" value={ativas.length} />
          <Kpi label="Entregues" value={stats.stats.totalCompleted} />
          <Kpi label="Comissão" value={`${stats.stats.commissionRate}%`} />
          <Kpi label="Ganhos" value={formatMZN(stats.stats.totalEarnings)} accent />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/60 mb-4">
        <TabBtn active={tab === "ativas"} onClick={() => setTab("ativas")}>Entregas ativas ({ativas.length})</TabBtn>
        <TabBtn active={tab === "historico"} onClick={() => setTab("historico")}>Histórico ({historico.length})</TabBtn>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {(tab === "ativas" ? ativas : historico).length === 0 && (
            <div className="bg-card border border-border/60 rounded-3xl p-12 text-center text-muted-foreground">
              {tab === "ativas" ? "Sem entregas ativas no momento." : "Sem histórico ainda."}
            </div>
          )}
          {(tab === "ativas" ? ativas : historico).map((o) => (
            <DeliveryCard key={o._id} order={o} onUpdate={tab === "ativas" ? onUpdate : undefined} />
          ))}
        </div>
      )}

      {showPwd && <ChangePasswordModal onClose={() => setShowPwd(false)} required={!!stats?.user?.passwordResetRequired} />}
    </div>
  );
}

function DeliveryCard({ order, onUpdate }: { order: any; onUpdate?: (id: string, status: string) => void }) {
  const phone = String(order.cliente?.contacto || "").replace(/\D/g, "");
  return (
    <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">#{String(order._id).slice(-6).toUpperCase()}</p>
          <p className="font-serif text-xl">{order.cliente?.nome}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <a href={`tel:${phone}`} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
          <Phone className="size-4 text-accent" /> <span className="font-medium">{order.cliente?.contacto}</span>
        </a>
        {order.cliente?.linkMapa ? (
          <a href={order.cliente.linkMapa} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <MapPin className="size-4 text-accent" /> <span className="truncate">Abrir mapa</span> <ExternalLink className="size-3 ml-auto" />
          </a>
        ) : order.cliente?.morada ? (
          <a href={`https://maps.google.com/?q=${encodeURIComponent(order.cliente.morada)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <MapPin className="size-4 text-accent" /> <span className="truncate">{order.cliente.morada}</span>
          </a>
        ) : null}
      </div>

      <div className="mt-3 border-t border-border/60 pt-3 text-sm">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Itens</p>
        <ul className="space-y-0.5">
          {(order.items || []).map((it: any, i: number) => (
            <li key={i} className="flex justify-between gap-2">
              <span>{it.nome} <span className="text-muted-foreground">× {it.quantidade}</span></span>
              <span className="font-medium">{formatMZN(it.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between font-semibold border-t border-border/40 pt-2">
          <span>Total</span><span>{formatMZN(order.total)}</span>
        </div>
        {order.pagamento && <p className="text-xs text-muted-foreground mt-2">Pagamento: {order.pagamento}</p>}
        {order.notas && <p className="text-xs text-muted-foreground mt-1 italic">"{order.notas}"</p>}
      </div>

      {onUpdate && (
        <div className="mt-4 flex flex-wrap gap-2">
          {order.status === "Em Processamento" && (
            <button onClick={() => onUpdate(order._id, "Em Entrega")} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
              <Truck className="size-4" /> Iniciar entrega
            </button>
          )}
          {order.status === "Em Entrega" && (
            <button onClick={() => onUpdate(order._id, "Entregue")} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-success text-success-foreground text-sm font-semibold">
              <Check className="size-4" /> Marcar como entregue
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ChangePasswordModal({ onClose, required }: { onClose: () => void; required: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 6) { toast.error("Mínimo 6 caracteres."); return; }
    setSaving(true);
    try {
      await changeMyDriverPassword(current, next);
      toast.success("Password alterada.");
      onClose();
    } catch (err: any) { toast.error(err?.message || "Erro."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-3xl border border-border/60 shadow-card w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border/60">
          <h2 className="text-xl font-serif">Alterar password</h2>
          {!required && <button onClick={onClose} className="size-9 rounded-full hover:bg-secondary inline-flex items-center justify-center"><X className="size-4" /></button>}
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {required && (
            <div className="p-3 rounded-xl bg-warning/15 border border-warning/30 text-sm">
              É obrigatório alterar a sua password antes de continuar.
            </div>
          )}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password atual</label>
            <input required type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nova password</label>
            <input required type="password" value={next} onChange={(e) => setNext(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {!required && <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-medium border border-border">Cancelar</button>}
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-60">
              {saving && <Loader2 className="size-4 animate-spin" />} Alterar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent = false }: { label: string; value: any; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4", accent ? "bg-foreground text-background border-foreground" : "bg-card border-border/60")}>
      <p className={cn("text-[10px] uppercase tracking-wider", accent ? "text-background/70" : "text-muted-foreground")}>{label}</p>
      <p className="mt-1.5 text-xl font-serif">{value}</p>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn(
      "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
      active ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
    )}>
      {children}
    </button>
  );
}

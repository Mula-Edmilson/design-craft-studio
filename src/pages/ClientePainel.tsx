import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Package, User as UserIcon, LogOut, Save, ShoppingBag, Crown } from "lucide-react";
import { toast } from "sonner";
import { isLoggedIn, getProfile, getUser, getOrders, updateProfile, logout, type AppUser } from "@/lib/api";
import { formatMZN, formatDate } from "@/lib/format";

export default function ClientePainel() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(getUser());
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "" });

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/cliente-login?redirect=/cliente-painel"); return; }
    (async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          setUser(profile);
          setForm({ nome: profile.nome || "", telefone: profile.telefone || "", email: profile.email || "" });
        }
        const list = await getOrders();
        setOrders(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (e.status === 401) { logout("/cliente-login"); return; }
        toast.error(e.message || "Erro a carregar painel.");
      } finally { setLoading(false); }
    })();
  }, [navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({ nome: form.nome, telefone: form.telefone });
      setUser(updated);
      toast.success("Perfil actualizado.");
    } catch (e: any) { toast.error(e.message || "Erro ao guardar."); }
    finally { setSaving(false); }
  }

  if (loading) {
    return <div className="container-px mx-auto max-w-5xl py-20 flex items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  const totalSpent = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);

  return (
    <div className="container-px mx-auto max-w-6xl py-12 lg:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-accent">Minha conta</span>
          <h1 className="mt-3 text-4xl">Olá, <span className="font-serif-italic">{(user?.nome || "cliente").split(" ")[0]}</span>.</h1>
        </div>
        <button onClick={() => { if (confirm("Tem a certeza que quer sair?")) logout("/cliente-login"); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium hover:bg-secondary/60"><LogOut className="size-4" /> Sair</button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Stat icon={Package} label="Pedidos" value={String(orders.length)} />
        <Stat icon={ShoppingBag} label="Total gasto" value={formatMZN(totalSpent)} />
        <Stat icon={Crown} label="Plano" value={user?.isSubscribed ? (user.subscriptionPlan || "Premium") : "Standard"} />
        <Stat icon={UserIcon} label="Membro desde" value={formatDate((user as any)?.createdAt)} />
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Profile form */}
        <form onSubmit={handleSave} className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 space-y-5">
          <h2 className="text-xl font-semibold">Perfil</h2>
          <Field label="Nome" value={form.nome} onChange={(v) => setForm((s) => ({ ...s, nome: v }))} />
          <Field label="Telefone" value={form.telefone} onChange={(v) => setForm((s) => ({ ...s, telefone: v }))} type="tel" />
          <Field label="Email" value={form.email} onChange={() => {}} disabled />
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-foreground text-background font-semibold disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar
          </button>
        </form>

        {/* Recent orders */}
        <section className="lg:col-span-3 rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pedidos recentes</h2>
            <Link to="/pedidos" className="text-sm font-semibold text-accent">Ver todos →</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Ainda não tem pedidos. <Link to="/" className="text-accent font-semibold">Explorar loja →</Link></p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.slice(0, 5).map((o) => (
                <li key={o._id} className="py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-mono text-muted-foreground">#{(o._id || "").slice(-8)}</p>
                    <p className="text-sm font-medium mt-0.5">{(o.items || []).length} item(s) — {formatDate(o.createdAt || o.data)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatMZN(o.total)}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-secondary text-[10px] uppercase tracking-widest font-semibold">{o.status || "pendente"}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className="size-4 text-accent" />
      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled }: any) {
  return (
    <div>
      <label className="text-sm font-medium block mb-2">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
      />
    </div>
  );
}

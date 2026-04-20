import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Bike, ImageIcon,
  LogOut, Loader2, ShieldCheck, Menu, X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { logout, getOrders, getProducts, getClients, getDeliverers } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { formatMZN, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AdminProductsTab } from "@/components/admin/AdminProductsTab";
import { AdminOrdersTab } from "@/components/admin/AdminOrdersTab";
import { AdminClientsTab } from "@/components/admin/AdminClientsTab";
import { AdminDeliverersTab } from "@/components/admin/AdminDeliverersTab";
import { AdminMediaTab } from "@/components/admin/AdminMediaTab";

type TabKey = "dashboard" | "produtos" | "encomendas" | "clientes" | "entregadores" | "media";

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "produtos", label: "Produtos", icon: Package },
  { key: "encomendas", label: "Encomendas", icon: ShoppingBag },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "entregadores", label: "Entregadores", icon: Bike },
  { key: "media", label: "Media", icon: ImageIcon },
];

export default function AdminPainel() {
  const navigate = useNavigate();
  const { user, authed } = useAuth();
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!authed) {
      navigate("/login", { replace: true });
      return;
    }
    if (user && user.role !== "admin") {
      toast.error("Acesso restrito.");
      navigate("/", { replace: true });
    }
  }, [authed, user, navigate]);

  if (!authed || user?.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Painel Admin</p>
            <h1 className="text-2xl">Olá, {user.nome?.split(" ")[0] || "Admin"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => logout("/login")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-secondary/60"
          >
            <LogOut className="size-3.5" /> Sair
          </button>
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="md:hidden size-10 rounded-full border border-border flex items-center justify-center"
            aria-label="Menu"
          >
            {navOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar / Tabs */}
        <aside
          className={cn(
            "md:sticky md:top-20 md:self-start md:block",
            navOpen ? "block" : "hidden md:block",
          )}
        >
          <nav className="bg-card rounded-2xl border border-border/60 p-2 flex md:flex-col gap-1 overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setNavOpen(false); }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors text-left flex-1 md:flex-none",
                  tab === key
                    ? "bg-foreground text-background"
                    : "text-foreground/70 hover:bg-secondary/60",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "produtos" && <AdminProductsTab />}
          {tab === "encomendas" && <AdminOrdersTab />}
          {tab === "clientes" && <AdminClientsTab />}
          {tab === "entregadores" && <AdminDeliverersTab />}
          {tab === "media" && <AdminMediaTab />}
        </main>
      </div>
    </div>
  );
}

function DashboardTab() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [clientsTotal, setClientsTotal] = useState(0);
  const [deliverersCount, setDeliverersCount] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [o, p, c, d] = await Promise.all([
          getOrders().catch(() => []),
          getProducts(true).catch(() => []),
          getClients({ limit: 1, page: 1 }).catch(() => ({ items: [], pagination: { total: 0 } } as any)),
          getDeliverers().catch(() => []),
        ]);
        if (!alive) return;
        setOrders(Array.isArray(o) ? o : []);
        setProducts(Array.isArray(p) ? p : []);
        setClientsTotal(c?.pagination?.total || 0);
        setDeliverersCount(Array.isArray(d) ? d.length : 0);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status === "Entregue").reduce((s, o) => s + (Number(o.total) || 0), 0);
    const pending = orders.filter(o => o.status === "Pendente" || o.status === "Em Processamento").length;
    const inDelivery = orders.filter(o => o.status === "Em Entrega").length;
    const delivered = orders.filter(o => o.status === "Entregue").length;
    return { totalRevenue, pending, inDelivery, delivered };
  }, [orders]);

  const recent = useMemo(() => orders.slice(0, 8), [orders]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Receita entregue" value={formatMZN(stats.totalRevenue)} accent />
        <KpiCard label="Pendentes" value={stats.pending} />
        <KpiCard label="Em entrega" value={stats.inDelivery} />
        <KpiCard label="Entregues" value={stats.delivered} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KpiCard label="Total de produtos" value={products.length} />
        <KpiCard label="Clientes registados" value={clientsTotal} />
        <KpiCard label="Entregadores ativos" value={deliverersCount} />
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-card">
        <h2 className="text-lg font-serif">Encomendas recentes</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <th className="text-left py-2">Cliente</th>
                <th className="text-left py-2">Data</th>
                <th className="text-left py-2">Estado</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Sem encomendas ainda.</td></tr>
              )}
              {recent.map((o) => (
                <tr key={o._id} className="border-b border-border/40 last:border-0">
                  <td className="py-3">{o.cliente?.nome || "—"}</td>
                  <td className="py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="py-3"><StatusPill status={o.status} /></td>
                  <td className="py-3 text-right font-semibold">{formatMZN(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, accent = false }: { label: string; value: any; accent?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border p-5",
      accent ? "bg-foreground text-background border-foreground" : "bg-card border-border/60",
    )}>
      <p className={cn("text-xs uppercase tracking-wider", accent ? "text-background/70" : "text-muted-foreground")}>{label}</p>
      <p className="mt-2 text-2xl font-serif">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Pendente": "bg-warning/15 text-warning-foreground border-warning/30",
    "Em Processamento": "bg-clay/15 text-clay border-clay/30",
    "Em Entrega": "bg-accent/15 text-accent border-accent/30",
    "Entregue": "bg-success/15 text-success border-success/30",
    "Cancelado": "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", map[status] || "bg-muted text-muted-foreground border-border")}>
      {status || "—"}
    </span>
  );
}

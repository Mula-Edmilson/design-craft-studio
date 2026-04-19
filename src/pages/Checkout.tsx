import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, MapPin, Truck, Store, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  getCart, updateCartItem, removeFromCart, cartTotal, clearCart,
  isLoggedIn, getProfile, getUser, createOrder, type OrderPayload,
} from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { formatMZN } from "@/lib/format";
import { cn } from "@/lib/utils";

const PICKUP_LOCATION_LABEL = "Levantamento no Ateliê — Av. Julius Nyerere, 1247, Sommerschield";

const PAYMENTS = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "emola", label: "e-Mola" },
  { value: "transferencia", label: "Transferência bancária" },
  { value: "entrega", label: "Pagar na entrega" },
];

export default function Checkout() {
  const { items, total } = useCart();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ orderId: string; mode: "delivery" | "pickup" } | null>(null);

  const [form, setForm] = useState({
    nome: "",
    contacto: "",
    morada: "",
    linkMapa: "",
    pagamento: "mpesa",
    notas: "",
  });

  // Prefill from session/user
  useEffect(() => {
    const u = getUser();
    if (u) setForm((s) => ({ ...s, nome: u.nome || s.nome, contacto: u.telefone || s.contacto }));
    if (isLoggedIn()) {
      getProfile().then((p: any) => {
        if (p) setForm((s) => ({ ...s, nome: s.nome || p.nome || "", contacto: s.contacto || p.telefone || "" }));
      }).catch(() => {});
    }
  }, []);

  // Simple delivery fee: flat 200 MZN within Maputo for now (preserved logic semantics).
  const deliveryFee = mode === "pickup" ? 0 : 200;
  const grandTotal = total + deliveryFee;

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) { toast.error("O carrinho está vazio."); return; }
    if (!form.nome || !form.contacto) { toast.error("Preencha nome e contacto."); return; }
    if (mode === "delivery" && !form.morada) { toast.error("Preencha a morada de entrega."); return; }

    setSubmitting(true);
    try {
      const subtotalProducts = cartTotal();
      const payload: OrderPayload = {
        cliente: {
          nome: form.nome.trim(),
          contacto: form.contacto.trim(),
          morada: mode === "pickup" ? PICKUP_LOCATION_LABEL : form.morada.trim(),
          linkMapa: mode === "delivery" ? (form.linkMapa.trim() || null) : null,
        },
        items: items.map((i) => ({
          produtoId: i._id,
          nome: i.nome,
          quantidade: i.quantidade,
          preco_unitario: Number(i.preco),
          subtotal: i.quantidade * Number(i.preco),
        })),
        subtotalProducts,
        deliveryFee,
        deliveryDistanceKm: null,
        total: subtotalProducts + deliveryFee,
        pagamento: form.pagamento,
        fulfillmentMethod: mode,
        pickupLocation: mode === "pickup" ? PICKUP_LOCATION_LABEL : "",
        notas: form.notas.trim(),
      };
      const res = await createOrder(payload);
      clearCart();
      setSuccess({ orderId: res.orderId, mode });
      toast.success(mode === "pickup" ? "Pedido registado para levantamento!" : "Pedido confirmado com sucesso!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.message || "Erro ao submeter pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="container-px mx-auto max-w-2xl py-20 text-center">
        <div className="mx-auto size-16 rounded-full bg-success/10 text-success flex items-center justify-center">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="mt-6 text-4xl">Encomenda confirmada!</h1>
        <p className="mt-3 text-muted-foreground">
          O seu pedido <span className="font-mono text-foreground">#{success.orderId}</span> foi registado.
          {success.mode === "pickup"
            ? " Avisamos quando estiver pronto para levantamento."
            : " A nossa equipa entrará em contacto para confirmar a entrega."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/pedidos" className="px-6 py-3 rounded-full bg-foreground text-background font-semibold">
            Ver os meus pedidos
          </Link>
          <Link to="/" className="px-6 py-3 rounded-full border border-border bg-card font-semibold">
            Continuar a comprar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-12 lg:py-16">
      <header className="mb-10">
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-accent">Carrinho</span>
        <h1 className="mt-3 text-4xl lg:text-5xl">Finalizar encomenda</h1>
      </header>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-12 text-center">
          <div className="size-14 mx-auto rounded-full bg-background border border-border flex items-center justify-center">
            <ShoppingBag className="size-6 text-muted-foreground" />
          </div>
          <h2 className="mt-5 text-2xl">O seu cesto está vazio</h2>
          <p className="mt-2 text-muted-foreground">Explore o catálogo ou faça uma encomenda personalizada.</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/" className="px-6 py-3 rounded-full bg-foreground text-background font-semibold">Ver catálogo</Link>
            <Link to="/encomenda-personalizada" className="px-6 py-3 rounded-full border border-border bg-card font-semibold">Encomenda personalizada</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items + form */}
          <div className="lg:col-span-7 space-y-8">
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Itens ({items.length})</h2>
              <ul className="divide-y divide-border">
                {items.map((it) => (
                  <li key={it._id} className="py-4 flex gap-4 items-center">
                    <div className="size-16 rounded-xl overflow-hidden bg-secondary shrink-0">
                      {it.imagem_url ? (
                        <img src={it.imagem_url} alt={it.nome} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{it.nome}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatMZN(it.preco)} × {it.quantidade}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
                      <button
                        onClick={() => updateCartItem(it._id, it.quantidade - 1)}
                        className="size-7 rounded-full hover:bg-secondary flex items-center justify-center"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center tabular-nums">{it.quantidade}</span>
                      <button
                        onClick={() => updateCartItem(it._id, it.quantidade + 1)}
                        className="size-7 rounded-full hover:bg-secondary flex items-center justify-center"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold w-24 text-right tabular-nums">{formatMZN(it.preco * it.quantidade)}</p>
                    <button
                      onClick={() => { removeFromCart(it._id); toast("Item removido."); }}
                      className="size-8 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center"
                      aria-label="Remover"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 space-y-6">
              <h2 className="text-xl font-semibold">Como quer receber?</h2>

              <div className="grid grid-cols-2 gap-3">
                <ModeButton active={mode === "delivery"} onClick={() => setMode("delivery")} icon={Truck} label="Entrega" hint="Maputo & Matola" />
                <ModeButton active={mode === "pickup"} onClick={() => setMode("pickup")} icon={Store} label="Levantar no ateliê" hint="Sommerschield" />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Nome completo" required value={form.nome} onChange={(v) => update("nome", v)} />
                <Field label="Contacto / WhatsApp" required value={form.contacto} onChange={(v) => update("contacto", v)} type="tel" />
              </div>

              {mode === "delivery" && (
                <div className="space-y-5">
                  <Field
                    label="Morada de entrega"
                    required
                    icon={MapPin}
                    value={form.morada}
                    onChange={(v) => update("morada", v)}
                    placeholder="Bairro, avenida, número, ponto de referência…"
                  />
                  <Field
                    label="Link Google Maps (opcional)"
                    value={form.linkMapa}
                    onChange={(v) => update("linkMapa", v)}
                    placeholder="https://maps.app.goo.gl/…"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-2">Forma de pagamento</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PAYMENTS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => update("pagamento", p.value)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                        form.pagamento === p.value ? "border-accent bg-accent/10 text-foreground" : "border-border bg-background hover:bg-secondary/60",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Notas adicionais (opcional)</label>
                <textarea
                  rows={3}
                  value={form.notas}
                  onChange={(e) => update("notas", e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  placeholder="Ex.: prefiro ser contactado depois das 17h…"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-accent text-accent-foreground font-semibold shadow-warm disabled:opacity-60"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                {submitting ? "A processar…" : "Confirmar encomenda"}
              </button>
            </form>
          </div>

          {/* Summary */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 rounded-3xl bg-foreground text-background p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6">Resumo</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="opacity-70">Subtotal</dt><dd>{formatMZN(total)}</dd></div>
                <div className="flex justify-between">
                  <dt className="opacity-70">{mode === "pickup" ? "Levantamento" : "Entrega"}</dt>
                  <dd>{mode === "pickup" ? "Grátis" : formatMZN(deliveryFee)}</dd>
                </div>
                <div className="h-px bg-background/20 my-3" />
                <div className="flex justify-between text-lg font-semibold">
                  <dt>Total</dt><dd className="text-accent">{formatMZN(grandTotal)}</dd>
                </div>
              </dl>
              <p className="mt-6 text-xs opacity-60">
                Os preços incluem IVA. Confirmação final por mensagem após validação do pagamento.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function ModeButton({ active, onClick, icon: Icon, label, hint }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl border text-left transition-colors",
        active ? "border-accent bg-accent/10" : "border-border bg-background hover:bg-secondary/60",
      )}
    >
      <Icon className={cn("size-5", active ? "text-accent" : "text-muted-foreground")} />
      <p className="mt-2 text-sm font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </button>
  );
}

function Field({
  label, value, onChange, type = "text", required, icon: Icon, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; icon?: any; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-2">{label}{required && <span className="text-accent ml-1">*</span>}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />}
        <input
          type={type}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent",
            Icon && "pl-10",
          )}
        />
      </div>
    </div>
  );
}

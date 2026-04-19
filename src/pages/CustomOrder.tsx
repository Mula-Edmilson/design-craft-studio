import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Upload, X, Plus, Minus, Loader2, CheckCircle2, ImageIcon,
  Truck, Store, Lock, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { isLoggedIn, getUser, createCustomOrder } from "@/lib/api";
import { cn } from "@/lib/utils";

type Tipo = "Banner" | "Canvas" | "Vinil";

const TIPOS: { value: Tipo; label: string; desc: string; emoji: string }[] = [
  { value: "Banner", label: "Banner", desc: "Lona PVC para outdoor.", emoji: "🪧" },
  { value: "Canvas", label: "Canvas", desc: "Tela esticada para parede.", emoji: "🖼️" },
  { value: "Vinil", label: "Vinil", desc: "Adesivos e recortes.", emoji: "🏷️" },
];

const SIZES: Record<Tipo, string[]> = {
  Canvas: ["30x40cm", "40x60cm", "60x90cm", "90x120cm", "Personalizado"],
  Banner: ["60x90cm", "90x120cm", "120x180cm", "150x200cm", "200x300cm", "Personalizado"],
  Vinil: ["A4 (21x30cm)", "A3 (30x42cm)", "A2 (42x59cm)", "60x90cm", "Personalizado"],
};

const PAGAMENTOS = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "emola", label: "e-Mola" },
  { value: "transferencia", label: "Transferência" },
  { value: "entrega", label: "Na entrega" },
];

const CUSTOM_PICKUP_LOCATION = "Levantamento no Ateliê — Av. Julius Nyerere, 1247, Sommerschield";

export default function CustomOrder() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [largura, setLargura] = useState<string>("");
  const [altura, setAltura] = useState<string>("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [descricao, setDescricao] = useState("");
  const [pagamento, setPagamento] = useState("mpesa");
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [nome, setNome] = useState("");
  const [contacto, setContacto] = useState("");
  const [morada, setMorada] = useState("");
  const [mapa, setMapa] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const authed = isLoggedIn();

  useEffect(() => {
    const tParam = params.get("tipo");
    if (tParam) {
      const matched = TIPOS.find((t) => t.value.toLowerCase() === tParam.toLowerCase());
      if (matched) setTipo(matched.value);
    }
    if (authed) {
      const u = getUser();
      if (u?.nome) setNome(u.nome);
      if (u?.telefone) setContacto(u.telefone);
    }
  }, [params, authed]);

  function handleFile(f: File | null) {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("Ficheiro demasiado grande. Máximo 10 MB."); return; }
    setFile(f);
    if (f.type.startsWith("image/")) setFilePreview(URL.createObjectURL(f));
    else setFilePreview(null);
  }

  function clearFile() {
    setFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authed) { navigate("/cliente-login?redirect=/encomenda-personalizada"); return; }
    if (!tipo) { toast.error("Escolha o tipo de produto."); return; }
    if (!size) { toast.error("Escolha um tamanho."); return; }
    if (size === "Personalizado" && (!largura || !altura)) {
      toast.error("Preencha largura e altura.");
      return;
    }
    if (!nome || !contacto) { toast.error("Preencha nome e contacto."); return; }
    if (mode === "delivery" && !morada) { toast.error("Preencha a morada."); return; }
    if (!descricao.trim()) { toast.error("Descreva o que pretende imprimir."); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("tipo_produto", tipo);
      fd.append("tamanho_opcao", size);
      fd.append("largura", largura);
      fd.append("altura", altura);
      fd.append("quantidade", String(quantidade));
      fd.append("descricao", descricao);
      fd.append("pagamento", pagamento);
      fd.append("fulfillmentMethod", mode);
      fd.append("pickupLocation", mode === "pickup" ? CUSTOM_PICKUP_LOCATION : "");
      fd.append("cliente_nome", nome);
      fd.append("cliente_contacto", contacto);
      fd.append("cliente_morada", mode === "pickup" ? CUSTOM_PICKUP_LOCATION : morada);
      fd.append("cliente_linkMapa", mode === "pickup" ? "" : mapa);
      if (file) fd.append("foto", file);

      const res = await createCustomOrder(fd);
      setSuccess(res?.orderId || res?._id || "—");
      toast.success("Pedido personalizado enviado!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar pedido.");
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
        <h1 className="mt-6 text-4xl">Pedido recebido!</h1>
        <p className="mt-3 text-muted-foreground">
          O seu pedido <span className="font-mono text-foreground">#{success}</span> foi enviado para o nosso ateliê. Vamos contactá-lo em breve com o orçamento.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/pedidos" className="px-6 py-3 rounded-full bg-foreground text-background font-semibold">Ver os meus pedidos</Link>
          <Link to="/" className="px-6 py-3 rounded-full border border-border bg-card font-semibold">Voltar à loja</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-6xl py-12 lg:py-16">
      <header className="mb-10 max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-accent">Encomenda Personalizada</span>
        <h1 className="mt-3 text-4xl lg:text-5xl">
          Imprima exactamente <span className="font-serif-italic text-accent">o que imagina</span>.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Conte-nos os detalhes, envie o ficheiro de design e nós tratamos do resto.
        </p>
      </header>

      {!authed && (
        <div className="mb-8 rounded-2xl border border-accent/30 bg-accent/5 p-5 flex items-start gap-4">
          <Lock className="size-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Tem de iniciar sessão para enviar um pedido personalizado.</p>
            <p className="text-sm text-muted-foreground mt-1">Pode preencher os campos abaixo, mas só consegue submeter depois de entrar.</p>
          </div>
          <Link
            to="/cliente-login?redirect=/encomenda-personalizada"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-accent-foreground font-semibold text-sm whitespace-nowrap"
          >
            Entrar <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* TIPO */}
        <Section title="1. Tipo de produto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TIPOS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => { setTipo(t.value); setSize(null); }}
                className={cn(
                  "p-5 rounded-2xl border text-left transition-all",
                  tipo === t.value ? "border-accent bg-accent/10 shadow-warm" : "border-border bg-card hover:border-foreground/20",
                )}
              >
                <span className="text-3xl">{t.emoji}</span>
                <p className="mt-3 text-base font-semibold">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* SIZE */}
        {tipo && (
          <Section title="2. Tamanho">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {SIZES[tipo].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "px-3 py-3 rounded-xl border text-sm font-medium",
                    size === s ? "border-accent bg-accent/10" : "border-border bg-card hover:bg-secondary/60",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {size === "Personalizado" && (
              <div className="mt-5 grid sm:grid-cols-2 gap-4 max-w-md">
                <Field label="Largura (cm)" type="number" value={largura} onChange={setLargura} />
                <Field label="Altura (cm)" type="number" value={altura} onChange={setAltura} />
              </div>
            )}
          </Section>
        )}

        {/* QTY + DESC */}
        <Section title="3. Quantidade e descrição">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Quantidade</span>
            <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
              <button type="button" onClick={() => setQuantidade((q) => Math.max(1, q - 1))} className="size-9 rounded-full hover:bg-secondary flex items-center justify-center"><Minus className="size-4" /></button>
              <span className="w-10 text-center font-semibold tabular-nums">{quantidade}</span>
              <button type="button" onClick={() => setQuantidade((q) => q + 1)} className="size-9 rounded-full hover:bg-secondary flex items-center justify-center"><Plus className="size-4" /></button>
            </div>
          </div>
          <div className="mt-5">
            <label className="text-sm font-medium block mb-2">Descrição do projecto</label>
            <textarea
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="Cores, materiais preferidos, prazo, referências…"
            />
          </div>
        </Section>

        {/* FILE */}
        <Section title="4. Ficheiro de design (opcional, máx. 10MB)">
          <input ref={fileRef} type="file" accept="image/*,application/pdf,.ai,.psd" hidden onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          {!file ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0] || null); }}
              className="w-full rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center hover:bg-secondary/50 transition-colors"
            >
              <Upload className="size-7 mx-auto text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Carregar ficheiro</p>
              <p className="text-xs text-muted-foreground">Arraste para aqui ou clique para escolher</p>
            </button>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="size-16 rounded-xl overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                {filePreview ? <img src={filePreview} alt={file.name} className="w-full h-full object-cover" /> : <ImageIcon className="size-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" onClick={clearFile} className="size-9 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center"><X className="size-4" /></button>
            </div>
          )}
        </Section>

        {/* CLIENT INFO */}
        <Section title="5. Como prefere receber?">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <ModeButton active={mode === "delivery"} onClick={() => setMode("delivery")} icon={Truck} label="Entrega" hint="Maputo & Matola" />
            <ModeButton active={mode === "pickup"} onClick={() => setMode("pickup")} icon={Store} label="Levantar" hint="Sommerschield" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Nome completo" required value={nome} onChange={setNome} />
            <Field label="Contacto / WhatsApp" required value={contacto} onChange={setContacto} type="tel" />
          </div>
          {mode === "delivery" && (
            <div className="mt-5 space-y-5">
              <Field label="Morada" required value={morada} onChange={setMorada} placeholder="Bairro, avenida, número, ponto de referência…" />
              <Field label="Link Google Maps (opcional)" value={mapa} onChange={setMapa} placeholder="https://maps.app.goo.gl/…" />
            </div>
          )}
        </Section>

        {/* PAYMENT */}
        <Section title="6. Forma de pagamento">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAGAMENTOS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPagamento(p.value)}
                className={cn(
                  "px-3 py-3 rounded-xl border text-sm font-medium",
                  pagamento === p.value ? "border-accent bg-accent/10" : "border-border bg-card hover:bg-secondary/60",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Section>

        <button
          type="submit"
          disabled={submitting || !authed}
          className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-accent text-accent-foreground font-semibold shadow-warm disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          {submitting ? "A enviar…" : "Enviar pedido para orçamento"}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-5">{title}</h2>
      {children}
    </section>
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
  label, value, onChange, type = "text", required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-2">{label}{required && <span className="text-accent ml-1">*</span>}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}

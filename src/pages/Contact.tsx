import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.mensagem) {
      toast.error("Preencha nome, email e mensagem.");
      return;
    }
    setSubmitting(true);
    // Compose WhatsApp message (the original site also relied on WhatsApp for contact form)
    const text =
      `*Novo contacto via website*%0A` +
      `Nome: ${encodeURIComponent(form.nome)}%0A` +
      `Email: ${encodeURIComponent(form.email)}%0A` +
      (form.telefone ? `Telefone: ${encodeURIComponent(form.telefone)}%0A` : "") +
      `%0A${encodeURIComponent(form.mensagem)}`;
    window.open(`https://wa.me/258840000000?text=${text}`, "_blank", "noopener");
    toast.success("A abrir conversa no WhatsApp…");
    setSubmitting(false);
  }

  return (
    <div className="container-px mx-auto max-w-6xl py-16 lg:py-24">
      <header className="mb-12 max-w-2xl">
        <span className="inline-block text-[11px] uppercase tracking-[0.2em] font-semibold text-accent">Contacto</span>
        <h1 className="mt-4 text-5xl lg:text-6xl">
          Vamos <span className="font-serif-italic text-accent">conversar</span>.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Conte-nos sobre o seu projecto. Respondemos em poucas horas, dias úteis.
        </p>
      </header>

      <div className="grid lg:grid-cols-5 gap-10">
        <aside className="lg:col-span-2 space-y-6">
          <ContactCard icon={MapPin} title="Ateliê" lines={["Av. Julius Nyerere, 1247", "Sommerschield, Maputo"]} />
          <ContactCard icon={Phone} title="Telefone" lines={[<a key="t" href="tel:+258840000000" className="hover:text-accent">+258 84 000 0000</a>]} />
          <ContactCard icon={Mail} title="Email" lines={[<a key="e" href="mailto:ola@printpalette.mz" className="hover:text-accent">ola@printpalette.mz</a>]} />
          <ContactCard icon={Clock} title="Horário" lines={["Seg — Sex: 08h00 — 18h00", "Sábado: 09h00 — 13h00"]} />
        </aside>

        <form onSubmit={handleSubmit} className="lg:col-span-3 rounded-3xl border border-border bg-card p-6 sm:p-10 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Nome" required value={form.nome} onChange={(v) => update("nome", v)} />
            <Field label="Email" type="email" required value={form.email} onChange={(v) => update("email", v)} />
          </div>
          <Field label="Telefone (opcional)" type="tel" value={form.telefone} onChange={(v) => update("telefone", v)} />
          <div>
            <label className="text-sm font-medium block mb-2">Mensagem</label>
            <textarea
              required
              rows={6}
              value={form.mensagem}
              onChange={(e) => update("mensagem", e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="Conte-nos o que pretende imprimir, quantidades, prazos…"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold shadow-warm hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            <Send className="size-4" />
            Enviar mensagem
          </button>
        </form>
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, title, lines }: { icon: any; title: string; lines: React.ReactNode[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex gap-4">
      <div className="size-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
        <Icon className="size-4" />
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
        <div className="mt-1.5 text-sm text-foreground space-y-0.5">{lines.map((l, i) => <p key={i}>{l}</p>)}</div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-2">{label}{required && <span className="text-accent ml-1">*</span>}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}

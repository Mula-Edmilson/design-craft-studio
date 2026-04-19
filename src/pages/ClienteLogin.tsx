import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Mail, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { login, register } from "@/lib/api";

export default function ClienteLogin() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const redirect = params.get("redirect") || "/cliente-painel";

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData] = useState({ nome: "", email: "", telefone: "", password: "" });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success("Bem-vindo!");
      navigate(redirect);
    } catch (err: any) {
      toast.error(err.message || "Falha no login.");
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regData.password.length < 6) { toast.error("A palavra-passe precisa de pelo menos 6 caracteres."); return; }
    setLoading(true);
    try {
      await register(regData);
      toast.success("Conta criada!");
      navigate(redirect);
    } catch (err: any) {
      toast.error(err.message || "Falha no registo.");
    } finally { setLoading(false); }
  }

  return (
    <div className="container-px mx-auto max-w-md py-16 lg:py-24">
      <div className="text-center mb-8">
        <h1 className="text-4xl">{tab === "login" ? "Bem-vindo de volta" : "Criar conta"}</h1>
        <p className="mt-2 text-muted-foreground text-sm">Aceda à sua área de cliente PrintPalette.</p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="grid grid-cols-2 p-1 rounded-full bg-secondary mb-6">
          <button onClick={() => setTab("login")} className={`py-2 rounded-full text-sm font-semibold transition-colors ${tab === "login" ? "bg-background shadow-soft" : "text-muted-foreground"}`}>Entrar</button>
          <button onClick={() => setTab("register")} className={`py-2 rounded-full text-sm font-semibold transition-colors ${tab === "register" ? "bg-background shadow-soft" : "text-muted-foreground"}`}>Criar conta</button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Field icon={Mail} type="email" placeholder="email@exemplo.mz" value={loginData.email} onChange={(v) => setLoginData((s) => ({ ...s, email: v }))} required />
            <Field icon={Lock} type="password" placeholder="Palavra-passe" value={loginData.password} onChange={(v) => setLoginData((s) => ({ ...s, password: v }))} required />
            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-foreground text-background font-semibold disabled:opacity-60">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Entrar
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <Field icon={User} placeholder="Nome completo" value={regData.nome} onChange={(v) => setRegData((s) => ({ ...s, nome: v }))} required />
            <Field icon={Mail} type="email" placeholder="email@exemplo.mz" value={regData.email} onChange={(v) => setRegData((s) => ({ ...s, email: v }))} required />
            <Field icon={Phone} type="tel" placeholder="Telefone (opcional)" value={regData.telefone} onChange={(v) => setRegData((s) => ({ ...s, telefone: v }))} />
            <Field icon={Lock} type="password" placeholder="Palavra-passe (mín. 6)" value={regData.password} onChange={(v) => setRegData((s) => ({ ...s, password: v }))} required />
            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold disabled:opacity-60">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Criar conta
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        És membro da equipa? <Link to="/login" className="text-accent font-semibold">Entrar como staff</Link>
      </p>
    </div>
  );
}

function Field({ icon: Icon, ...props }: any) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <input
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}

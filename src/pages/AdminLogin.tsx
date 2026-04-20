import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { login, getUser, isLoggedIn } from "@/lib/api";
import { Logo } from "@/components/Logo";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      const u = getUser();
      if (u?.role === "admin") navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data?.user?.role !== "admin") {
        toast.error("Esta área é apenas para administradores.");
        setLoading(false);
        return;
      }
      toast.success("Bem-vindo ao painel.");
      navigate("/admin", { replace: true });
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center container-px py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
          <div className="mt-6 size-14 mx-auto rounded-full bg-foreground text-background flex items-center justify-center">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="mt-4 text-3xl">Painel Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acesso restrito à equipa PrintPalette.</p>
        </div>

        <form onSubmit={onSubmit} className="bg-card rounded-3xl border border-border/60 p-8 shadow-card space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="admin@printpalette.mz"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-semibold disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Entrar no painel
          </button>
        </form>
      </div>
    </div>
  );
}

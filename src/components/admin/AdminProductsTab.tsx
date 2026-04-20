import { useEffect, useState, useMemo } from "react";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  type Product,
} from "@/lib/api";
import { formatMZN } from "@/lib/format";

const CATEGORIES = ["Geral", "Cartões", "Banner", "Canvas", "Vinil", "Marketing", "Vestuário", "Álbuns"];

export function AdminProductsTab() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProducts(true);
      setItems(data);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(p =>
      p.nome?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q),
    );
  }, [items, search]);

  const onDelete = async (id: string) => {
    if (!confirm("Eliminar este produto?")) return;
    try {
      await deleteProduct(id);
      toast.success("Produto eliminado.");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao eliminar.");
    }
  };

  const onToggleVisible = async (p: Product) => {
    try {
      await updateProduct(p._id, { visivel: !p.visivel });
      load();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procurar por nome ou categoria..."
            className="w-full pl-9 pr-3 py-2.5 rounded-full border border-input bg-background text-sm"
          />
        </div>
        <button
          onClick={() => setEditing({ nome: "", preco: 0, categoria: "Geral", visivel: true } as any)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold"
        >
          <Plus className="size-4" /> Novo produto
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
                  <th className="text-left px-4 py-3">Produto</th>
                  <th className="text-left px-4 py-3">Categoria</th>
                  <th className="text-right px-4 py-3">Preço</th>
                  <th className="text-right px-4 py-3">Stock</th>
                  <th className="text-center px-4 py-3">Visível</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Sem produtos.</td></tr>
                )}
                {filtered.map((p) => (
                  <tr key={p._id} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imagem_url ? (
                          <img src={p.imagem_url} alt={p.nome} className="size-12 rounded-xl object-cover bg-muted" loading="lazy" />
                        ) : (
                          <div className="size-12 rounded-xl bg-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.nome}</p>
                          {p.preco_desconto && <p className="text-xs text-accent font-semibold">Promo: {formatMZN(p.preco_desconto)}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.categoria}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMZN(p.preco)}</td>
                    <td className="px-4 py-3 text-right">{(p as any).stock ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onToggleVisible(p)}
                        className="inline-flex items-center justify-center size-8 rounded-full hover:bg-secondary"
                        title={p.visivel ? "Visível" : "Oculto"}
                      >
                        {p.visivel ? <Eye className="size-4 text-success" /> : <EyeOff className="size-4 text-muted-foreground" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(p)} className="size-8 rounded-full hover:bg-secondary inline-flex items-center justify-center" title="Editar">
                          <Pencil className="size-3.5" />
                        </button>
                        <button onClick={() => onDelete(p._id)} className="size-8 rounded-full hover:bg-destructive/10 text-destructive inline-flex items-center justify-center" title="Eliminar">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <ProductFormModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSaved }: { product: Partial<Product>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({
    nome: product.nome || "",
    descricao: product.descricao || "",
    categoria: product.categoria || "Geral",
    preco: product.preco ?? 0,
    preco_desconto: product.preco_desconto ?? "",
    stock: (product as any).stock ?? 0,
    imagem_url: product.imagem_url || "",
    visivel: product.visivel !== false,
  });
  const [saving, setSaving] = useState(false);
  const isNew = !product._id;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        preco: Number(form.preco) || 0,
        stock: Number(form.stock) || 0,
        preco_desconto: form.preco_desconto === "" || form.preco_desconto === null ? null : Number(form.preco_desconto),
      };
      if (isNew) await createProduct(payload);
      else await updateProduct(product._id!, payload);
      toast.success(isNew ? "Produto criado." : "Produto atualizado.");
      onSaved();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-3xl border border-border/60 shadow-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/60 sticky top-0 bg-card z-10">
          <h2 className="text-xl font-serif">{isNew ? "Novo produto" : "Editar produto"}</h2>
          <button onClick={onClose} className="size-9 rounded-full hover:bg-secondary inline-flex items-center justify-center"><X className="size-4" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <Field label="Nome" required>
            <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Descrição">
            <textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Categoria">
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="URL da imagem">
              <input value={form.imagem_url} onChange={(e) => setForm({ ...form, imagem_url: e.target.value })} placeholder="https://..." className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Preço (MZN)" required>
              <input required type="number" min={0} step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Preço promo (opcional)">
              <input type="number" min={0} step="0.01" value={form.preco_desconto} onChange={(e) => setForm({ ...form, preco_desconto: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Stock">
              <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.visivel} onChange={(e) => setForm({ ...form, visivel: e.target.checked })} className="size-4 accent-accent" />
            Produto visível na loja
          </label>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-secondary/60">Cancelar</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-60">
              {saving && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

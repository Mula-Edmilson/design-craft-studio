import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, ImageIcon, Film, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { getMediaLibrary, uploadMedia } from "@/lib/api";
import { cn } from "@/lib/utils";

type MediaItem = { name: string; url: string; path: string; type: string; scope: string; size: number };

export function AdminMediaTab() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"all" | "products" | "social">("all");
  const [type, setType] = useState<"all" | "image" | "video">("all");
  const [uploading, setUploading] = useState(false);
  const [uploadScope, setUploadScope] = useState<"products" | "social">("products");
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (scope !== "all") params.scope = scope;
      if (type !== "all") params.type = type;
      const data = await getMediaLibrary(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) { toast.error(err?.message || "Erro a carregar."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [scope, type]);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("scope", uploadScope);
      fd.append("type", uploadType);
      await uploadMedia(fd);
      toast.success("Ficheiro enviado.");
      load();
    } catch (err: any) { toast.error(err?.message || "Erro no upload."); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch { toast.error("Não foi possível copiar."); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-card">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Destino</label>
            <select value={uploadScope} onChange={(e) => setUploadScope(e.target.value as any)} className="mt-1.5 px-4 py-2.5 rounded-xl border border-input bg-background text-sm">
              <option value="products">Produtos</option>
              <option value="social">Social</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</label>
            <select value={uploadType} onChange={(e) => setUploadType(e.target.value as any)} className="mt-1.5 px-4 py-2.5 rounded-xl border border-input bg-background text-sm">
              <option value="image">Imagem (≤300KB)</option>
              <option value="video">Vídeo (≤1MB)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <input
              ref={fileRef}
              type="file"
              accept={uploadType === "image" ? "image/*" : "video/*"}
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              className="hidden"
              id="media-upload"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-60"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {uploading ? "A enviar..." : "Escolher e enviar"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={scope === "all"} onClick={() => setScope("all")}>Todos</FilterChip>
        <FilterChip active={scope === "products"} onClick={() => setScope("products")}>Produtos</FilterChip>
        <FilterChip active={scope === "social"} onClick={() => setScope("social")}>Social</FilterChip>
        <span className="w-px h-6 bg-border mx-1 self-center" />
        <FilterChip active={type === "all"} onClick={() => setType("all")}>Todos os tipos</FilterChip>
        <FilterChip active={type === "image"} onClick={() => setType("image")}><ImageIcon className="size-3" /> Imagens</FilterChip>
        <FilterChip active={type === "video"} onClick={() => setType("video")}><Film className="size-3" /> Vídeos</FilterChip>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-3xl p-12 text-center text-muted-foreground">
          Sem ficheiros nesta biblioteca.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((m) => (
            <div key={m.path} className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-card group">
              <div className="aspect-square bg-muted relative overflow-hidden">
                {m.type === "image" ? (
                  <img src={m.url} alt={m.name} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <video src={m.url} className="w-full h-full object-cover" muted />
                )}
              </div>
              <div className="p-3 space-y-2">
                <p className="text-xs font-medium truncate" title={m.name}>{m.name}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded-full bg-secondary">{m.scope}</span>
                  <span>{(m.size / 1024).toFixed(0)} KB</span>
                </div>
                <button onClick={() => copyUrl(m.url)} className="w-full inline-flex items-center justify-center gap-1.5 text-xs px-2 py-1.5 rounded-full border border-border hover:bg-secondary/60">
                  {copied === m.url ? <><Check className="size-3 text-success" /> Copiado</> : <><Copy className="size-3" /> Copiar URL</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
      active ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary/60",
    )}>
      {children}
    </button>
  );
}

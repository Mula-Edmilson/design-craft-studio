import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, Palette, ShoppingBag, Star } from "lucide-react";
import { getProducts, addToCart, type Product } from "@/lib/api";
import { formatMZN } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import heroImg from "@/assets/hero.jpg";
import catCards from "@/assets/cat-cards.jpg";
import catAlbums from "@/assets/cat-albums.jpg";
import catApparel from "@/assets/cat-apparel.jpg";
import catMarketing from "@/assets/cat-marketing.jpg";
import catBanner from "@/assets/cat-banner.jpg";
import catCanvas from "@/assets/cat-canvas.jpg";

const CATEGORIES = [
  { label: "Cartões de visita", image: catCards, href: "/encomenda-personalizada", tag: "Letterpress" },
  { label: "Álbuns de memórias", image: catAlbums, href: "/encomenda-personalizada", tag: "Linho natural" },
  { label: "T-shirts & merch", image: catApparel, href: "/encomenda-personalizada", tag: "Serigrafia" },
  { label: "Flyers & brochuras", image: catMarketing, href: "/encomenda-personalizada", tag: "Papel reciclado" },
  { label: "Banners outdoor", image: catBanner, href: "/encomenda-personalizada?tipo=Banner", tag: "Lona PVC" },
  { label: "Canvas decorativos", image: catCanvas, href: "/encomenda-personalizada?tipo=Canvas", tag: "Algodão 380g" },
];

const STEPS = [
  { num: "01", title: "Configure", desc: "Escolha o produto, formato, materiais e acabamentos no nosso estúdio criativo." },
  { num: "02", title: "Produção", desc: "A nossa equipa imprime e finaliza com rigor artesanal num tempo record." },
  { num: "03", title: "Entrega", desc: "Recebe a encomenda em 24-48h em qualquer ponto da Cidade de Maputo." },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await getProducts();
        if (alive) setProducts(list.filter((p) => p.visivel !== false));
      } catch (e: any) {
        console.error("Falha a carregar produtos:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const featured = products.slice(0, 8);

  function handleAdd(p: Product) {
    try {
      addToCart(p, 1);
      toast.success(`${p.nome} adicionado ao cesto`);
    } catch (e: any) {
      toast.error(e.message || "Não foi possível adicionar.");
    }
  }

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-px mx-auto max-w-7xl pt-12 pb-16 lg:pt-20 lg:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-clay/10 text-clay text-[11px] font-semibold uppercase tracking-[0.18em]">
              <Sparkles className="size-3" />
              Impressão criativa em Maputo
            </span>
            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-foreground">
              Impressão que se sente <span className="font-serif-italic text-accent">ao toque</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-[48ch] leading-relaxed">
              Transformamos as suas ideias em objectos tangíveis: cartões, álbuns, t-shirts, banners e muito mais — com acabamento de gráfica boutique e entrega rápida em Maputo.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/encomenda-personalizada"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-accent text-accent-foreground font-semibold shadow-warm hover:scale-[1.02] transition-transform ring-focus"
              >
                Encomendar agora <ArrowRight className="size-4" />
              </Link>
              <a
                href="#categorias"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-border bg-card font-semibold hover:bg-secondary/60 transition-colors ring-focus"
              >
                Ver catálogo
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <dt className="text-2xl font-serif text-accent">24h</dt>
                <dd className="text-xs text-muted-foreground mt-1">Produção expressa</dd>
              </div>
              <div>
                <dt className="text-2xl font-serif text-accent">+800</dt>
                <dd className="text-xs text-muted-foreground mt-1">Clientes felizes</dd>
              </div>
              <div>
                <dt className="text-2xl font-serif text-accent">100%</dt>
                <dd className="text-xs text-muted-foreground mt-1">Made in Maputo</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative aspect-[5/4] rounded-3xl overflow-hidden shadow-card">
              <img
                src={heroImg}
                alt="Ateliê PrintPalette em Maputo"
                width={1600}
                height={1200}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-background">
                <div>
                  <p className="text-[11px] uppercase tracking-widest opacity-80">Destaque da semana</p>
                  <h3 className="text-2xl font-serif mt-1">Cartões em papel de algodão 600g</h3>
                </div>
                <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/90 text-foreground text-xs font-semibold">
                  <Star className="size-3 fill-accent text-accent" /> 4.9
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categorias" className="container-px mx-auto max-w-7xl py-16 lg:py-24">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl">
              Categorias <span className="font-serif-italic text-accent">em destaque</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Explore a curadoria de suportes e formatos.</p>
          </div>
          <Link to="/encomenda-personalizada" className="hidden sm:inline-flex text-sm font-semibold text-foreground border-b-2 border-accent pb-1">
            Ver tudo
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              to={c.href}
              className="group block rounded-2xl overflow-hidden bg-secondary/40 hover:shadow-card transition-shadow"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={c.image}
                  alt={c.label}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.tag}</p>
                <h3 className="text-sm font-medium mt-0.5 text-foreground">{c.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="container-px mx-auto max-w-7xl py-8 lg:py-12">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl">
              Loja <span className="font-serif-italic text-accent">PrintPalette</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Produtos prontos a encomendar online.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] rounded-2xl bg-secondary/60 animate-pulse" />
                <div className="h-3 w-3/4 bg-secondary/60 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-secondary/60 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-10 text-center">
            <p className="text-muted-foreground">
              Sem produtos disponíveis de momento. Pode fazer já uma{" "}
              <Link to="/encomenda-personalizada" className="text-accent font-semibold underline-offset-2 hover:underline">
                encomenda personalizada
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary/40 paper-grain py-20 lg:py-28">
        <div className="container-px mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <h2 className="text-4xl lg:text-5xl leading-tight">
                Processo simples,{" "}
                <span className="font-serif-italic text-accent">resultado único.</span>
              </h2>
              <p className="mt-5 text-muted-foreground max-w-md">
                Acompanhamos cada detalhe — da escolha do papel à entrega na sua porta em Maputo.
              </p>
              <Link
                to="/encomenda-personalizada"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-foreground/90 transition-colors"
              >
                Começar projecto <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {STEPS.map((s) => (
                <div key={s.num} className="bg-background rounded-2xl p-6 shadow-soft">
                  <span className="font-serif-italic text-3xl text-accent block">{s.num}.</span>
                  <h4 className="mt-3 text-lg font-semibold">{s.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="container-px mx-auto max-w-7xl py-20 lg:py-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-ink text-background p-10 lg:p-16">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="inline-block text-[11px] uppercase tracking-widest font-semibold text-accent">Coleção memórias</span>
              <h2 className="mt-4 text-4xl lg:text-5xl">
                O seu ano merece um <span className="font-serif-italic">lugar físico</span>.
              </h2>
              <p className="mt-4 text-background/70 max-w-md">
                15% de desconto em todos os álbuns de linho este mês. Use o código abaixo no checkout.
              </p>
              <div className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-background/10 border border-background/20 backdrop-blur">
                <code className="font-mono text-sm tracking-wider">MEMORIA15</code>
                <span className="h-4 w-px bg-background/30" />
                <Link to="/encomenda-personalizada" className="text-sm font-semibold inline-flex items-center gap-1 hover:text-accent transition-colors">
                  Aplicar <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img src={catAlbums} alt="Álbum de memórias" loading="lazy" className="w-full h-full object-cover rotate-2 scale-105" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="container-px mx-auto max-w-7xl pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Palette, title: "Acabamento de boutique", desc: "Letterpress, hot stamping, relevo, costura artesanal." },
            { icon: Truck, title: "Entrega rápida em Maputo", desc: "Cidade e Matola em 24-48h. Levantamento gratuito." },
            { icon: ShoppingBag, title: "Pagamento flexível", desc: "M-Pesa, e-Mola, transferência ou na entrega." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <div className="size-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const hasDiscount = product.preco_desconto && product.preco_desconto < product.preco;
  const price = hasDiscount ? product.preco_desconto! : product.preco;
  return (
    <div className="group">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-secondary/60">
        {product.imagem_url ? (
          <img
            src={product.imagem_url}
            alt={product.nome}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Sem imagem</div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest">
            Promo
          </span>
        )}
        <button
          onClick={() => onAdd(product)}
          className={cn(
            "absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-foreground text-background text-xs font-semibold",
            "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300",
          )}
        >
          <ShoppingBag className="size-3.5" />
          Adicionar
        </button>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium line-clamp-1">{product.nome}</h3>
        <p className="mt-1 text-sm">
          <span className="font-semibold text-foreground">{formatMZN(price)}</span>
          {hasDiscount && (
            <span className="ml-2 text-xs text-muted-foreground line-through">{formatMZN(product.preco)}</span>
          )}
        </p>
      </div>
    </div>
  );
}

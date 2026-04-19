import { Link } from "react-router-dom";
import { Heart, Award, Users, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export default function About() {
  return (
    <div className="container-px mx-auto max-w-5xl py-16 lg:py-24">
      <header className="mb-12 text-center">
        <span className="inline-block text-[11px] uppercase tracking-[0.2em] font-semibold text-accent">O Ateliê</span>
        <h1 className="mt-4 text-5xl lg:text-6xl">
          Impressão com <span className="font-serif-italic text-accent">alma</span>, feita em Maputo.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Somos uma gráfica boutique que combina o rigor técnico das prensas modernas com o cuidado artesanal do trabalho manual.
        </p>
      </header>

      <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-card mb-16">
        <img src={heroImg} alt="Ateliê PrintPalette" className="w-full h-full object-cover" />
      </div>

      <div className="grid sm:grid-cols-2 gap-10 mb-16">
        <div>
          <h2 className="text-3xl mb-4">A nossa história</h2>
          <p className="text-muted-foreground leading-relaxed">
            Fundámos a PrintPalette com uma convicção simples: o objecto impresso ainda tem o poder de emocionar. Num
            mundo de pixels, escolhemos celebrar o papel, a tinta e o toque.
          </p>
        </div>
        <div>
          <h2 className="text-3xl mb-4">O que fazemos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Desenhamos e produzimos cartões, álbuns, t-shirts, brindes corporativos, banners e tudo o que possa ser
            impresso. Cada projecto é tratado como único — porque é mesmo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { icon: Heart, label: "Feito com cuidado", value: "100%" },
          { icon: Award, label: "Anos a imprimir", value: "8+" },
          { icon: Users, label: "Clientes felizes", value: "+800" },
          { icon: Sparkles, label: "Acabamentos", value: "20+" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-secondary/40 p-6 text-center">
            <Icon className="size-6 text-accent mx-auto" />
            <p className="mt-3 text-3xl font-serif">{value}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-gradient-ink text-background p-10 lg:p-14 text-center">
        <h3 className="text-3xl">Pronto para imprimir o seu próximo projecto?</h3>
        <p className="mt-3 text-background/70 max-w-xl mx-auto">
          Conte-nos a sua ideia. Respondemos em poucas horas com um orçamento personalizado.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <Link to="/encomenda-personalizada" className="px-7 py-3 rounded-full bg-accent text-accent-foreground font-semibold hover:scale-[1.02] transition-transform">
            Pedir orçamento
          </Link>
          <Link to="/contacto" className="px-7 py-3 rounded-full border border-background/20 text-background font-semibold hover:bg-background/10 transition-colors">
            Falar com o ateliê
          </Link>
        </div>
      </div>
    </div>
  );
}

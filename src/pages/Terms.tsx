export default function Terms() {
  return (
    <article className="container-px mx-auto max-w-3xl py-16 lg:py-24">
      <header className="mb-10">
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-accent">Política</span>
        <h1 className="mt-3 text-5xl">Termos & Condições</h1>
        <p className="mt-4 text-muted-foreground">Última actualização: {new Date().toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}</p>
      </header>
      <div className="space-y-6 text-foreground/85 leading-relaxed">
        <section>
          <h2 className="text-2xl mt-2 mb-3">1. Encomendas</h2>
          <p>Todas as encomendas estão sujeitas a confirmação. Após validação dos ficheiros e do pagamento, iniciamos a produção. Prazos de entrega estimados em dias úteis.</p>
        </section>
        <section>
          <h2 className="text-2xl mt-6 mb-3">2. Pagamento</h2>
          <p>Aceitamos M-Pesa, e-Mola, transferência bancária e pagamento na entrega (mediante confirmação prévia).</p>
        </section>
        <section>
          <h2 className="text-2xl mt-6 mb-3">3. Entregas</h2>
          <p>Entregas em Maputo e Matola: 24-48h úteis. Para outras localidades, contacte-nos para um orçamento de envio.</p>
        </section>
        <section>
          <h2 className="text-2xl mt-6 mb-3">4. Devoluções</h2>
          <p>Produtos personalizados não têm devolução, excepto em caso de defeito de produção. Contacte-nos em até 48h após a recepção.</p>
        </section>
        <section>
          <h2 className="text-2xl mt-6 mb-3">5. Direitos de autor</h2>
          <p>O cliente declara possuir os direitos sobre todo o conteúdo enviado para impressão. A PrintPalette declina responsabilidade por violações de direitos de terceiros.</p>
        </section>
      </div>
    </article>
  );
}

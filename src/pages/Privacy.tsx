export default function Privacy() {
  return (
    <article className="container-px mx-auto max-w-3xl py-16 lg:py-24 prose-pp">
      <header className="mb-10">
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-accent">Política</span>
        <h1 className="mt-3 text-5xl">Privacidade</h1>
        <p className="mt-4 text-muted-foreground">Última actualização: {new Date().toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}</p>
      </header>
      <div className="space-y-6 text-foreground/85 leading-relaxed">
        <section>
          <h2 className="text-2xl mt-2 mb-3">1. Recolha de dados</h2>
          <p>Recolhemos apenas os dados necessários para processar a sua encomenda: nome, contacto, morada e detalhes de pagamento. Os ficheiros que carrega para impressão personalizada são guardados de forma segura.</p>
        </section>
        <section>
          <h2 className="text-2xl mt-6 mb-3">2. Uso da informação</h2>
          <p>Os seus dados são usados exclusivamente para preparar e entregar a sua encomenda, comunicar consigo sobre o estado da mesma, e melhorar o serviço. Nunca partilhamos com terceiros para fins de marketing.</p>
        </section>
        <section>
          <h2 className="text-2xl mt-6 mb-3">3. Cookies e armazenamento local</h2>
          <p>Usamos armazenamento local do navegador para guardar o seu carrinho de compras e sessão de utilizador. Não usamos cookies de rastreamento.</p>
        </section>
        <section>
          <h2 className="text-2xl mt-6 mb-3">4. Os seus direitos</h2>
          <p>Pode pedir a qualquer momento o acesso, correcção ou eliminação dos seus dados pessoais escrevendo para <a className="text-accent underline-offset-2 hover:underline" href="mailto:ola@printpalette.mz">ola@printpalette.mz</a>.</p>
        </section>
      </div>
    </article>
  );
}

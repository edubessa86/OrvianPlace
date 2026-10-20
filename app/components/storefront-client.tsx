"use client";

import { useState } from "react";

const products = [
  { name: "Legging Sculpt", category: "Leggings", price: "R$ 149,90", tone: "look-one", tag: "PEÇA-CONCEITO" },
  { name: "Top Aura", category: "Tops", price: "R$ 89,90", tone: "look-two", tag: "PEÇA-CONCEITO" },
  { name: "Conjunto Flow", category: "Conjuntos", price: "R$ 219,90", tone: "look-three", tag: "PEÇA-CONCEITO" },
  { name: "Jaqueta Move", category: "Sobreposições", price: "R$ 189,90", tone: "look-four", tag: "PEÇA-CONCEITO" },
];

export default function StorefrontClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="orvian-store">
      <div className="store-announcement">A sua próxima versão começa aqui <span>✦</span> Estamos preparando nossa primeira coleção</div>
      <header className="store-header">
        <a className="store-logo" href="#" aria-label="Orvian início">ORVIAN<span>®</span><small>MODA FITNESS FEMININA</small></a>
        <button className="store-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">☰</button>
        <nav className={menuOpen ? "store-nav open" : "store-nav"}>
          <a href="#colecao" onClick={() => setMenuOpen(false)}>Coleção conceito</a>
          <a href="#essencia" onClick={() => setMenuOpen(false)}>Nossa essência</a>
          <a href="#novidades" onClick={() => setMenuOpen(false)}>Novidades</a>
        </nav>
        <a className="store-header-cta" href="#novidades">Entre para a lista <span>↗</span></a>
      </header>

      <section className="store-hero">
        <div className="store-hero-copy">
          <p className="store-eyebrow"><span /> MOVIMENTO • AUTENTICIDADE • VOCÊ</p>
          <h1>Vista sua<br /><em>melhor versão.</em></h1>
          <p className="store-hero-text">Moda fitness feminina para acompanhar seu ritmo, respeitar sua jornada e celebrar cada conquista — do seu jeito.</p>
          <a className="store-button" href="#colecao">Explore a coleção conceito <span>↘</span></a>
          <div className="store-hero-note"><span>✳</span> Feita para a vida real. Inspirada em você.</div>
        </div>
        <div className="store-hero-visual" role="img" aria-label="Imagem editorial de moda fitness feminina">
          <div className="store-hero-image" />
          <div className="store-hero-stamp">YOUR<br />OWN<br /><i>PACE.</i></div>
          <div className="store-hero-caption"><span>01 / 04</span><span>ESSENTIAL MOVEMENT</span></div>
        </div>
      </section>

      <section className="store-values" id="essencia">
        <div><span>01</span><strong>Seu ritmo, suas regras</strong><p>Peças para acompanhar cada etapa da sua jornada.</p></div>
        <div><span>02</span><strong>Conforto em movimento</strong><p>Funcionalidade e estilo em equilíbrio.</p></div>
        <div><span>03</span><strong>Autenticidade sempre</strong><p>Vista quem você é — e quem deseja ser.</p></div>
      </section>

      <section className="store-collection" id="colecao">
        <div className="store-section-heading"><div><p className="store-eyebrow">UMA PRÉVIA DO QUE VEM AÍ</p><h2>Movimente-se <em>com intenção.</em></h2></div><p>Uma seleção visual de conceitos que inspiram a primeira coleção Orvian.</p></div>
        <div className="store-demo-notice">PRÉ-LANÇAMENTO · Estes são produtos demonstrativos. Ainda não estão à venda.</div>
        <div className="store-product-grid">
          {products.map((product, i) => <article className="store-product" key={product.name}>
            <div className={"store-product-art " + product.tone}>
              <span className="store-product-index">0{i + 1}</span>
              <span className="store-product-tag">{product.tag}</span>
              <span className="store-product-symbol">O.</span>
            </div>
            <div className="store-product-info"><div><p>{product.category}</p><h3>{product.name}</h3></div><span className="store-product-price">{product.price}<small>preço ilustrativo</small></span></div>
            <button className="store-disabled-buy" disabled>Disponível em breve</button>
          </article>)}
        </div>
      </section>

      <section className="store-newsletter" id="novidades">
        <div><p className="store-eyebrow">SEJA A PRIMEIRA A SABER</p><h2>O próximo movimento<br /><em>começa com você.</em></h2><p>Estamos preparando tudo com cuidado. Acompanhe a Orvian para saber quando a coleção real chegar.</p><a className="store-button store-button-light" href="https://www.instagram.com/orvianoficial/" target="_blank" rel="noreferrer">Acompanhe no Instagram <span>↗</span></a></div>
        <div className="store-newsletter-mark">O<span>®</span></div>
      </section>

      <footer className="store-footer"><a className="store-logo" href="#">ORVIAN<span>®</span><small>VISTA SUA MELHOR VERSÃO</small></a><p>Moda fitness feminina, no seu ritmo.</p><div><a href="https://www.instagram.com/orvianoficial/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="#essencia">Nossa essência</a></div><small>© {new Date().getFullYear()} ORVIAN. Todos os direitos reservados. <a href="/painel">Acesso administrativo</a></small></footer>
    </main>
  );
}

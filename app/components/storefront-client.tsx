"use client";

import { useState } from "react";
import Link from "next/link";
import HomeTrends from "@/app/components/home-trends";
import { ArrowDownRight, ArrowUpRight, Menu, X, Instagram, Search, ShoppingBag, Heart, ArrowRight } from "lucide-react";

const products = [
  { name: "Legging Escultural", category: "Desempenho · Leggings", price: "R$ 149,90", image: "https://images.unsplash.com/photo-1506629905607-d9d4e1c5a1f3?auto=format&fit=crop&w=900&q=85", tag: "MAIS DESEJADA" },
  { name: "Top Aura", category: "Desempenho · Tops", price: "R$ 89,90", image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=900&q=85", tag: "ESSENCIAL" },
  { name: "Conjunto Fluidez", category: "Conjuntos", price: "R$ 219,90", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85", tag: "PEÇA-CONCEITO 03" },
  { name: "Jaqueta Movimento", category: "Sobreposições", price: "R$ 189,90", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85", tag: "PEÇA-CONCEITO 04" },
];

export default function StorefrontClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [bag, setBag] = useState(0);
  const [toast, setToast] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  return (
    <main className="orvian-store editorial-store">
      <div className="editorial-announcement"><span>ORVIAN</span><span>Moda fitness feminina, no seu ritmo.</span><span>COLEÇÃO CONCEITO — 001</span></div>
      <header className="editorial-header">
        <button className="editorial-icon mobile-menu-button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? "editorial-nav is-open" : "editorial-nav"}>
          <Link href="/colecoes" onClick={() => setMenuOpen(false)}>Coleções</Link>
          <Link href="/novidades" onClick={() => setMenuOpen(false)}>Novidades</Link>
          <Link href="/essencia" onClick={() => setMenuOpen(false)}>Nossa essência</Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link href="/contato" onClick={() => setMenuOpen(false)}>Contato</Link>
        </nav>
        <a className="editorial-wordmark" href="#" aria-label="ORVIAN início">ORVIAN<span>®</span><small>ATIVA / TODOS OS DIAS</small></a>
        <div className="editorial-actions">
          <button className="editorial-icon search-trigger" aria-label="Pesquisar" onClick={() => setSearchOpen(!searchOpen)}><Search /></button>
          <button className="editorial-icon bag-trigger" aria-label="Sacola demonstrativa" onClick={() => notify("A sacola será ativada quando a loja estiver pronta.")}><ShoppingBag /><span>{bag}</span></button>
        </div>
      </header>
      {searchOpen && <div className="editorial-search"><Search size={17}/><input autoFocus placeholder="O que você procura?" aria-label="Pesquisar produtos"/><button onClick={() => setSearchOpen(false)} aria-label="Fechar pesquisa"><X size={18}/></button></div>}
      <section className="editorial-hero">
        <div className="editorial-hero-copy">
          <p className="editorial-overline"><span>01</span> VISTA SUA MELHOR VERSÃO</p>
          <h1>Vista-se<br/><em>com</em> propósito<span className="hero-period">.</span></h1>
          <div className="editorial-hero-bottom"><p>Uma nova perspectiva sobre o vestir. Peças que acompanham o seu movimento e revelam a sua presença — dentro e fora do treino.</p><Link href="/colecoes" className="editorial-round-link" aria-label="Explorar coleção"><ArrowDownRight /></Link></div>
        </div>
        <div className="editorial-hero-image">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=90" alt="Atmosfera de treino e movimento" />
          <div className="editorial-image-number">O / 001</div><div className="editorial-image-caption">A ARTE DO MOVIMENTO — ORVIAN</div>
        </div>
        <div className="editorial-hero-vertical">FEITA PARA A SUA ROTINA</div>
      </section>
      <div className="editorial-marquee"><div>MOVIMENTO COM INTENÇÃO <i>✳</i> NO SEU RITMO <i>✳</i> ORVIAN <i>✳</i> MOVIMENTO COM INTENÇÃO <i>✳</i> NO SEU RITMO <i>✳</i></div></div>

      <section className="editorial-manifesto" id="essencia">
        <div className="editorial-section-index">02 / NOSSA ESSÊNCIA</div>
        <div className="editorial-manifesto-main"><p className="editorial-small-label">NÃO É SOBRE SER OUTRA PESSOA.</p><h2>É sobre vestir<br/>quem você <em>é.</em></h2><div className="editorial-manifesto-foot"><p>Acreditamos na força dos detalhes, na liberdade de movimento e na confiança que nasce quando você se sente bem na própria pele.</p><span>ORVIAN — VISTA SUA MELHOR VERSÃO</span></div></div>
        <div className="editorial-manifesto-photo"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85" alt="Editorial de moda contemporânea"/><span>FIGURA 01 — ESTUDO DO MOVIMENTO</span></div>
      </section>

      <section className="editorial-collections" id="colecao">
        <div className="editorial-section-heading"><div><p className="editorial-small-label">03 / DESCUBRA O UNIVERSO ORVIAN</p><h2>Feita para<br/><em>acompanhar você.</em></h2></div><p>Forma, função e atitude. Descubra as linhas que inspiram nosso olhar para a moda fitness feminina.</p></div>
        <div className="editorial-collection-grid">
          <Link className="editorial-collection-card collection-large" href="/colecoes"><img src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1300&q=85" alt="Mulher em movimento"/><span className="collection-count">COLEÇÃO / 01</span><div><span>DESEMPENHO</span><strong>Em movimento</strong><i><ArrowUpRight/></i></div></Link>
          <Link className="editorial-collection-card collection-small" href="/colecoes"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=85" alt="Moda feminina contemporânea"/><span className="collection-count">COLEÇÃO / 02</span><div><span>PARA TODOS OS DIAS</span><strong>Além do treino</strong><i><ArrowUpRight/></i></div></Link>
        </div>
      </section>

      <section className="editorial-products" id="novidades">
        <div className="editorial-section-heading"><div><p className="editorial-small-label">04 / SELEÇÃO CONCEITO</p><h2>Essenciais<br/><em>para você.</em></h2></div><div className="editorial-products-note"><span>PRÉ-LANÇAMENTO</span><p>Uma visão do que vem por aí. Produtos e valores ilustrativos nesta prévia visual.</p></div></div>
        <div className="editorial-product-grid">{products.map((product, index) => <article className="editorial-product" key={product.name}><div className="editorial-product-image"><img src={product.image} alt={product.name} loading="lazy"/><span className="editorial-product-tag">{product.tag}</span><button className={saved.includes(product.name) ? "editorial-favorite is-saved" : "editorial-favorite"} aria-label={saved.includes(product.name) ? "Remover dos favoritos" : "Salvar favorito"} onClick={() => setSaved(saved.includes(product.name) ? saved.filter(item => item !== product.name) : [...saved, product.name])}><Heart fill={saved.includes(product.name) ? "currentColor" : "none"}/></button><button className="editorial-add" onClick={() => notify("Prévia conceitual: " + product.name + " ainda não está à venda.")}>DESCOBRIR PEÇA <ArrowUpRight size={15}/></button><span className="editorial-product-index">0{index + 1}</span></div><div className="editorial-product-details"><div><p>{product.category}</p><h3>{product.name}</h3></div><span>{product.price}<small>valor ilustrativo</small></span></div></article>)}</div>
        <p className="editorial-demo-disclaimer">ESTA É UMA PRÉVIA DE DESIGN. PRODUTOS, IMAGENS E PREÇOS NÃO REPRESENTAM OFERTAS DISPONÍVEIS.</p>
      </section>

      <HomeTrends />

      <section className="editorial-campaign"><img src="https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=2000&q=85" alt="Campanha visual de movimento" loading="lazy"/><div className="editorial-campaign-overlay"></div><div className="editorial-campaign-copy"><p className="editorial-small-label">05 / O SEU MOVIMENTO, A SUA HISTÓRIA</p><h2>Viva<br/>no seu <em>ritmo.</em></h2><Link href="/novidades" className="editorial-text-link">Descubra a seleção <ArrowUpRight size={17}/></Link></div><span className="editorial-campaign-side">ORVIAN — 2026</span></section>

      <section className="editorial-newsletter"><div><p className="editorial-small-label">NOTAS DO UNIVERSO ORVIAN</p><h2>Faça parte<br/>desse <em>movimento.</em></h2></div><div className="editorial-newsletter-right"><p>Novas ideias, inspirações e novidades da marca. Acompanhe nossa jornada e seja uma das primeiras a conhecer a coleção.</p><a href="https://www.instagram.com/_useorvian/" target="_blank" rel="noreferrer" className="editorial-text-link">Siga @_useorvian <Instagram size={16}/></a></div><span className="editorial-newsletter-mark">O.</span></section>

      <footer className="editorial-footer"><div className="editorial-footer-top"><div><Link className="editorial-footer-wordmark" href="/">ORVIAN<span>®</span></Link><p>Moda fitness feminina,<br/>no seu ritmo.</p></div><div><span className="editorial-footer-label">NAVEGUE</span><Link href="/colecoes">Coleções</Link><Link href="/novidades">Novidades</Link><Link href="/essencia">Nossa essência</Link><Link href="/blog">Blog / Inspiração</Link></div><div><span className="editorial-footer-label">ATENDIMENTO</span><Link href="/contato">Fale conosco</Link><Link href="/entrega">Entrega</Link><Link href="/devolucao">Trocas e devoluções</Link><Link href="/perguntas-frequentes">Perguntas frequentes</Link></div><div><span className="editorial-footer-label">NOSSAS REDES</span><a href="mailto:useorvian@gmail.com">E-mail</a><a href="https://www.instagram.com/_useorvian/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.facebook.com/OrvianOficial" target="_blank" rel="noreferrer">Facebook ↗</a><a href="https://www.youtube.com/@UseOrvian" target="_blank" rel="noreferrer">YouTube ↗</a></div><div className="editorial-footer-note"><span>VISTA SUA MELHOR VERSÃO.</span><p>Feita para a vida real.<br/>Inspirada em você.</p></div></div><div className="editorial-footer-bottom"><span>© {new Date().getFullYear()} ORVIAN</span><span>MODA FITNESS FEMININA / VISTA SUA MELHOR VERSÃO</span><Link href="/painel">ACESSO ADMINISTRATIVO ↗</Link></div></footer>
      {toast && <div className="editorial-toast" role="status">{toast}</div>}
    </main>
  );
}

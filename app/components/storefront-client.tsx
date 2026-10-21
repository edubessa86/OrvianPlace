"use client";

import { useState } from "react";
import Link from "next/link";
import HomeTrends from "@/app/components/home-trends";
import { ArrowDownRight, ArrowUpRight, Menu, X, Instagram, Search, ShoppingBag, Heart, ArrowRight } from "lucide-react";

const products = [
  { name: "Legging Sculpt", category: "Performance · Leggings", price: "R$ 149,90", image: "https://images.unsplash.com/photo-1506629905607-d9d4e1c5a1f3?auto=format&fit=crop&w=900&q=85", tag: "MAIS DESEJADO" },
  { name: "Top Aura", category: "Performance · Tops", price: "R$ 89,90", image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=900&q=85", tag: "ESSENCIAL" },
  { name: "Conjunto Flow", category: "Sets · Conjuntos", price: "R$ 219,90", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85", tag: "CONCEITO 03" },
  { name: "Jaqueta Move", category: "Layers · Sobreposições", price: "R$ 189,90", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85", tag: "CONCEITO 04" },
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
      <div className="editorial-announcement"><span>ORVIAN STUDIO</span><span>Moda fitness feminina, no seu ritmo.</span><span>COLEÇÃO CONCEITO — 001</span></div>
      <header className="editorial-header">
        <button className="editorial-icon mobile-menu-button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? "editorial-nav is-open" : "editorial-nav"}>
          <a href="#colecao" onClick={() => setMenuOpen(false)}>Coleção</a>
          <a href="#novidades" onClick={() => setMenuOpen(false)}>Novidades</a>
          <Link href="/nossa-historia" onClick={() => setMenuOpen(false)}>Nossa história</Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link href="/contato" onClick={() => setMenuOpen(false)}>Contato</Link>
        </nav>
        <a className="editorial-wordmark" href="#" aria-label="ORVIAN início">ORVIAN<span>®</span><small>ACTIVE / EVERYDAY</small></a>
        <div className="editorial-actions">
          <button className="editorial-icon search-trigger" aria-label="Pesquisar" onClick={() => setSearchOpen(!searchOpen)}><Search /></button>
          <button className="editorial-icon bag-trigger" aria-label="Sacola demonstrativa" onClick={() => notify("A sacola será ativada quando a loja estiver pronta.")}><ShoppingBag /><span>{bag}</span></button>
        </div>
      </header>
      {searchOpen && <div className="editorial-search"><Search size={17}/><input autoFocus placeholder="O que você procura?" aria-label="Pesquisar produtos"/><button onClick={() => setSearchOpen(false)} aria-label="Fechar pesquisa"><X size={18}/></button></div>}
      <section className="editorial-hero">
        <div className="editorial-hero-copy">
          <p className="editorial-overline"><span>01</span> VISTA SUA MELHOR VERSÃO</p>
          <h1>Move<br/><em>with</em> purpose<span className="hero-period">.</span></h1>
          <div className="editorial-hero-bottom"><p>Uma nova perspectiva sobre o vestir. Peças que acompanham o seu movimento e revelam a sua presença — dentro e fora do treino.</p><a href="#colecao" className="editorial-round-link" aria-label="Explorar coleção"><ArrowDownRight /></a></div>
        </div>
        <div className="editorial-hero-image">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=90" alt="Atmosfera de treino e movimento" />
          <div className="editorial-image-number">O / 001</div><div className="editorial-image-caption">THE ART OF MOVEMENT — ORVIAN STUDIO</div>
        </div>
        <div className="editorial-hero-vertical">EST. FOR YOUR EVERYDAY MOVEMENT</div>
      </section>
      <div className="editorial-marquee"><div>MOVE WITH INTENTION <i>✳</i> OWN YOUR PACE <i>✳</i> ORVIAN STUDIO <i>✳</i> MOVE WITH INTENTION <i>✳</i> OWN YOUR PACE <i>✳</i></div></div>

      <section className="editorial-manifesto" id="essencia">
        <div className="editorial-section-index">02 / NOSSA ESSÊNCIA</div>
        <div className="editorial-manifesto-main"><p className="editorial-small-label">NÃO É SOBRE SER OUTRA PESSOA.</p><h2>É sobre vestir<br/>quem você <em>é.</em></h2><div className="editorial-manifesto-foot"><p>Acreditamos na força dos detalhes, na liberdade de movimento e na confiança que nasce quando você se sente bem na própria pele.</p><span>ORVIAN — VISTA SUA MELHOR VERSÃO</span></div></div>
        <div className="editorial-manifesto-photo"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85" alt="Editorial de moda contemporânea"/><span>FIG. 01 — MOVEMENT STUDY</span></div>
      </section>

      <section className="editorial-collections" id="colecao">
        <div className="editorial-section-heading"><div><p className="editorial-small-label">03 / EXPLORE O UNIVERSO ORVIAN</p><h2>Designed to<br/><em>move you.</em></h2></div><p>Forma, função e atitude. Descubra as linhas que inspiram nosso olhar para a moda fitness feminina.</p></div>
        <div className="editorial-collection-grid">
          <a className="editorial-collection-card collection-large" href="#novidades"><img src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1300&q=85" alt="Mulher em movimento"/><span className="collection-count">COLLECTION / 01</span><div><span>PERFORMANCE</span><strong>In motion</strong><i><ArrowUpRight/></i></div></a>
          <a className="editorial-collection-card collection-small" href="#novidades"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=85" alt="Moda feminina contemporânea"/><span className="collection-count">COLLECTION / 02</span><div><span>EVERYDAY</span><strong>Beyond the gym</strong><i><ArrowUpRight/></i></div></a>
        </div>
      </section>

      <section className="editorial-products" id="novidades">
        <div className="editorial-section-heading"><div><p className="editorial-small-label">04 / SELEÇÃO CONCEITO</p><h2>Considered<br/><em>essentials.</em></h2></div><div className="editorial-products-note"><span>PRÉ-LANÇAMENTO</span><p>Uma visão do que vem por aí. Produtos e valores ilustrativos nesta prévia visual.</p></div></div>
        <div className="editorial-product-grid">{products.map((product, index) => <article className="editorial-product" key={product.name}><div className="editorial-product-image"><img src={product.image} alt={product.name} loading="lazy"/><span className="editorial-product-tag">{product.tag}</span><button className={saved.includes(product.name) ? "editorial-favorite is-saved" : "editorial-favorite"} aria-label={saved.includes(product.name) ? "Remover dos favoritos" : "Salvar favorito"} onClick={() => setSaved(saved.includes(product.name) ? saved.filter(item => item !== product.name) : [...saved, product.name])}><Heart fill={saved.includes(product.name) ? "currentColor" : "none"}/></button><button className="editorial-add" onClick={() => notify("Prévia conceitual: " + product.name + " ainda não está à venda.")}>DESCOBRIR PEÇA <ArrowUpRight size={15}/></button><span className="editorial-product-index">0{index + 1}</span></div><div className="editorial-product-details"><div><p>{product.category}</p><h3>{product.name}</h3></div><span>{product.price}<small>valor ilustrativo</small></span></div></article>)}</div>
        <p className="editorial-demo-disclaimer">ESTA É UMA PRÉVIA DE DESIGN. PRODUTOS, IMAGENS E PREÇOS NÃO REPRESENTAM OFERTAS DISPONÍVEIS.</p>
      </section>

      <HomeTrends />

      <section className="editorial-campaign"><img src="https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=2000&q=85" alt="Campanha visual de movimento" loading="lazy"/><div className="editorial-campaign-overlay"></div><div className="editorial-campaign-copy"><p className="editorial-small-label">05 / O SEU MOVIMENTO, A SUA HISTÓRIA</p><h2>Own<br/>your <em>pace.</em></h2><a href="#novidades" className="editorial-text-link">Explore a seleção <ArrowUpRight size={17}/></a></div><span className="editorial-campaign-side">ORVIAN STUDIO — 2026</span></section>

      <section className="editorial-newsletter"><div><p className="editorial-small-label">NOTAS DO UNIVERSO ORVIAN</p><h2>Be part<br/>of the <em>movement.</em></h2></div><div className="editorial-newsletter-right"><p>Novas ideias, inspirações e novidades da marca. Acompanhe nossa jornada e seja uma das primeiras a conhecer a coleção.</p><a href="https://www.instagram.com/_useorvian/" target="_blank" rel="noreferrer" className="editorial-text-link">Siga @_useorvian <Instagram size={16}/></a></div><span className="editorial-newsletter-mark">O.</span></section>

      <footer className="editorial-footer"><div className="editorial-footer-top"><div><Link className="editorial-footer-wordmark" href="/">ORVIAN<span>®</span></Link><p>Moda fitness feminina,<br/>no seu ritmo.</p></div><div><span className="editorial-footer-label">EXPLORE</span><a href="#colecao">Coleções</a><a href="#novidades">Novidades</a><Link href="/nossa-historia">Nossa história</Link><Link href="/blog">Blog / Orvian Trends</Link></div><div><span className="editorial-footer-label">ATENDIMENTO</span><Link href="/contato">Contato</Link><Link href="/entrega">Entrega</Link><Link href="/devolucao">Trocas e devoluções</Link><Link href="/perguntas-frequentes">Perguntas frequentes</Link></div><div><span className="editorial-footer-label">REDES SOCIAIS</span><a href="mailto:useorvian@gmail.com">E-mail</a><a href="https://www.instagram.com/_useorvian/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.facebook.com/OrvianOficial" target="_blank" rel="noreferrer">Facebook ↗</a><a href="https://www.youtube.com/@UseOrvian" target="_blank" rel="noreferrer">YouTube ↗</a></div><div className="editorial-footer-note"><span>VISTA SUA MELHOR VERSÃO.</span><p>Feita para a vida real.<br/>Inspirada em você.</p></div></div><div className="editorial-footer-bottom"><span>© {new Date().getFullYear()} ORVIAN STUDIO</span><span>PRÉVIA VISUAL — NÃO PUBLICADA</span><Link href="/painel">ACESSO ADMINISTRATIVO ↗</Link></div></footer>
      {toast && <div className="editorial-toast" role="status">{toast}</div>}
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity, ArrowDownRight, ArrowUpRight, Boxes, ChartNoAxesCombined,
  ChevronDown, CircleHelp, CloudUpload, ExternalLink, Filter, LayoutDashboard,
  PackageSearch, Plus, Search, Settings2, ShieldCheck, ShoppingBag, Store,
  Tags, TrendingUp, Truck, Wallet, X, LogOut
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  supplier: string;
  category: string;
  cost: number;
  sale: number;
  margin: number;
  status: "Análise" | "Pronto para revisar" | "Atenção";
};

type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  cost_price: number | string;
  suggested_price: number | string;
  suppliers: { name: string } | { name: string }[] | null;
};

const mapProduct = (row: ProductRow): Product => {
  const cost = Number(row.cost_price) || 0;
  const sale = Number(row.suggested_price) || 0;
  const relation = Array.isArray(row.suppliers) ? row.suppliers[0] : row.suppliers;
  return {
    id: row.id,
    name: row.name,
    supplier: relation?.name ?? "Sem fornecedor vinculado",
    category: row.category ?? "Outros",
    cost,
    sale,
    margin: sale > 0 ? ((sale - cost) / sale) * 100 : 0,
    status: "Análise",
  };
};

const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Home() {
  const [active, setActive] = useState("Visão geral");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", supplier: "", category: "Leggings", cost: "", sale: "" });

  const loadProducts = async () => {
    setLoadingProducts(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id,name,category,cost_price,suggested_price,suppliers(name)")
      .order("created_at", { ascending: false });
    if (error) {
      setNotice("Não foi possível carregar o catálogo do banco: " + error.message);
      setProducts([]);
    } else {
      setProducts(((data ?? []) as unknown as ProductRow[]).map(mapProduct));
    }
    setLoadingProducts(false);
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const filtered = products.filter(p => [p.name, p.supplier, p.category].join(" ").toLowerCase().includes(query.toLowerCase()));

  const addProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cost = Number(form.cost), sale = Number(form.sale);
    if (!form.name.trim() || !Number.isFinite(cost) || !Number.isFinite(sale) || cost <= 0 || sale <= 0) {
      setNotice("Informe nome, custo e preço de venda válidos.");
      return;
    }

    setSavingProduct(true);
    const supabase = createClient();
    let supplierId: string | null = null;
    const supplierName = form.supplier.trim();

    if (supplierName) {
      const { data: existingSupplier, error: supplierLookupError } = await supabase
        .from("suppliers")
        .select("id")
        .ilike("name", supplierName)
        .maybeSingle();

      if (supplierLookupError) {
        setNotice("Não foi possível consultar o fornecedor: " + supplierLookupError.message);
        setSavingProduct(false);
        return;
      }

      if (existingSupplier) {
        supplierId = existingSupplier.id;
      } else {
        const { data: newSupplier, error: supplierInsertError } = await supabase
          .from("suppliers")
          .insert({ name: supplierName })
          .select("id")
          .single();

        if (supplierInsertError || !newSupplier) {
          setNotice("Não foi possível cadastrar o fornecedor: " + (supplierInsertError?.message ?? "resposta vazia"));
          setSavingProduct(false);
          return;
        }
        supplierId = newSupplier.id;
      }
    }

    const { error: productError } = await supabase.from("products").insert({
      name: form.name.trim(),
      supplier_id: supplierId,
      category: form.category,
      cost_price: cost,
      suggested_price: sale,
    });

    if (productError) {
      setNotice("Não foi possível salvar o produto: " + productError.message);
      setSavingProduct(false);
      return;
    }

    setForm({ name: "", supplier: "", category: "Leggings", cost: "", sale: "" });
    setShowAdd(false);
    setActive("Catálogo");
    setNotice("Produto salvo no banco de dados.");
    setSavingProduct(false);
    await loadProducts();
  };

  const nav = [
    { title: "WORKSPACE", items: [{ name: "Visão geral", icon: LayoutDashboard }, { name: "Garimpo de produtos", icon: PackageSearch }, { name: "Catálogo", icon: Boxes }, { name: "Fornecedores", icon: Truck }] },
    { title: "INTELIGÊNCIA", items: [{ name: "Precificação", icon: Tags }, { name: "Canais de venda", icon: Store }, { name: "Análises", icon: ChartNoAxesCombined }] }
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup"><div className="brand-mark">O</div><div><strong>ORVIAN<span>PLACE</span></strong><small>COMMERCE INTELLIGENCE</small></div></div>
        <div className="workspace-label">ESPAÇO DE TRABALHO</div>
        <button className="store-switch"><div className="store-avatar">O</div><div className="store-copy"><strong>Orvian Store</strong><small>Moda fitness feminina</small></div><ChevronDown size={16} /></button>
        <nav>
          {nav.map(group => <div className="nav-group" key={group.title}><p>{group.title}</p>{group.items.map(item => <button key={item.name} onClick={() => setActive(item.name)} className={active === item.name ? "nav-item selected" : "nav-item"}><item.icon size={18} strokeWidth={1.8} /><span>{item.name}</span>{item.name === "Garimpo de produtos" && <span className="nav-new">MVP</span>}</button>)}</div>)}
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>Primeiros passos</strong><p>Organize fornecedores e descubra produtos com potencial de margem.</p><button onClick={() => setNotice("Comece cadastrando fornecedores e importando um catálogo CSV/XLSX.")}>Ver guia <ExternalLink size={13}/></button></div><button className="nav-item" onClick={() => setActive("Configurações")}><Settings2 size={18}/><span>Configurações</span></button><div className="profile-row"><div className="profile-avatar">A</div><div><strong>Administrador</strong><small>Ambiente inicial</small></div><ShieldCheck size={16} className="profile-shield"/></div></div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div className="breadcrumbs">OrvianPlace <span>/</span> <strong>{active}</strong></div><div className="top-actions"><span className="env-pill"><span/> AMBIENTE DE DESENVOLVIMENTO</span><button className="icon-button" aria-label="Ajuda" onClick={() => setNotice("Este é o primeiro protótipo. Login seguro e banco de dados ainda serão conectados.")}><CircleHelp size={18}/></button><form action="/auth/signout" method="post"><button className="signout-button" type="submit"><LogOut size={15}/> Sair</button></form><div className="top-avatar">A</div></div></header>
        <div className="content">
          {notice && <div className="notice"><Activity size={17}/><span>{notice}</span><button aria-label="Fechar aviso" onClick={() => setNotice("")}><X size={16}/></button></div>}
          <div className="page-heading"><div><div className="eyebrow">TERÇA-FEIRA · CENTRAL DE OPERAÇÕES</div><h1>{active === "Visão geral" ? "Sua operação, em um só lugar." : active}</h1><p>Encontre oportunidades, organize seu catálogo e acompanhe a rentabilidade da ORVIAN.</p></div><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17}/> Adicionar produto</button></div>

          <section className="welcome-banner"><div className="banner-content"><div className="banner-tag"><TrendingUp size={14}/> ORVIAN COMMERCE INTELLIGENCE</div><h2>Boas escolhas começam<br/>com dados melhores.</h2><p>Seu centro de inteligência para garimpar moda fitness, comparar fornecedores nacionais e tomar decisões com margem em mente.</p><button onClick={() => { setActive("Garimpo de produtos"); setNotice("O próximo módulo será o garimpo com importação de catálogos de fornecedores."); }}>Explorar garimpo <span>↗</span></button></div><div className="banner-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-core"><ShoppingBag size={42} strokeWidth={1.2}/></div><div className="float-card float-card-one"><span className="float-icon"><Wallet size={16}/></span><div><small>MARGEM POTENCIAL</small><strong>+32,8%</strong></div><ArrowUpRight size={17}/></div><div className="float-card float-card-two"><span className="float-icon"><Boxes size={16}/></span><div><small>CATÁLOGO</small><strong>Novas oportunidades</strong></div></div><div className="art-dot dot-one"/><div className="art-dot dot-two"/></div></section>

          <div className="section-title"><div><h2>Visão da operação</h2><p>Indicadores calculados a partir dos produtos cadastrados no banco.</p></div><button className="filter-button" onClick={() => setNotice("Os indicadores serão calculados com os dados reais após conectar o banco.")}><Filter size={15}/> Este mês</button></div>
          <section className="metrics-grid">
            <Metric icon={<PackageSearch size={18}/>} label="Produtos no catálogo" value={String(products.length).padStart(2,"0")} foot={loadingProducts ? "Carregando banco..." : "Produtos cadastrados"} trend="Catálogo" />
            <Metric icon={<Wallet size={18}/>} label="Margem média estimada" value={products.length ? (products.reduce((sum,p)=>sum+p.margin,0)/products.length).toFixed(1).replace(".",",")+"%" : "—"} foot="Cálculo simplificado" trend="Estimativa" />
            <Metric icon={<Truck size={18}/>} label="Fornecedores ativos" value="00" foot="Nenhum cadastrado" trend="A configurar" />
            <Metric icon={<ChartNoAxesCombined size={18}/>} label="Oportunidades analisadas" value={String(products.length).padStart(2,"0")} foot="Produtos cadastrados" trend="Catálogo" />
          </section>

          <section className="catalog-panel"><div className="panel-heading"><div><h2>Produtos em análise</h2><p>Uma prévia do catálogo inteligente da sua loja.</p></div><button className="text-button" onClick={() => setActive("Catálogo")}>Ver catálogo <span>→</span></button></div><div className="table-toolbar"><label className="search-field"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar produto ou fornecedor..."/></label><button className="filter-button" onClick={() => setNotice("Filtros avançados serão incluídos no módulo de catálogo.")}><Filter size={15}/> Filtrar</button></div><div className="table-wrap">{loadingProducts ? <div className="empty-state">Carregando catálogo...</div> : <table><thead><tr><th>PRODUTO</th><th>FORNECEDOR</th><th>CUSTO</th><th>PREÇO SUGERIDO</th><th>MARGEM ESTIMADA</th><th>STATUS</th></tr></thead><tbody>{filtered.map((p,i)=><tr key={p.name+"-"+i}><td><div className="product-cell"><div className="product-thumb"><ShoppingBag size={18}/></div><div><strong>{p.name}</strong><small>{p.category}</small></div></div></td><td className="muted-cell">{p.supplier}</td><td>{money(p.cost)}</td><td className="price-cell">{money(p.sale)}</td><td><div className="margin-cell"><div className="margin-track"><span style={{width: Math.max(0,Math.min(100,p.margin))+"%"}}/></div><strong>{p.margin.toFixed(1).replace(".",",")}%</strong></div></td><td><span className={"status status-"+(p.status==="Análise"?"analysis":p.status==="Atenção"?"attention":"review")}>{p.status}</span></td></tr>)}</tbody></table>}{!loadingProducts && filtered.length===0&&<div className="empty-state">Nenhum produto cadastrado ainda. Clique em “Adicionar produto” para começar.</div>}</div><div className="panel-footer"><span>Exibindo {filtered.length} de {products.length} produtos cadastrados</span><span className="footer-note"><ShieldCheck size={14}/> Publicação automática desativada</span></div></section>

          <section className="next-steps"><div className="next-icon"><CloudUpload size={20}/></div><div><strong>Próxima etapa: seu catálogo real</strong><p>O catálogo já consulta o banco de dados. A próxima etapa é gerenciar fornecedores e importar arquivos CSV/XLSX.</p></div><button onClick={() => setNotice("Planejamento: autenticação admin → banco de dados → cadastro de fornecedores → importação CSV/XLSX.")}>Acompanhar etapas <ArrowDownRight size={15}/></button></section>
          <footer className="app-footer"><span>ORVIANPLACE <span className="footer-dot">•</span> VERSÃO 0.1.0</span><span>Feito para decisões melhores.</span></footer>
        </div>
      </section>

      {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><section className="modal" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><div className="eyebrow">CATÁLOGO ORVIAN</div><h2>Adicionar produto</h2><p>Cadastre um item para análise inicial.</p></div><button className="icon-button" onClick={() => setShowAdd(false)} aria-label="Fechar"><X size={18}/></button></div><form onSubmit={addProduct}><label>Nome do produto<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex.: Legging sem costura"/></label><label>Fornecedor<input value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} placeholder="Nome do fornecedor (opcional)"/></label><label>Categoria<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Leggings</option><option>Tops</option><option>Conjuntos</option><option>Shorts</option><option>Macacões</option><option>Outros</option></select></label><div className="form-row"><label>Custo do fornecedor (R$)<input required type="number" min="0.01" step="0.01" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} placeholder="0,00"/></label><label>Preço de venda (R$)<input required type="number" min="0.01" step="0.01" value={form.sale} onChange={e=>setForm({...form,sale:e.target.value})} placeholder="0,00"/></label></div><div className="modal-note">A margem exibida é uma estimativa simples (preço − custo) ÷ preço. Taxas, frete, impostos e comissões ainda não estão incluídos.</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={savingProduct}><Plus size={16}/> {savingProduct ? "Salvando..." : "Adicionar"}</button></div></form></section></div>}
    </main>
  );
}

function Metric({ icon, label, value, foot, trend }: { icon: React.ReactNode; label: string; value: string; foot: string; trend: string }) {
  return <article className="metric-card"><div className="metric-top"><div className="metric-icon">{icon}</div><span className="metric-trend">{trend}</span></div><p>{label}</p><strong className="metric-value">{value}</strong><small>{foot}</small></article>;
}
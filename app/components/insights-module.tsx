"use client";

import { useEffect, useState } from "react";
import { ChartNoAxesCombined, Download, PackageSearch, Truck, TrendingUp, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Product = { id: string; name: string; category: string; brand: string | null; cost_price: number | string; suggested_price: number | string; supplier_id: string | null; availability_status: string; created_at: string };
type Supplier = { id: string; name: string; active: boolean };
const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function InsightsModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const load = async () => {
      const db = createClient();
      const [p,s] = await Promise.all([
        db.from("products").select("id,name,category,brand,cost_price,suggested_price,supplier_id,availability_status,created_at"),
        db.from("suppliers").select("id,name,active")
      ]);
      if (p.error) setMessage("Erro ao carregar análise de produtos: " + p.error.message); else setProducts((p.data || []) as Product[]);
      if (s.error) setMessage("Erro ao carregar fornecedores: " + s.error.message); else setSuppliers((s.data || []) as Supplier[]);
      setLoading(false);
    };
    void load();
  }, []);
  const enriched = products.map(p => {
    const cost = Number(p.cost_price) || 0, price = Number(p.suggested_price) || 0;
    const profit = price - cost;
    return { ...p, cost, price, profit, margin: price > 0 ? profit / price * 100 : 0 };
  });
  const totalCost = enriched.reduce((sum,p) => sum + p.cost, 0);
  const totalSuggested = enriched.reduce((sum,p) => sum + p.price, 0);
  const avgMargin = enriched.length ? enriched.reduce((sum,p) => sum + p.margin, 0) / enriched.length : 0;
  const top = [...enriched].sort((a,b) => b.margin - a.margin).slice(0,8);
  const byCategory = Object.entries(enriched.reduce<Record<string,number>>((acc,p) => { const key=p.category || "Outros"; acc[key]=(acc[key]||0)+1; return acc; },{})).sort((a,b)=>b[1]-a[1]);
  const exportCsv = () => {
    const header = ["nome","categoria","marca","custo","preco_sugerido","lucro_bruto_estimado","margem_bruta_percentual","status"];
    const lines = enriched.map(p => [p.name,p.category,p.brand || "",p.cost.toFixed(2),p.price.toFixed(2),p.profit.toFixed(2),p.margin.toFixed(2),p.availability_status].map(v => '"' + String(v).replace(/"/g,'""') + '"').join(";"));
    const blob = new Blob(["\ufeff" + [header.join(";"),...lines].join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="orvianplace-analise-catalogo.csv"; a.click(); URL.revokeObjectURL(url);
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), products: enriched, suppliers }, null, 2)], { type: "application/json" });
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="orvianplace-backup-catalogo.json"; a.click(); URL.revokeObjectURL(url);
  };
  return <section>
    <div className="page-heading"><div><div className="eyebrow">INDICADORES DO CATÁLOGO</div><h1>Análises e oportunidades</h1><p>Visão calculada a partir dos dados persistidos, sem projeções fictícias.</p></div><div className="export-actions"><button className="secondary-button" onClick={exportCsv}><Download size={14}/> Exportar CSV</button><button className="primary-button" onClick={exportJson}><Download size={14}/> Backup JSON</button></div></div>
    {message && <div className="notice"><span>{message}</span></div>}
    {loading ? <div className="empty-state">Calculando indicadores...</div> : <>
      <div className="metrics-grid">
        <div className="metric-card"><div className="metric-top"><span className="metric-icon"><PackageSearch size={18}/></span></div><p>Produtos cadastrados</p><strong className="metric-value">{products.length}</strong><small>Catálogo completo</small></div>
        <div className="metric-card"><div className="metric-top"><span className="metric-icon"><Wallet size={18}/></span></div><p>Margem bruta média</p><strong className="metric-value">{avgMargin.toFixed(1).replace(".",",")}%</strong><small>Antes de taxas e impostos</small></div>
        <div className="metric-card"><div className="metric-top"><span className="metric-icon"><TrendingUp size={18}/></span></div><p>Lucro bruto potencial</p><strong className="metric-value">{money(totalSuggested-totalCost)}</strong><small>Uma unidade por produto, sem custos de canal</small></div>
        <div className="metric-card"><div className="metric-top"><span className="metric-icon"><Truck size={18}/></span></div><p>Fornecedores ativos</p><strong className="metric-value">{suppliers.filter(s=>s.active).length}</strong><small>{suppliers.length} no total</small></div>
      </div>
      <div className="analytics-grid">
        <section className="catalog-panel"><div className="panel-heading"><div><h2>Produtos com maior margem bruta</h2><p>Ranking simples usando preço sugerido menos custo de compra.</p></div><ChartNoAxesCombined size={20}/></div>
          {top.length === 0 ? <div className="empty-state">Cadastre produtos para gerar análises.</div> : <div className="table-wrap"><table><thead><tr><th>PRODUTO</th><th>CUSTO</th><th>PREÇO</th><th>LUCRO BRUTO</th><th>MARGEM</th></tr></thead><tbody>{top.map(p=><tr key={p.id}><td><strong>{p.name}</strong><small className="supplier-subline">{p.category}</small></td><td>{money(p.cost)}</td><td>{money(p.price)}</td><td>{money(p.profit)}</td><td><span className={"status " + (p.margin>=25?"status-review":"status-attention")}>{p.margin.toFixed(1).replace(".",",")}%</span></td></tr>)}</tbody></table></div>}
        </section>
        <section className="catalog-panel"><div className="panel-heading"><div><h2>Produtos por categoria</h2><p>Distribuição do catálogo atual.</p></div></div>
          {byCategory.length===0 ? <div className="empty-state">Sem categorias para exibir.</div> : <div className="category-bars">{byCategory.map(([category,count])=><div className="category-bar-row" key={category}><div><span>{category}</span><strong>{count}</strong></div><div className="category-bar-track"><span style={{width: (count/Math.max(...byCategory.map(x=>x[1]))*100)+"%"}}/></div></div>)}</div>}
        </section>
      </div>
      <div className="notice analytics-note"><span>Importante: a margem exibida nesta tela é bruta (preço sugerido menos custo do produto). Para estimar lucro líquido por canal, use o módulo Precificação e preencha comissão, tarifa, frete e imposto.</span></div>
    </>}
  </section>;
}

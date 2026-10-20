"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Save, Tags, TrendingUp, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logAudit } from "@/lib/audit";

type Channel = "mercado_livre" | "shopee" | "amazon";
type Rule = { id?: string; channel: Channel; commission_percent: number | string; fixed_fee: number | string; tax_percent: number | string; shipping_cost: number | string; target_margin_percent: number | string; active: boolean };
type Product = { id: string; name: string; cost_price: number | string; suggested_price: number | string };
const defaults: Rule[] = [
  { channel: "mercado_livre", commission_percent: 0, fixed_fee: 0, tax_percent: 0, shipping_cost: 0, target_margin_percent: 25, active: true },
  { channel: "shopee", commission_percent: 0, fixed_fee: 0, tax_percent: 0, shipping_cost: 0, target_margin_percent: 25, active: true },
  { channel: "amazon", commission_percent: 0, fixed_fee: 0, tax_percent: 0, shipping_cost: 0, target_margin_percent: 25, active: true }
];
const labels: Record<Channel, string> = { mercado_livre: "Mercado Livre", shopee: "Shopee", amazon: "Amazon" };
const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v: number | string) => Number(v) || 0;

export default function PricingModule({ mode = "pricing" }: { mode?: "pricing" | "channels" }) {
  const [rules, setRules] = useState<Rule[]>(defaults);
  const [products, setProducts] = useState<Product[]>([]);
  const [channel, setChannel] = useState<Channel>("shopee");
  const [productId, setProductId] = useState("");
  const [cost, setCost] = useState("40");
  const [currentPrice, setCurrentPrice] = useState("100");
  const [extraCost, setExtraCost] = useState("0");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const db = createClient();
    const [r, p] = await Promise.all([
      db.from("marketplace_rules").select("id,channel,commission_percent,fixed_fee,tax_percent,shipping_cost,target_margin_percent,active"),
      db.from("products").select("id,name,cost_price,suggested_price").order("name")
    ]);
    if (r.error) setMessage("Erro ao carregar regras: " + r.error.message);
    else setRules(defaults.map(d => (r.data || []).find(x => x.channel === d.channel) as Rule || d));
    if (p.error) setMessage("Erro ao carregar produtos: " + p.error.message);
    else setProducts((p.data || []) as Product[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const rule = rules.find(r => r.channel === channel) || defaults.find(r => r.channel === channel)!;
  const updateRule = (field: keyof Rule, value: string | boolean) => setRules(old => old.map(r => r.channel === channel ? { ...r, [field]: value } : r));
  const calc = useMemo(() => {
    const c = Math.max(0, Number(cost) || 0) + Math.max(0, Number(extraCost) || 0);
    const price = Math.max(0, Number(currentPrice) || 0);
    const commission = num(rule.commission_percent) / 100;
    const tax = num(rule.tax_percent) / 100;
    const target = num(rule.target_margin_percent) / 100;
    const denominator = 1 - commission - tax - target;
    const required = denominator > 0 ? (c + num(rule.fixed_fee) + num(rule.shipping_cost)) / denominator : null;
    const fee = price * commission + price * tax + num(rule.fixed_fee) + num(rule.shipping_cost);
    const profit = price - c - fee;
    return { required, profit, margin: price > 0 ? profit / price * 100 : 0, denominator, totalCost: c };
  }, [cost, currentPrice, extraCost, rule]);
  const selectProduct = (id: string) => {
    setProductId(id);
    const p = products.find(x => x.id === id);
    if (p) { setCost(String(p.cost_price)); setCurrentPrice(String(p.suggested_price)); }
  };
  const saveRule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fields = ["commission_percent", "tax_percent", "target_margin_percent"] as const;
    for (const field of fields) if (num(rule[field]) < 0 || num(rule[field]) > 100) { setMessage("Percentuais devem estar entre 0 e 100."); return; }
    if (num(rule.fixed_fee) < 0 || num(rule.shipping_cost) < 0) { setMessage("Taxa fixa e frete não podem ser negativos."); return; }
    setSaving(true);
    const payload = {
      channel, commission_percent: num(rule.commission_percent), fixed_fee: num(rule.fixed_fee),
      tax_percent: num(rule.tax_percent), shipping_cost: num(rule.shipping_cost),
      target_margin_percent: num(rule.target_margin_percent), active: rule.active
    };
    const { error } = await createClient().from("marketplace_rules").upsert(payload, { onConflict: "channel" });
    if (error) setMessage("Não foi possível salvar as regras: " + error.message);
    else { await logAudit("marketplace_rule.updated", "marketplace_rule", channel, payload); setMessage("Regras de " + labels[channel] + " salvas no Supabase."); }
    setSaving(false); await load();
  };
  const field = (label: string, key: "commission_percent" | "fixed_fee" | "tax_percent" | "shipping_cost" | "target_margin_percent", suffix: string) => <label>{label}<div className="number-suffix"><input type="number" min="0" max={suffix === "%" ? "100" : undefined} step="0.01" value={String(rule[key])} onChange={e => updateRule(key, e.target.value)}/><span>{suffix}</span></div></label>;

  return <section>
    <div className="page-heading"><div><div className="eyebrow">INTELIGÊNCIA DE PREÇO</div><h1>{mode === "channels" ? "Canais de venda" : "Precificação inteligente"}</h1><p>{mode === "channels" ? "Configure os custos e as regras comerciais dos marketplaces antes de publicar seus produtos." : "Configure taxas por canal e estime o preço necessário para atingir a margem desejada."}</p></div><span className="metric-icon"><Calculator size={22}/></span></div>
    {message && <div className="notice"><span>{message}</span></div>}
    <div className="pricing-layout">
      <section className="catalog-panel pricing-config"><div className="panel-heading"><div><h2>Regras do canal</h2><p>Use as taxas reais do seu contrato e regime tributário.</p></div></div>
        <form className="pricing-form" onSubmit={saveRule}>
          <label>Canal de venda<select value={channel} onChange={e => setChannel(e.target.value as Channel)}>{Object.entries(labels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div className="form-row">{field("Comissão do canal","commission_percent","%")}{field("Imposto estimado","tax_percent","%")}</div>
          <div className="form-row">{field("Tarifa fixa por venda","fixed_fee","R$")}{field("Frete subsidiado por você","shipping_cost","R$")}</div>
          {field("Margem líquida desejada","target_margin_percent","%")}
          <label className="supplier-checkbox"><input type="checkbox" checked={rule.active} onChange={e => updateRule("active",e.target.checked)}/> Usar esta regra nas simulações</label>
          <button type="submit" className="primary-button" disabled={saving || loading}><Save size={15}/>{saving ? "Salvando..." : "Salvar regra do canal"}</button>
        </form>
      </section>
      <section className="pricing-results">
        <div className="catalog-panel"><div className="panel-heading"><div><h2>Simulador de preço</h2><p>Selecione um produto ou informe custos manualmente.</p></div></div>
          <div className="pricing-form">
            <label>Produto cadastrado<select value={productId} onChange={e => selectProduct(e.target.value)}><option value="">Informar manualmente</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            <div className="form-row"><label>Custo do produto (R$)<input type="number" min="0" step="0.01" value={cost} onChange={e => {setCost(e.target.value);setProductId("");}}/></label><label>Outros custos (R$)<input type="number" min="0" step="0.01" value={extraCost} onChange={e => setExtraCost(e.target.value)}/></label></div>
            <label>Preço de venda atual (R$)<input type="number" min="0" step="0.01" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)}/></label>
          </div>
          <div className="pricing-output"><div className="output-label"><TrendingUp size={16}/> PREÇO RECOMENDADO</div><strong>{calc.required === null ? "Não calculável" : money(calc.required)}</strong><small>Para atingir margem líquida de {num(rule.target_margin_percent).toFixed(1).replace(".",",")}% no {labels[channel]}.</small></div>
          {calc.denominator <= 0 && <div className="pricing-warning"><AlertTriangle size={16}/> Comissão, imposto e margem alvo somam 100% ou mais. Ajuste as regras para calcular o preço.</div>}
          <div className="pricing-kpis"><div><span>Lucro estimado no preço atual</span><strong className={calc.profit >= 0 ? "positive-value" : "negative-value"}>{money(calc.profit)}</strong></div><div><span>Margem líquida estimada</span><strong className={calc.margin >= num(rule.target_margin_percent) ? "positive-value" : "negative-value"}>{calc.margin.toFixed(1).replace(".",",")}%</strong></div><div><span>Custos considerados</span><strong>{money(calc.totalCost + num(rule.fixed_fee) + num(rule.shipping_cost))}</strong></div></div>
          <p className="pricing-disclaimer">Estimativa, não garantia de lucro. Informe taxas, impostos, frete e custos reais. Não inclui devoluções, descontos, embalagens ou custos financeiros que não forem informados.</p>
        </div>
      </section>
    </div>
  </section>;
}

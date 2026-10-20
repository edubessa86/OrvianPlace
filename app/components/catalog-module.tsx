"use client";

import { useEffect, useState } from "react";
import { Boxes, Plus, Search, Pencil, Trash2, X, Save, Image as ImageIcon, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Supplier = { id: string; name: string; active: boolean };
type Product = {
  id: string; supplier_id: string | null; supplier_sku: string | null; name: string;
  description: string | null; category: string; brand: string | null; image_url: string | null;
  cost_price: number | string; suggested_price: number | string; stock_quantity: number | null;
  availability_status: "available" | "unavailable" | "unknown"; notes: string | null; created_at: string;
};
type Variant = { id: string; product_id: string; sku: string | null; size: string | null; color: string | null; cost_price: number | string | null; stock_quantity: number | null; active: boolean };
const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const blank = {
  name: "", supplier_id: "", supplier_sku: "", description: "", category: "Moda fitness",
  brand: "ORVIAN", image_url: "", cost_price: "", suggested_price: "", stock_quantity: "",
  availability_status: "unknown" as Product["availability_status"], notes: ""
};

export default function CatalogModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantForm, setVariantForm] = useState({ sku: "", size: "", color: "", cost_price: "", stock_quantity: "" });

  const load = async () => {
    setLoading(true);
    const db = createClient();
    const [p, s] = await Promise.all([
      db.from("products").select("id,supplier_id,supplier_sku,name,description,category,brand,image_url,cost_price,suggested_price,stock_quantity,availability_status,notes,created_at").order("created_at", { ascending: false }),
      db.from("suppliers").select("id,name,active").order("name")
    ]);
    if (p.error) setMessage("Erro ao carregar produtos: " + p.error.message);
    else setProducts((p.data ?? []) as Product[]);
    if (s.error) setMessage("Erro ao carregar fornecedores: " + s.error.message);
    else setSuppliers((s.data ?? []) as Supplier[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const openNew = () => { setEditing(null); setForm(blank); setFormOpen(true); setMessage(""); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name || "", supplier_id: p.supplier_id || "", supplier_sku: p.supplier_sku || "",
      description: p.description || "", category: p.category || "Outros", brand: p.brand || "",
      image_url: p.image_url || "", cost_price: String(p.cost_price ?? ""),
      suggested_price: String(p.suggested_price ?? ""), stock_quantity: p.stock_quantity == null ? "" : String(p.stock_quantity),
      availability_status: p.availability_status || "unknown", notes: p.notes || ""
    });
    setFormOpen(true); setMessage("");
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cost = Number(form.cost_price), sale = Number(form.suggested_price);
    if (!form.name.trim() || !Number.isFinite(cost) || !Number.isFinite(sale) || cost < 0 || sale < 0) {
      setMessage("Informe nome, custo e preço válidos (valores iguais a zero são permitidos)."); return;
    }
    const stock = form.stock_quantity.trim() === "" ? null : Number(form.stock_quantity);
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) { setMessage("Estoque deve ser um número inteiro maior ou igual a zero."); return; }
    setSaving(true);
    const db = createClient();
    const payload = {
      name: form.name.trim(), supplier_id: form.supplier_id || null,
      supplier_sku: form.supplier_sku.trim() || null, description: form.description.trim() || null,
      category: form.category.trim() || "Outros", brand: form.brand.trim() || null,
      image_url: form.image_url.trim() || null, cost_price: cost, suggested_price: sale,
      stock_quantity: stock, availability_status: form.availability_status, notes: form.notes.trim() || null
    };
    const result = editing
      ? await db.from("products").update(payload).eq("id", editing.id)
      : await db.from("products").insert(payload);
    if (result.error) { setMessage("Não foi possível salvar: " + result.error.message); setSaving(false); return; }
    setMessage(editing ? "Produto atualizado." : "Produto cadastrado.");
    setFormOpen(false); setSaving(false); await load();
  };

  const uploadImage = async (file: File | undefined) => {
    if (!file) return;
    if (!editing) { setMessage("Salve o produto primeiro; depois abra Editar para anexar uma imagem."); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMessage("Formato de imagem não suportado. Use JPG, PNG ou WebP."); return; }
    if (file.size > 10 * 1024 * 1024) { setMessage("A imagem deve ter no máximo 10 MB."); return; }
    setUploadingImage(true);
    const db = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = editing.id + "/" + Date.now() + "-" + safeName;
    const { error: uploadError } = await db.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) {
      setMessage("Não foi possível enviar a imagem. Confira se a migração product_image_storage foi aplicada. Detalhe: " + uploadError.message);
      setUploadingImage(false); return;
    }
    const publicUrl = db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    const { error: productError } = await db.from("products").update({ image_url: publicUrl }).eq("id", editing.id);
    const { error: mediaError } = await db.from("product_media").insert({ product_id: editing.id, storage_path: path, alt_text: editing.name, sort_order: 0 });
    if (productError) setMessage("A imagem foi enviada, mas não foi possível atualizar o produto: " + productError.message);
    else if (mediaError) setMessage("Imagem atualizada; não foi possível registrar os metadados de mídia: " + mediaError.message);
    else setMessage("Imagem enviada e vinculada ao produto.");
    setUploadingImage(false);
    await load();
  };

  const remove = async (p: Product) => {
    if (!window.confirm("Excluir definitivamente “" + p.name + "”? Variantes e mídias relacionadas também serão removidas. Esta ação não pode ser desfeita.")) return;
    const db = createClient();
    const { error } = await db.from("products").delete().eq("id", p.id);
    if (error) setMessage("Não foi possível excluir: " + error.message);
    else { setMessage("Produto excluído."); if (selected?.id === p.id) setSelected(null); await load(); }
  };

  const openVariants = async (p: Product) => {
    setSelected(p); setVariantForm({ sku: "", size: "", color: "", cost_price: "", stock_quantity: "" });
    const { data, error } = await createClient().from("product_variants").select("id,product_id,sku,size,color,cost_price,stock_quantity,active").eq("product_id", p.id).order("created_at");
    if (error) setMessage("Não foi possível carregar variantes: " + error.message);
    else setVariants((data ?? []) as Variant[]);
  };

  const addVariant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if (!selected) return;
    const stock = variantForm.stock_quantity.trim() ? Number(variantForm.stock_quantity) : null;
    const cost = variantForm.cost_price.trim() ? Number(variantForm.cost_price) : null;
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) { setMessage("Estoque da variante inválido."); return; }
    if (cost !== null && (!Number.isFinite(cost) || cost < 0)) { setMessage("Custo da variante inválido."); return; }
    const { error } = await createClient().from("product_variants").insert({
      product_id: selected.id, sku: variantForm.sku.trim() || null, size: variantForm.size.trim() || null,
      color: variantForm.color.trim() || null, cost_price: cost, stock_quantity: stock
    });
    if (error) { setMessage("Não foi possível adicionar variante: " + error.message); return; }
    setVariantForm({ sku: "", size: "", color: "", cost_price: "", stock_quantity: "" });
    await openVariants(selected); setMessage("Variante adicionada.");
  };

  const deleteVariant = async (v: Variant) => {
    if (!window.confirm("Excluir esta variante?")) return;
    const { error } = await createClient().from("product_variants").delete().eq("id", v.id);
    if (error) setMessage("Erro ao excluir variante: " + error.message);
    else if (selected) await openVariants(selected);
  };

  const filtered = products.filter(p => [p.name, p.category, p.brand || "", p.supplier_sku || ""].join(" ").toLowerCase().includes(search.toLowerCase()));
  const supplierName = (id: string | null) => suppliers.find(s => s.id === id)?.name || "Sem fornecedor";

  return <section>
    <div className="page-heading"><div><div className="eyebrow">CADASTRO CENTRAL</div><h1>Catálogo de produtos</h1><p>Edite dados, imagens, estoque e variantes. As alterações são salvas no Supabase.</p></div><button className="primary-button" onClick={openNew}><Plus size={16}/> Novo produto</button></div>
    {message && <div className="notice"><span>{message}</span><button onClick={() => setMessage("")} aria-label="Fechar"><X size={16}/></button></div>}
    <div className="metrics-grid">
      <div className="metric-card"><div className="metric-top"><span className="metric-icon"><Boxes size={18}/></span></div><p>Produtos cadastrados</p><strong className="metric-value">{products.length}</strong><small>Registros persistidos</small></div>
      <div className="metric-card"><div className="metric-top"><span className="metric-icon"><ImageIcon size={18}/></span></div><p>Com imagem</p><strong className="metric-value">{products.filter(p => p.image_url).length}</strong><small>URL de imagem informada</small></div>
      <div className="metric-card"><div className="metric-top"><span className="metric-icon"><Layers size={18}/></span></div><p>Com fornecedor</p><strong className="metric-value">{products.filter(p => p.supplier_id).length}</strong><small>Relacionados à base comercial</small></div>
      <div className="metric-card"><div className="metric-top"><span className="metric-icon"><Boxes size={18}/></span></div><p>Disponíveis</p><strong className="metric-value">{products.filter(p => p.availability_status === "available").length}</strong><small>Disponibilidade confirmada</small></div>
    </div>
    <section className="catalog-panel"><div className="table-toolbar"><label className="search-field"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome, marca, categoria ou SKU"/></label><button className="filter-button" onClick={() => setSearch("")}>Limpar</button></div>
      <div className="table-wrap">{loading ? <div className="empty-state">Carregando catálogo...</div> : filtered.length === 0 ? <div className="empty-state">Nenhum produto encontrado.</div> : <table><thead><tr><th>PRODUTO</th><th>FORNECEDOR</th><th>CATEGORIA / SKU</th><th>CUSTO</th><th>PREÇO SUGERIDO</th><th>MARGEM BRUTA</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>{filtered.map(p => {
        const cost = Number(p.cost_price) || 0, sale = Number(p.suggested_price) || 0;
        const margin = sale > 0 ? (sale-cost)/sale*100 : 0;
        return <tr key={p.id}><td><div className="product-cell">{p.image_url ? <img className="catalog-image" src={p.image_url} alt={p.name}/> : <div className="product-thumb"><Boxes size={18}/></div>}<div><strong>{p.name}</strong><small>{p.brand || "Marca não informada"}</small></div></div></td><td>{supplierName(p.supplier_id)}</td><td>{p.category}<small className="supplier-subline">{p.supplier_sku || "Sem SKU"}</small></td><td>{money(cost)}</td><td className="price-cell">{money(sale)}</td><td><span className={margin >= 25 ? "status status-review" : "status status-attention"}>{margin.toFixed(1).replace(".", ",")}%</span></td><td>{p.availability_status === "available" ? "Disponível" : p.availability_status === "unavailable" ? "Indisponível" : "Não verificado"}</td><td><div className="supplier-actions"><button className="secondary-button" onClick={() => openEdit(p)}><Pencil size={13}/> Editar</button><button className="secondary-button" onClick={() => void openVariants(p)}><Layers size={13}/> Variantes</button><button className="secondary-button" onClick={() => void remove(p)}><Trash2 size={13}/> Excluir</button></div></td></tr>;
      })}</tbody></table>}</div>
      <div className="panel-footer"><span>{filtered.length} de {products.length} produtos</span><span className="footer-note">Dados salvos no Supabase</span></div>
    </section>

    {formOpen && <div className="modal-backdrop" onClick={() => !saving && setFormOpen(false)}><section className="modal catalog-modal" onClick={e => e.stopPropagation()}><div className="modal-heading"><div><div className="eyebrow">CATÁLOGO ORVIAN</div><h2>{editing ? "Editar produto" : "Novo produto"}</h2><p>Campos de produto, origem e precificação.</p></div><button className="icon-button" onClick={() => setFormOpen(false)}><X size={17}/></button></div>
      <form onSubmit={save}>
        <label>Nome do produto *<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})}/></label>
        <div className="form-row"><label>Fornecedor<select value={form.supplier_id} onChange={e => setForm({...form,supplier_id:e.target.value})}><option value="">Sem fornecedor</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}{s.active ? "" : " (inativo)"}</option>)}</select></label><label>SKU do fornecedor<input value={form.supplier_sku} onChange={e => setForm({...form,supplier_sku:e.target.value})}/></label></div>
        <div className="form-row"><label>Categoria<input value={form.category} onChange={e => setForm({...form,category:e.target.value})}/></label><label>Marca<input value={form.brand} onChange={e => setForm({...form,brand:e.target.value})}/></label></div>
        <div className="form-row"><label>Custo (R$) *<input type="number" min="0" step="0.01" required value={form.cost_price} onChange={e => setForm({...form,cost_price:e.target.value})}/></label><label>Preço sugerido (R$) *<input type="number" min="0" step="0.01" required value={form.suggested_price} onChange={e => setForm({...form,suggested_price:e.target.value})}/></label></div>
        <div className="form-row"><label>Estoque (opcional)<input type="number" min="0" step="1" value={form.stock_quantity} onChange={e => setForm({...form,stock_quantity:e.target.value})}/></label><label>Disponibilidade<select value={form.availability_status} onChange={e => setForm({...form,availability_status:e.target.value as Product["availability_status"]})}><option value="unknown">Não verificada</option><option value="available">Disponível</option><option value="unavailable">Indisponível</option></select></label></div>
        <label>URL da imagem<input type="url" value={form.image_url} onChange={e => setForm({...form,image_url:e.target.value})} placeholder="https://..."/></label>
        {editing && <label className="image-upload-control">Enviar imagem (JPG, PNG ou WebP; até 10 MB)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingImage} onChange={e => { void uploadImage(e.target.files?.[0]); e.currentTarget.value = ""; }}/>{uploadingImage && <small>Enviando imagem...</small>}</label>}
        {form.image_url && <div className="image-preview"><img src={form.image_url} alt="Prévia do produto"/><span>Prévia da imagem atual</span></div>}
        <label>Descrição<textarea rows={2} value={form.description} onChange={e => setForm({...form,description:e.target.value})}/></label>
        <label>Observações<textarea rows={2} value={form.notes} onChange={e => setForm({...form,notes:e.target.value})}/></label>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}><Save size={15}/>{saving ? "Salvando..." : "Salvar produto"}</button></div>
      </form></section></div>}

    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="modal catalog-modal" onClick={e => e.stopPropagation()}><div className="modal-heading"><div><div className="eyebrow">VARIANTES DO PRODUTO</div><h2>{selected.name}</h2><p>Cadastre tamanhos, cores, SKU e estoque por variante.</p></div><button className="icon-button" onClick={() => setSelected(null)}><X size={17}/></button></div>
      <form onSubmit={addVariant}><div className="form-row"><label>SKU<input value={variantForm.sku} onChange={e => setVariantForm({...variantForm,sku:e.target.value})}/></label><label>Tamanho<input value={variantForm.size} onChange={e => setVariantForm({...variantForm,size:e.target.value})} placeholder="P, M, G, GG"/></label></div><div className="form-row"><label>Cor<input value={variantForm.color} onChange={e => setVariantForm({...variantForm,color:e.target.value})}/></label><label>Custo (opcional)<input type="number" min="0" step="0.01" value={variantForm.cost_price} onChange={e => setVariantForm({...variantForm,cost_price:e.target.value})}/></label></div><label>Estoque da variante<input type="number" min="0" step="1" value={variantForm.stock_quantity} onChange={e => setVariantForm({...variantForm,stock_quantity:e.target.value})}/></label><div className="modal-actions"><button type="submit" className="primary-button"><Plus size={15}/> Adicionar variante</button></div></form>
      <div className="variant-list">{variants.length === 0 ? <div className="empty-state">Nenhuma variante cadastrada.</div> : variants.map(v => <div className="variant-row" key={v.id}><div><strong>{[v.size,v.color].filter(Boolean).join(" / ") || "Variante"}</strong><small>{v.sku || "Sem SKU"} · Estoque: {v.stock_quantity ?? "—"} · Custo: {v.cost_price == null ? "—" : money(Number(v.cost_price))}</small></div><button className="secondary-button" onClick={() => void deleteVariant(v)}><Trash2 size={13}/> Excluir</button></div>)}</div>
    </section></div>}
  </section>;
}

"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, UploadCloud, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";

type Supplier = { id: string; name: string };
type ImportRow = { name: string; supplier_sku: string | null; category: string; brand: string | null; cost_price: number; suggested_price: number; stock_quantity: number | null; description: string | null; raw: Record<string, unknown>; rowNumber: number };
type ImportHistory = { id: string; file_name: string; file_type: string; status: string; total_rows: number; imported_rows: number; skipped_rows: number; created_at: string; error_report: unknown };
const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const normalize = (v: unknown) => String(v ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const first = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) if (row[key] !== undefined && String(row[key]).trim() !== "") return row[key];
  return undefined;
};
const parseMoney = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  let s = String(v ?? "").replace(/R\$|\s/g, "");
  if (!s) return NaN;
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  return Number(s);
};
const aliases = {
  name: ["nome","produto","name","product","descricao_do_produto","titulo","title"],
  sku: ["sku","codigo","codigo_do_produto","referencia","referencia_fornecedor","ref","id_produto"],
  category: ["categoria","category","tipo","departamento"],
  brand: ["marca","brand","fabricante"],
  cost: ["custo","custo_unitario","preco_atacado","preco_fornecedor","valor_atacado","cost_price","cost","preco_custo","valor"],
  sale: ["preco_venda","preco_sugerido","venda","preco","suggested_price","sale_price","retail_price"],
  stock: ["estoque","quantidade","stock","stock_quantity","qtd"],
  description: ["descricao","description","detalhes"]
};

function mapRows(rawRows: Record<string, unknown>[]): { rows: ImportRow[]; errors: string[] } {
  const rows: ImportRow[] = [], errors: string[] = [];
  rawRows.forEach((original, index) => {
    const row: Record<string, unknown> = {};
    Object.entries(original).forEach(([key, value]) => { row[normalize(key)] = value; });
    const name = String(first(row, aliases.name) ?? "").trim();
    const cost = parseMoney(first(row, aliases.cost));
    const saleRaw = first(row, aliases.sale);
    const sale = saleRaw === undefined || String(saleRaw).trim() === "" ? 0 : parseMoney(saleRaw);
    const stockRaw = first(row, aliases.stock);
    const stockNum = stockRaw === undefined || String(stockRaw).trim() === "" ? null : Number(stockRaw);
    if (!name) { errors.push("Linha " + (index + 2) + ": nome do produto não identificado."); return; }
    if (!Number.isFinite(cost) || cost < 0) { errors.push("Linha " + (index + 2) + " (" + name + "): custo ausente ou inválido."); return; }
    if (!Number.isFinite(sale) || sale < 0) { errors.push("Linha " + (index + 2) + " (" + name + "): preço de venda inválido."); return; }
    if (stockNum !== null && (!Number.isInteger(stockNum) || stockNum < 0)) { errors.push("Linha " + (index + 2) + " (" + name + "): estoque inválido."); return; }
    rows.push({
      name, supplier_sku: String(first(row, aliases.sku) ?? "").trim() || null,
      category: String(first(row, aliases.category) ?? "Outros").trim() || "Outros",
      brand: String(first(row, aliases.brand) ?? "").trim() || null,
      cost_price: cost, suggested_price: sale, stock_quantity: stockNum,
      description: String(first(row, aliases.description) ?? "").trim() || null,
      raw: original, rowNumber: index + 2
    });
  });
  return { rows, errors };
}

export default function ImportModule() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [history, setHistory] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfText, setPdfText] = useState("");

  const load = async () => {
    setLoading(true);
    const db = createClient();
    const [s, h] = await Promise.all([
      db.from("suppliers").select("id,name").eq("active", true).order("name"),
      db.from("catalog_imports").select("id,file_name,file_type,status,total_rows,imported_rows,skipped_rows,created_at,error_report").order("created_at", { ascending: false }).limit(12)
    ]);
    if (s.error) setMessage("Erro ao carregar fornecedores: " + s.error.message); else setSuppliers((s.data ?? []) as Supplier[]);
    if (h.error) setMessage("Erro ao carregar histórico: " + h.error.message); else setHistory((h.data ?? []) as ImportHistory[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const readFile = async (chosen: File | null) => {
    setFile(chosen); setRows([]); setErrors([]); setPdfText(""); setMessage("");
    if (!chosen) return;
    const ext = chosen.name.split(".").pop()?.toLowerCase();
    if (!["csv","xlsx","xls","pdf"].includes(ext || "")) { setMessage("Formato não suportado. Use CSV, XLSX, XLS ou PDF."); setFile(null); return; }
    setParsing(true);
    try {
      let rawRows: Record<string, unknown>[] = [];
      if (ext === "pdf") {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/" + pdfjs.version + "/pdf.worker.min.mjs";
        const data = new Uint8Array(await chosen.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
        const lines: string[] = [];
        for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
          const page = await doc.getPage(pageNo);
          const content = await page.getTextContent();
          const items = content.items as Array<{ str?: string; transform?: number[] }>;
          let line = "", lastY: number | undefined;
          for (const item of items) {
            const y = item.transform?.[5];
            if (lastY !== undefined && y !== undefined && Math.abs(y - lastY) > 3 && line.trim()) { lines.push(line.trim()); line = ""; }
            line += (item.str || "") + " ";
            if (y !== undefined) lastY = y;
          }
          if (line.trim()) lines.push(line.trim());
        }
        const text = lines.join("\n");
        setPdfText(text.slice(0, 12000));
        rawRows = lines.map(line => {
          const prices = line.match(/(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2}|(?:R\$\s*)?\d+\.\d{2}/g) || [];
          const name = line.replace(/(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2}|(?:R\$\s*)?\d+\.\d{2}/g, "").replace(/\s+/g, " ").trim();
          return { nome: name, custo: prices[0], preco_venda: prices[1] || prices[0] };
        }).filter(r => String(r.nome || "").length > 2 && r.custo !== undefined);
      } else {
        const bytes = await chosen.arrayBuffer();
        const workbook = XLSX.read(bytes, { type: "array", cellDates: false });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
      }
      const result = mapRows(rawRows);
      setRows(result.rows); setErrors(result.errors);
      setMessage(result.rows.length + " linha(s) pronta(s) para importação; " + result.errors.length + " linha(s) precisam de revisão.");
      if (ext === "pdf" && result.rows.length === 0) setMessage("O texto do PDF foi extraído, mas não foi possível reconhecer linhas de produtos com segurança. Revise o texto abaixo e importe o catálogo em CSV/XLSX para preservar os campos.");
    } catch (e) {
      setMessage("Não foi possível ler o arquivo: " + (e instanceof Error ? e.message : "erro desconhecido"));
    } finally { setParsing(false); }
  };

  const processImport = async () => {
    if (!file || rows.length === 0) { setMessage("Selecione um arquivo com linhas válidas."); return; }
    setImporting(true);
    const db = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "csv";
    const fileType = ext === "xls" ? "xlsx" : ext as "csv" | "xlsx" | "xml" | "pdf";
    const { data: importRecord, error: recordError } = await db.from("catalog_imports").insert({
      supplier_id: supplierId || null, file_name: file.name, file_type: fileType, status: "processing",
      total_rows: rows.length + errors.length, imported_rows: 0, skipped_rows: errors.length, error_report: errors
    }).select("id").single();
    if (recordError || !importRecord) { setMessage("Não foi possível registrar a importação: " + (recordError?.message || "sem resposta")); setImporting(false); return; }
    let imported = 0;
    const finalErrors = [...errors];
    for (const row of rows) {
      const payload = {
        supplier_id: supplierId || null, supplier_sku: row.supplier_sku, name: row.name,
        category: row.category, brand: row.brand, description: row.description,
        cost_price: row.cost_price, suggested_price: row.suggested_price,
        stock_quantity: row.stock_quantity, source_import: file.name,
        availability_status: "unknown"
      };
      const { error } = await db.from("products").insert(payload);
      if (error) finalErrors.push("Linha " + row.rowNumber + " (" + row.name + "): " + error.message);
      else imported++;
    }
    const skipped = finalErrors.length;
    const status = skipped === 0 ? "completed" : imported > 0 ? "completed_with_errors" : "failed";
    const { error: updateError } = await db.from("catalog_imports").update({
      status, total_rows: rows.length + errors.length, imported_rows: imported,
      skipped_rows: skipped, error_report: finalErrors, completed_at: new Date().toISOString()
    }).eq("id", importRecord.id);
    setMessage(updateError ? "Importação executada, mas houve erro ao atualizar o histórico: " + updateError.message : "Importação concluída: " + imported + " produto(s) importado(s), " + skipped + " linha(s) com erro.");
    setImporting(false); setFile(null); setRows([]); setErrors([]); setPdfText(""); await load();
  };

  return <section>
    <div className="page-heading"><div><div className="eyebrow">GARIMPO E ENTRADA DE DADOS</div><h1>Importar catálogos</h1><p>Carregue planilhas de fabricantes, valide as linhas e registre os produtos no catálogo.</p></div><span className="metric-icon"><UploadCloud size={22}/></span></div>
    {message && <div className="notice"><span>{message}</span></div>}
    <div className="import-grid">
      <section className="catalog-panel import-card"><div className="panel-heading"><div><h2>Nova importação</h2><p>CSV, Excel ou PDF com texto selecionável.</p></div></div>
        <div className="import-form">
          <label>Vincular ao fornecedor (opcional)<select value={supplierId} onChange={e => setSupplierId(e.target.value)}><option value="">Sem fornecedor vinculado</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label className="upload-drop"><UploadCloud size={26}/><strong>{file ? file.name : "Escolher arquivo de catálogo"}</strong><small>CSV, XLSX, XLS ou PDF · o arquivo é processado no navegador</small><input type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={e => void readFile(e.target.files?.[0] || null)}/></label>
          {parsing && <div className="empty-state">Lendo arquivo e analisando linhas...</div>}
          {rows.length > 0 && <div className="import-preview"><div className="panel-heading"><div><h2>Prévia de importação</h2><p>{rows.length} linhas válidas · {errors.length} linhas com erro</p></div></div><div className="table-wrap"><table><thead><tr><th>LINHA</th><th>PRODUTO</th><th>SKU</th><th>CATEGORIA</th><th>CUSTO</th><th>PREÇO SUGERIDO</th></tr></thead><tbody>{rows.slice(0,10).map((r,i)=><tr key={r.rowNumber + "-" + i}><td>{r.rowNumber}</td><td>{r.name}</td><td>{r.supplier_sku || "—"}</td><td>{r.category}</td><td>{money(r.cost_price)}</td><td>{money(r.suggested_price)}</td></tr>)}</tbody></table></div>{rows.length > 10 && <p className="import-hint">Mostrando 10 de {rows.length} linhas válidas.</p>}</div>}
          {errors.length > 0 && <div className="import-errors"><strong><AlertTriangle size={15}/> Linhas que precisam de revisão</strong>{errors.slice(0,12).map((err,i)=><small key={i}>{err}</small>)}{errors.length > 12 && <small>...e mais {errors.length-12} erro(s).</small>}</div>}
          {pdfText && <details className="pdf-text"><summary>Texto extraído do PDF (revisar)</summary><pre>{pdfText}</pre></details>}
          <div className="modal-actions"><button className="secondary-button" onClick={() => {setFile(null);setRows([]);setErrors([]);setPdfText("");}}>Limpar</button><button className="primary-button" onClick={() => void processImport()} disabled={importing || parsing || rows.length === 0}><CheckCircle2 size={15}/>{importing ? "Importando..." : "Importar linhas válidas"}</button></div>
        </div>
      </section>
      <section className="catalog-panel import-guide"><div className="panel-heading"><div><h2>Modelo de planilha</h2><p>Os cabeçalhos são reconhecidos por sinônimos em português e inglês.</p></div><FileSpreadsheet size={20}/></div>
        <div className="import-help"><strong>Colunas recomendadas</strong><p><code>nome</code> · <code>sku</code> · <code>categoria</code> · <code>marca</code> · <code>custo</code> · <code>preco_venda</code> · <code>estoque</code> · <code>descricao</code></p><strong>Validações aplicadas</strong><ul><li>Nome obrigatório.</li><li>Custo numérico e não negativo.</li><li>Preço de venda opcional; se ausente, fica R$ 0,00.</li><li>Estoque deve ser inteiro não negativo.</li><li>Erros são registrados no histórico; linhas válidas continuam.</li></ul><strong>Importação de PDF</strong><p>PDFs com texto selecionável são extraídos e analisados por heurística. Revise a prévia: catálogos em PDF podem ter layout ambíguo. PDFs digitalizados como imagem precisam de OCR e não são reconhecidos automaticamente nesta versão.</p></div>
      </section>
    </div>
    <section className="catalog-panel import-history"><div className="panel-heading"><div><h2>Histórico de importações</h2><p>Registro persistido de arquivos processados e linhas importadas.</p></div><button className="filter-button" onClick={() => void load()}><RefreshCw size={14}/> Atualizar</button></div>
      {loading ? <div className="empty-state">Carregando histórico...</div> : history.length === 0 ? <div className="empty-state">Nenhuma importação realizada.</div> : <div className="table-wrap"><table><thead><tr><th>ARQUIVO</th><th>TIPO</th><th>STATUS</th><th>LINHAS</th><th>IMPORTADAS</th><th>IGNORADAS / ERROS</th><th>DATA</th></tr></thead><tbody>{history.map(h => <tr key={h.id}><td><div className="product-cell"><div className="product-thumb">{h.file_type === "pdf" ? <FileText size={17}/> : <FileSpreadsheet size={17}/>}</div><strong>{h.file_name}</strong></div></td><td>{h.file_type.toUpperCase()}</td><td><span className={"status " + (h.status === "completed" ? "status-review" : h.status === "failed" ? "status-attention" : "status-analysis")}>{h.status}</span></td><td>{h.total_rows}</td><td>{h.imported_rows}</td><td>{h.skipped_rows}</td><td>{new Date(h.created_at).toLocaleString("pt-BR")}</td></tr>)}</tbody></table></div>}
    </section>
  </section>;
}

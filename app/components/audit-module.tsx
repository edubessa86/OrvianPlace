"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Download, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuditLog = {
  id: number;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

const dateTime = (value: string) => new Date(value).toLocaleString("pt-BR", {
  dateStyle: "short", timeStyle: "short"
});

const readableAction = (action: string) => ({
  "supplier.created": "Fornecedor cadastrado",
  "supplier.updated": "Fornecedor atualizado",
  "supplier.deactivated": "Fornecedor inativado",
  "supplier.reactivated": "Fornecedor reativado",
  "marketplace_rule.updated": "Regra de canal atualizada",
  "catalog_import.completed": "Importação concluída",
  "product.created": "Produto cadastrado",
  "product.updated": "Produto atualizado",
  "product.deleted": "Produto excluído"
} as Record<string, string>)[action] ?? action;

export default function AuditModule() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setMessage("");
    const db = createClient();
    const { data, error } = await db
      .from("audit_logs")
      .select("id,actor_id,action,entity_type,entity_id,details,created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setMessage("Não foi possível carregar a auditoria: " + error.message);
      setLogs([]);
    } else {
      setLogs((data ?? []) as AuditLog[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void loadLogs(); }, [loadLogs]);

  const actions = useMemo(() => [...new Set(logs.map(log => log.action))].sort(), [logs]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return logs.filter(log => {
      if (actionFilter !== "all" && log.action !== actionFilter) return false;
      if (!needle) return true;
      const haystack = [
        log.action, log.entity_type, log.entity_id ?? "", log.actor_id ?? "",
        JSON.stringify(log.details ?? {})
      ].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [logs, query, actionFilter]);

  const exportCsv = () => {
    const quote = (value: unknown) => '"' + String(value ?? "").replace(/"/g, '""') + '"';
    const header = ["data_hora", "acao", "tipo_entidade", "id_entidade", "usuario_id", "detalhes"];
    const lines = filtered.map(log => [
      log.created_at, readableAction(log.action), log.entity_type, log.entity_id,
      log.actor_id, JSON.stringify(log.details ?? {})
    ].map(quote).join(";"));
    const blob = new Blob(["\ufeff" + [header.map(quote).join(";"), ...lines].join("\r\n")], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "orvianplace-auditoria.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <section>
    <div className="page-heading">
      <div>
        <div className="eyebrow">CONTROLE E RASTREABILIDADE</div>
        <h1>Auditoria</h1>
        <p>Consulte ações administrativas registradas pelo sistema. A tela exibe até 200 eventos recentes.</p>
      </div>
      <div className="export-actions">
        <button className="secondary-button" onClick={() => void loadLogs()} disabled={loading}>
          <RefreshCw size={15}/> Atualizar
        </button>
        <button className="primary-button" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download size={15}/> Exportar CSV
        </button>
      </div>
    </div>

    {message && <div className="notice"><Activity size={17}/><span>{message}</span></div>}

    <div className="metrics-grid">
      <div className="metric-card"><div className="metric-top"><span className="metric-icon"><ShieldCheck size={18}/></span></div><p>Eventos carregados</p><strong className="metric-value">{logs.length}</strong><small>Máximo de 200 recentes</small></div>
      <div className="metric-card"><div className="metric-top"><span className="metric-icon"><Activity size={18}/></span></div><p>Resultados filtrados</p><strong className="metric-value">{filtered.length}</strong><small>Conforme os filtros atuais</small></div>
    </div>

    <section className="catalog-panel">
      <div className="panel-heading"><div><h2>Histórico de atividades</h2><p>Os registros são informativos; esta tela não permite alterar ou excluir eventos.</p></div></div>
      <div className="table-toolbar">
        <label className="search-field"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar ação, entidade, usuário ou detalhe..."/></label>
        <select aria-label="Filtrar por ação" value={actionFilter} onChange={event => setActionFilter(event.target.value)}>
          <option value="all">Todas as ações</option>
          {actions.map(action => <option key={action} value={action}>{readableAction(action)}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        {loading ? <div className="empty-state">Carregando histórico de auditoria...</div> : filtered.length === 0 ? <div className="empty-state">Nenhum evento corresponde aos filtros.</div> : <table>
          <thead><tr><th>DATA/HORA</th><th>AÇÃO</th><th>ENTIDADE</th><th>USUÁRIO</th><th>DETALHES</th></tr></thead>
          <tbody>{filtered.map(log => <tr key={log.id}>
            <td>{dateTime(log.created_at)}</td>
            <td><span className="status status-review">{readableAction(log.action)}</span><small className="supplier-subline">{log.action}</small></td>
            <td>{log.entity_type}<small className="supplier-subline">{log.entity_id || "ID não informado"}</small></td>
            <td><small>{log.actor_id ? log.actor_id.slice(0, 8) + "…" : "Sistema / desconhecido"}</small></td>
            <td><details><summary>Ver detalhes</summary><pre className="audit-details">{JSON.stringify(log.details ?? {}, null, 2)}</pre></details></td>
          </tr>)}</tbody>
        </table>}
      </div>
      <div className="panel-footer"><span>Exibindo {filtered.length} de {logs.length} eventos carregados</span><span className="footer-note"><ShieldCheck size={14}/> Consulta somente leitura</span></div>
    </section>
  </section>;
}

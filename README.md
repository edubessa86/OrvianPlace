# OrvianPlace

Sistema online de inteligência comercial e gestão de catálogo para a ORVIAN, com foco inicial em moda fitness feminina e fornecedores nacionais com estoque no Brasil.

## Estado atual

**Versão 0.1.0 — protótipo visual inicial.** O painel responsivo e a tela inicial estão no repositório. A lista e o formulário de produtos funcionam apenas durante a sessão do navegador; ainda não há autenticação, banco de dados nem persistência. Não publicar o protótipo em produção antes de implementar e validar o acesso administrativo.

## Objetivo

Centralizar fornecedores e produtos, importar catálogos, calcular custos e margem estimada por marketplace e preparar anúncios para aprovação administrativa. A primeira versão não publicará anúncios nem fará pedidos a fornecedores automaticamente.

## Primeira versão (MVP)

- Área administrativa protegida por autenticação.
- Cadastro de fornecedores nacionais.
- Importação manual de catálogos CSV/XLSX; suporte a XML/PDF será adicionado por etapas.
- Catálogo de produtos, variantes, tamanhos, cores, fotos, custos e disponibilidade.
- Regras de preço e calculadora de rentabilidade por canal.
- Filtros e ranking de oportunidades.
- Histórico de importações e alterações.
- Preparação de anúncios com aprovação manual.
- Auditoria das ações administrativas.

## Arquitetura proposta

- Aplicação web: Next.js + TypeScript.
- Autenticação e banco: Supabase (PostgreSQL + Auth + Storage), com políticas de acesso por usuário.
- Hospedagem web: Vercel ou alternativa compatível.
- Importação e cálculos: módulos TypeScript/Python conforme a necessidade comprovada.
- Integrações de marketplaces: adaptadores independentes, habilitados somente após configurar credenciais oficiais e validar permissões.

As escolhas de hospedagem e serviços devem ser confirmadas antes de configurar produção. Planos gratuitos têm limites e podem mudar.

## Segurança

- Não guardar senhas, tokens de API ou chaves privadas no repositório.
- Usar variáveis de ambiente e secrets do provedor de hospedagem.
- Proteger todas as rotas administrativas no servidor, não apenas na interface.
- Aplicar políticas de acesso no banco (RLS).
- Manter publicação de anúncios desabilitada até validação explícita.
- Não fazer scraping que viole termos ou contorne controles de acesso.

## Domínio

Domínio pretendido: https://www.useorvian.com.br

Recomendação inicial: manter a loja pública separada do painel administrativo, usando um subdomínio como `painel.useorvian.com.br` quando a hospedagem estiver definida. O domínio não será alterado automaticamente por este repositório.

## Desenvolvimento

Consulte [Arquitetura](docs/ARCHITECTURE.md) e [Roadmap](docs/ROADMAP.md).

Arquivo `.env.example` contém apenas os nomes das variáveis esperadas. Nunca coloque dados reais de clientes, credenciais ou tokens em issues, commits ou arquivos versionados.

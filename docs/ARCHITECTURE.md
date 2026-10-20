# Arquitetura — OrvianPlace

## Objetivo do sistema

Painel web privado para uso administrativo da ORVIAN. O sistema começa como ferramenta de catálogo e inteligência de preços; integrações de publicação e pedidos ficam para fases posteriores.

## Componentes

1. **Frontend web** — Next.js + TypeScript; interface responsiva para desktop e celular.
2. **Autenticação** — Supabase Auth; cadastro público desabilitado. O administrador inicial será convidado/criado no ambiente de implantação, sem credenciais no código.
3. **Banco de dados** — PostgreSQL no Supabase.
4. **Arquivos** — Supabase Storage para imagens e catálogos importados, com acesso privado.
5. **Importador** — CSV/XLSX na primeira etapa; validar cabeçalhos, normalizar dados, detectar duplicados e apresentar prévia antes de gravar.
6. **Motor de rentabilidade** — cálculo separado por marketplace, com taxas configuráveis e data da última atualização. Valores desconhecidos devem ser identificados como estimativas, não tratados como fatos.
7. **Conectores** — interfaces independentes por fornecedor e marketplace; nenhuma integração será considerada disponível até validar documentação, credenciais e permissões.
8. **Auditoria** — registrar login administrativo, importações, alterações de custo/preço e ações de publicação.

## Modelo de dados inicial

- `profiles`: usuário e papel (`admin` inicialmente).
- `suppliers`: nome, origem nacional, contato comercial, modalidade de integração, URL do catálogo, observações e status.
- `supplier_catalog_imports`: fornecedor, arquivo, data, status, contagens e erros.
- `products`: SKU interno, nome, descrição, categoria, marca, custo base, fornecedor, status e timestamps.
- `product_variants`: SKU/identificador do fornecedor, tamanho, cor, custo e disponibilidade.
- `product_media`: caminho do arquivo, origem e autorização de uso registrada.
- `marketplace_rules`: canal, comissão e custos configuráveis, validade e fonte.
- `product_channel_prices`: preço calculado/manual, custos estimados, lucro estimado, margem e status de revisão.
- `listing_drafts`: canal, título, descrição, atributos, status de aprovação e erros de validação.
- `audit_logs`: usuário, ação, entidade e timestamp.

O esquema definitivo será criado por migrations versionadas; os campos acima são um modelo inicial e podem ser ajustados durante a implementação.

## Fluxo de catálogo

1. Administrador cadastra o fornecedor.
2. Envia um CSV/XLSX ou seleciona uma fonte documentada e autorizada.
3. O sistema apresenta uma prévia e valida campos obrigatórios.
4. O administrador confirma a importação.
5. O sistema normaliza produtos e variantes, sinaliza possíveis duplicados e registra erros.
6. O motor calcula preços indicativos por canal usando regras configuradas.
7. O administrador revisa os candidatos e gera rascunhos de anúncio.
8. Publicação externa só é habilitada numa fase posterior, após testes e aprovação explícita.

## Segurança e privacidade

- Bloquear cadastro público; acesso somente por convite/administrador.
- Validar sessão e papel do usuário no servidor e no banco.
- Ativar RLS em tabelas expostas pelo Supabase.
- Guardar segredos apenas em variáveis de ambiente do provedor.
- Limitar tamanho/tipo de arquivo e validar conteúdo importado.
- Usar URLs privadas/assinadas para arquivos internos.
- Não armazenar dados de pagamento de compradores.
- Não permitir que o navegador acesse chaves privilegiadas do banco.

## Implantação e domínio

Proposta: aplicação na Vercel (ou serviço equivalente) e banco/auth/storage no Supabase, ambos com ambientes separados de desenvolvimento e produção. O domínio `useorvian.com.br` será associado depois que o provedor escolhido estiver confirmado. Preferência por `painel.useorvian.com.br` para o sistema privado, mantendo a loja pública independente.

## Decisões ainda necessárias

- Provedor atual da loja/site e do DNS do domínio.
- Confirmar se Supabase e Vercel são aceitáveis.
- Formato do primeiro catálogo real (CSV, XLSX, XML ou PDF).
- Primeiro fornecedor nacional de moda fitness a integrar.
- Regras reais de custo e taxas de cada canal.

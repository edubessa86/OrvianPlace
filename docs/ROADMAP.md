# Roadmap — OrvianPlace

## Fase 0 — Fundação
- [x] Registrar objetivo, arquitetura proposta e roadmap.
- [ ] Confirmar stack e hospedagem.
- [ ] Configurar ambientes, variáveis e políticas de segurança.
- [ ] Criar aplicação web e pipeline de deploy.

## Fase 1 — Acesso administrativo
- [ ] Login/logout com Supabase Auth.
- [ ] Sem cadastro público.
- [ ] Proteção de rotas no servidor.
- [ ] Papel admin e tela inicial do painel.
- [ ] Testes de acesso não autenticado e usuário sem permissão.

## Fase 2 — Fornecedores e catálogo
- [ ] CRUD de fornecedores nacionais.
- [ ] Cadastro manual de produto e variante.
- [ ] Importação CSV/XLSX com prévia e validação.
- [ ] Deduplicação por SKU/fornecedor e relatório de erros.
- [ ] Upload privado de imagens e documentos.
- [ ] Busca, filtros e exportação.

## Fase 3 — Inteligência comercial
- [ ] Regras de custos por canal editáveis.
- [ ] Calculadora de preço, lucro e margem.
- [ ] Separar custos confirmados de estimativas.
- [ ] Ranking de oportunidades e filtros configuráveis.
- [ ] Histórico de custo e alterações.

## Fase 4 — Rascunhos de anúncios
- [ ] Modelos de título e descrição para moda fitness.
- [ ] Mapeamento de tamanhos, cores, categorias e atributos.
- [ ] Validação por canal.
- [ ] Aprovação manual antes de qualquer publicação.

## Fase 5 — Integrações
- [ ] Selecionar fornecedor que ofereça catálogo e estoque de forma autorizada.
- [ ] Implementar adaptador de fornecedor.
- [ ] Avaliar APIs oficiais do Mercado Livre e Shopee e requisitos de acesso.
- [ ] Adicionar Amazon após validar o fluxo inicial.
- [ ] Sincronização controlada de estoque/preço.
- [ ] Publicação somente após testes e ativação explícita.

## Critérios para considerar o MVP pronto

- Somente administrador autorizado consegue entrar.
- Dados persistem em banco online.
- Catálogo CSV/XLSX pode ser pré-visualizado e importado sem duplicar registros.
- Custos, taxas e margem são rastreáveis e configuráveis.
- Nenhum anúncio é publicado automaticamente.
- Segredos não aparecem no repositório nem no bundle do navegador.
- Deploy online e domínio configurados e testados.

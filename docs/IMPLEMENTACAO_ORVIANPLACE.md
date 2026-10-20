# OrvianPlace — plano de implementação

## Módulos conectados ao Supabase

- Autenticação de administrador: Supabase Auth + perfil administrativo + middleware.
- Fornecedores: cadastro, edição, busca e inativação.
- Catálogo: cadastro, edição, exclusão confirmada, fornecedor, SKU, marca, categoria, custo, preço sugerido, estoque, disponibilidade, descrição e URL de imagem.
- Variantes: tamanho, cor, SKU, custo e estoque.
- Imagens: upload de JPG/PNG/WebP para o bucket `product-images`; exige aplicar a migração `202610200002_product_image_storage.sql`.
- Importação: CSV/XLSX/XLS e tentativa de extração de texto de PDF; validação e prévia; histórico em `catalog_imports`; relatório de erros por linha.
- Precificação: regras por Mercado Livre, Shopee e Amazon, com comissão, tarifa fixa, imposto, frete e margem-alvo; cálculo estimado de preço recomendado e lucro líquido.
- Análises: margem bruta, ranking, distribuição por categoria e exportação CSV/JSON.
- Modelo de importação: `public/modelo_catalogo_orvian.csv`.

## Fórmula de precificação

Preço recomendado = (custo do produto + outros custos + tarifa fixa + frete subsidiado) / (1 - comissão - imposto - margem-alvo).

Todos os percentuais são inseridos como percentuais (por exemplo, 15 para 15%). A fórmula só é válida quando a soma de comissão, imposto e margem-alvo é menor que 100%. O cálculo é estimativo e depende da qualidade dos custos e taxas cadastrados.

## Importação de catálogos

A importação reconhece cabeçalhos comuns em português e inglês. A prévia deve ser revisada antes de confirmar. CSV/XLSX é o formato recomendado. PDF com texto selecionável é tratado por heurística e pode exigir correção manual; PDFs digitalizados como imagem não têm OCR nesta versão. Linhas inválidas ficam no relatório de erros; linhas válidas podem ser importadas separadamente.

## Marketplace

O OrvianPlace prepara os dados e mantém regras comerciais, mas não publica anúncios nem sincroniza estoque diretamente com os marketplaces nesta etapa. Integrações reais dependem de credenciais oficiais, mapeamento dos campos de cada canal, homologação e testes específicos. A exportação genérica não substitui o template oficial de cada marketplace.

## Migração de armazenamento de imagens

A migração `supabase/migrations/202610200002_product_image_storage.sql` cria o bucket público para exibição das imagens e permite operações de escrita apenas a administradores autenticados. Antes de usar upload de imagens, revise e execute essa migração no SQL Editor do projeto Supabase.

## Validação antes de produção

1. Conferir o último deployment da Vercel e corrigir eventuais erros de build.
2. Validar cadastro/edição/inativação de fornecedor.
3. Validar cadastro/edição/exclusão de produto e variantes.
4. Aplicar a migração de Storage e testar upload de imagem.
5. Importar uma planilha de teste e conferir linhas importadas e relatório de erros.
6. Configurar taxas reais dos canais e validar os cálculos com exemplos conhecidos.
7. Fazer backup e confirmar políticas RLS antes de qualquer uso operacional.
8. Validar os campos oficiais de cada marketplace antes de habilitar publicação ou sincronização.

Não inserir chaves secretas no código do navegador. A chave Supabase `service_role` nunca deve ser exposta ao cliente.

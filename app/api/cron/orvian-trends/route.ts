import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TrendDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  seo_title: string;
  seo_description: string;
  instagram_caption: string;
  facebook_caption: string;
};

const editorialPrompt = `Você é editora de conteúdo da Orvian, marca brasileira de moda feminina e fitness premium. Produza um conteúdo original em português brasileiro sobre moda, estilo, tendências de vestuário, fitness leve ou bem-estar cotidiano. Não invente dados, pesquisas, falas de especialistas, tendências atuais nem fontes. Baseie-se somente nos itens de pesquisa fornecidos; se forem insuficientes, crie um guia evergreen e deixe claro que é conteúdo inspiracional, sem alegar que é notícia do dia. Evite aconselhamento médico. Entregue SOMENTE JSON válido com: title (título até 75 caracteres), slug (minúsculo, sem acentos, hífens), excerpt (até 180 caracteres), content (4 a 6 parágrafos separados por duas quebras de linha), category (Moda, Fitness, Bem-estar ou Estilo), seo_title (até 60 caracteres), seo_description (até 155 caracteres), instagram_caption (texto curto com chamada e até 8 hashtags relevantes), facebook_caption (texto natural com chamada para ler no blog). Não copie trechos das fontes; sintetize e atribua fontes em separado.`;

async function collectSources(): Promise<Array<{ title: string; url: string; description: string }>> {
  const queries = [
    "moda feminina tendências estilo sustentável",
    "moda fitness feminina tendências roupas",
    "bem-estar rotina feminina estilo"
  ];
  const collected: Array<{ title: string; url: string; description: string }> = [];
  for (const query of queries) {
    try {
      const endpoint = "https://news.google.com/rss/search?q=" + encodeURIComponent(query + " when:7d") + "&hl=pt-BR&gl=BR&ceid=BR:pt-419";
      const response = await fetch(endpoint, { headers: { "user-agent": "OrvianTrends/1.0 editorial-bot" }, signal: AbortSignal.timeout(8000) });
      if (!response.ok) continue;
      const xml = await response.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 5);
      for (const match of items) {
        const block = match[1];
        const field = (name: string) => {
          const raw = block.match(new RegExp("<" + name + ">([\\s\\S]*?)<\/" + name + ">"))?.[1] ?? "";
          return raw.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
        };
        const title = field("title");
        const url = field("link");
        const description = field("description").replace(/<[^>]+>/g, " ").slice(0, 500);
        if (title && /^https?:\/\//.test(url) && !collected.some((item) => item.url === url)) collected.push({ title, url, description });
      }
    } catch { /* Uma fonte indisponível não deve interromper as demais. */ }
  }
  return collected.slice(0, 12);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!supabaseUrl || !serviceKey || !geminiApiKey) {
    return NextResponse.json({ error: "Configure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY e CRON_SECRET na Vercel." }, { status: 503 });
  }

  try {
    const sources = await collectSources();
    const now = new Date();
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
    const publishedAt = now.toISOString();
    const model = process.env.ORVIAN_TRENDS_MODEL || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": geminiApiKey, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: editorialPrompt }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify({ date: today, research: sources, instruction: "Crie um único artigo útil, original e prático. As fontes abaixo são pistas editoriais, não fatos automaticamente verificados. Inclua apenas afirmações sustentadas pelas informações disponíveis." }) }] }],
        generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
      }),
      signal: AbortSignal.timeout(45000)
    });
    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: "Falha ao gerar conteúdo com Gemini.", detail: detail.slice(0, 600) }, { status: 502 });
    }
    const result = await response.json();
    const raw = result.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("");
    if (!raw) throw new Error("O Gemini retornou conteúdo vazio.");
    const draft = JSON.parse(raw) as TrendDraft;
    const slug = (draft.slug || draft.title).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90) + "-" + today.replace(/-/g, "");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: existing } = await supabase.from("editorial_posts").select("id").eq("slug", slug).maybeSingle();
    if (existing) return NextResponse.json({ ok: true, skipped: true, reason: "Conteúdo do dia já existe.", slug });

    const { data, error } = await supabase.from("editorial_posts").insert({
      ...draft,
      slug,
      source_urls: sources.map(({ title, url }) => ({ title, url })),
      status: "published",
      featured: false,
      published_at: publishedAt
    }).select("id,slug,title,status,created_at,published_at").single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, message: "Artigo publicado automaticamente no blog da Orvian.", post: data, sources_count: sources.length });
  } catch (error) {
    return NextResponse.json({ error: "Não foi possível preparar o rascunho.", detail: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}

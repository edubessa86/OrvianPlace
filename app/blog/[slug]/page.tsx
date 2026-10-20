import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return post ? { title: post.seo_title || post.title, description: post.seo_description || post.excerpt } : { title: "Artigo | Orvian Trends" };
}

async function getPost(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase.from("editorial_posts")
    .select("slug,title,excerpt,content,category,source_urls,seo_title,seo_description,published_at,created_at")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  return data;
}

export default async function EditorialArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const paragraphs = String(post.content ?? "").split(/\n\n+/).filter(Boolean);
  return <main style={{ minHeight: "100vh", background: "#f7f5f2", color: "#17151b", fontFamily: "Arial,Helvetica,sans-serif" }}>
    <header style={{ padding: "24px clamp(20px,8vw,120px)", borderBottom: "1px solid #e7e1e8", display: "flex", justifyContent: "space-between" }}>
      <Link href="/" style={{ color: "#17151b", fontWeight: 900, letterSpacing: ".18em", textDecoration: "none" }}>ORVIAN<span style={{ color: "#8b35ed" }}>✦</span></Link>
      <Link href="/blog" style={{ color: "#6d2ca6", textDecoration: "none" }}>← Orvian Trends</Link>
    </header>
    <article style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(48px,8vw,100px) 22px 100px" }}>
      <p style={{ color: "#7d2cc5", letterSpacing: ".17em", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{post.category} · ORVIAN EDITORIAL</p>
      <h1 style={{ fontSize: "clamp(38px,7vw,72px)", lineHeight: 1.03, letterSpacing: "-.055em", margin: "24px 0" }}>{post.title}</h1>
      <p style={{ fontSize: 20, lineHeight: 1.7, color: "#69616d" }}>{post.excerpt}</p>
      <div style={{ height: 1, background: "#ded5e3", margin: "35px 0" }} />
      <div style={{ fontSize: 17, lineHeight: 1.95, whiteSpace: "pre-wrap" }}>{paragraphs.map((paragraph: string, i: number) => <p key={i} style={{ marginBottom: 24 }}>{paragraph}</p>)}</div>
      {Array.isArray(post.source_urls) && post.source_urls.length > 0 && <aside style={{ marginTop: 50, padding: 24, background: "#fff", fontSize: 13 }}><strong>Fontes e leituras complementares</strong><ul>{post.source_urls.map((source: unknown, i: number) => { const item = typeof source === "string" ? { url: source, title: source } : source as { url?: string; title?: string }; return item.url && /^https?:\/\//.test(item.url) ? <li key={i} style={{ marginTop: 10 }}><a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#762cb7" }}>{item.title || item.url}</a></li> : null; })}</ul></aside>}
      <p style={{ marginTop: 50 }}><Link href="/blog" style={{ color: "#762cb7" }}>← Ver todas as novidades</Link></p>
    </article>
  </main>;
}

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300;

type EditorialPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published_at: string | null;
  created_at: string;
};

async function getPosts(): Promise<EditorialPost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("editorial_posts")
    .select("id,slug,title,excerpt,category,published_at,created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data ?? []) as EditorialPost[];
}

export const metadata = {
  title: "Orvian Trends | Estilo, bem-estar e moda feminina",
  description: "Inspiração diária sobre moda feminina, estilo, movimento e bem-estar no universo Orvian.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <main className="trends-page">
      <header className="trends-header">
        <Link href="/" className="trends-brand">ORVIAN<span>✦</span></Link>
        <Link href="/" className="trends-back">Voltar à loja ↗</Link>
      </header>
      <section className="trends-hero">
        <p className="trends-eyebrow">ORVIAN EDITORIAL · ESTILO COM INTENÇÃO</p>
        <h1>Orvian <em>Trends.</em></h1>
        <p>Ideias, tendências e conversas que inspiram mulheres a vestir sua melhor versão — todos os dias.</p>
        <div className="trends-topics"><span>MODA</span><span>FITNESS</span><span>BEM-ESTAR</span><span>ESTILO REAL</span></div>
      </section>
      <section className="trends-content">
        <div className="trends-section-title"><div><p>LEITURAS PARA VOCÊ</p><h2>Novidades & inspiração</h2></div><span>01 / EDITORIAL</span></div>
        {posts.length ? (
          <div className="trends-grid">
            {posts.map((post) => (
              <article className="trends-card" key={post.id}>
                <div className="trends-card-art"><span>{post.category}</span><b>O.</b></div>
                <div className="trends-card-body">
                  <span className="trends-date">{new Date(post.published_at ?? post.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                  <h3>{post.title}</h3><p>{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`}>Ler matéria <span>↗</span></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="trends-empty">
            <span className="trends-empty-mark">O.</span>
            <div><h3>Uma nova conversa começa em breve.</h3><p>Estamos preparando conteúdos sobre estilo, movimento, bem-estar e tendências para a vida real.</p></div>
          </div>
        )}
      </section>
      <section className="trends-cta"><p>VISTA SUA MELHOR VERSÃO</p><h2>Seu estilo. Seu ritmo.<br/><em>Sua próxima versão.</em></h2><Link href="/#colecao">Explorar Orvian ↗</Link></section>
      <footer className="trends-footer"><span>© {new Date().getFullYear()} ORVIAN</span><span>MODA FEMININA · VISTA SUA MELHOR VERSÃO</span><Link href="/">useorvian.com.br</Link></footer>
      <style>{`
        .trends-page{min-height:100vh;background:#f7f5f2;color:#17151b;font-family:Arial,Helvetica,sans-serif}
        .trends-header{height:76px;padding:0 clamp(20px,6vw,88px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e7e1e8}
        .trends-brand{font-size:25px;letter-spacing:.19em;font-weight:900;color:#17151b;text-decoration:none}.trends-brand span{color:#8b35ed;margin-left:7px}
        .trends-back{font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#4d4654;text-decoration:none}
        .trends-hero{padding:clamp(66px,10vw,135px) clamp(20px,10vw,150px) 70px;background:radial-gradient(ellipse at 78% 30%,#e9d7fb 0,transparent 38%),#f0ebf2}
        .trends-eyebrow,.trends-section-title>div>p,.trends-cta>p{font-size:10px;font-weight:700;letter-spacing:.2em;color:#7834b9}
        .trends-hero h1{font-size:clamp(54px,10vw,118px);letter-spacing:-.075em;line-height:.95;margin:22px 0}.trends-hero h1 em,.trends-cta h2 em{font-family:Georgia,serif;font-weight:400;color:#7d2cc5}
        .trends-hero>p:not(.trends-eyebrow){max-width:570px;font-size:clamp(16px,2vw,20px);line-height:1.7;color:#5d5663}
        .trends-topics{display:flex;flex-wrap:wrap;gap:9px;margin-top:30px}.trends-topics span{border:1px solid #d3c6dc;border-radius:40px;padding:10px 14px;font-size:9px;letter-spacing:.12em}
        .trends-content{padding:80px clamp(20px,8vw,120px) 100px}.trends-section-title{display:flex;justify-content:space-between;align-items:end;margin-bottom:32px;gap:20px}.trends-section-title h2{font-size:clamp(28px,4vw,44px);letter-spacing:-.04em;margin:10px 0}.trends-section-title>span{font-size:10px;color:#837987;letter-spacing:.1em}
        .trends-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.trends-card{background:white;border:1px solid #eee8f0}.trends-card-art{height:170px;background:linear-gradient(135deg,#ded0ed,#f4e9f0 60%,#c9a9ed);display:flex;justify-content:space-between;align-items:start;padding:18px}.trends-card-art span{font-size:10px;letter-spacing:.12em;text-transform:uppercase}.trends-card-art b{font-size:62px;line-height:.8;color:#7d2cc5;opacity:.8}
        .trends-card-body{padding:24px}.trends-date{font-size:11px;color:#8a818f}.trends-card h3{font-size:22px;line-height:1.2;margin:14px 0}.trends-card p{font-size:14px;line-height:1.7;color:#69616d}.trends-card-body>a{display:inline-flex;gap:20px;margin-top:12px;color:#762cb7;font-size:12px;font-weight:700;text-decoration:none}
        .trends-empty{padding:34px;display:flex;gap:24px;align-items:center;background:white;border:1px solid #eee8f0}.trends-empty-mark{font-size:56px;font-weight:900;color:#8b35ed}.trends-empty h3{font-size:22px;margin:0 0 8px}.trends-empty p{margin:0;color:#716978;line-height:1.7}
        .trends-cta{padding:80px 20px;text-align:center;background:#19151f;color:white}.trends-cta>p{color:#c79aff}.trends-cta h2{font-size:clamp(34px,6vw,66px);line-height:1.08;letter-spacing:-.04em}.trends-cta a{display:inline-block;margin-top:14px;padding:15px 22px;background:#a44cf0;color:white;text-decoration:none;font-size:12px;font-weight:700}
        .trends-footer{padding:25px clamp(20px,6vw,88px);display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;font-size:10px;letter-spacing:.12em;color:#766e7a}.trends-footer a{color:inherit;text-decoration:none}
        @media(max-width:760px){.trends-grid{grid-template-columns:1fr}.trends-card-art{height:135px}.trends-section-title{align-items:start;flex-direction:column}.trends-empty{align-items:start;flex-direction:column}.trends-footer{flex-direction:column}}
      `}</style>
    </main>
  );
}

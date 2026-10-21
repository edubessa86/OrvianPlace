import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getEditorialImage, getEditorialImageAlt } from "../editorial-image";

export const revalidate = 300;

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return post ? { title: post.seo_title || post.title, description: post.seo_description || post.excerpt } : { title: "Artigo | Orvian Trends" };
}

export default async function EditorialArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const paragraphs = String(post.content ?? "").split(/\n\n+/).filter(Boolean);
  const date = new Date(post.published_at ?? post.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const sources = Array.isArray(post.source_urls) ? post.source_urls : [];
  return <main className="orvian-article-page">
    <div className="oa-announcement"><span>ORVIAN STUDIO</span><span>Moda fitness feminina, no seu ritmo.</span><span>EDITORIAL / TRENDS</span></div>
    <header className="oa-header">
      <Link href="/" className="oa-wordmark"><img src="/orvian-logo.svg" alt="ORVIAN" /><small>MODA FITNESS FEMININA</small></Link>
      <nav aria-label="Navegação principal"><Link href="/colecoes">Coleções</Link><Link href="/novidades">Novidades</Link><Link href="/essencia">Nossa essência</Link><Link href="/blog">Blog</Link><Link href="/contato">Fale conosco</Link></nav>
      <Link href="/#lista" className="oa-back">ENTRE PARA A LISTA ↗</Link>
    </header>
    <div className="oa-breadcrumb"><Link href="/">INÍCIO</Link><span>/</span><Link href="/blog">ORVIAN TRENDS</Link><span>/</span><span>{post.category || "EDITORIAL"}</span></div>
    <article className="oa-article">
      <header className="oa-article-heading">
        <p className="oa-kicker"><span>ORVIAN EDITORIAL</span><i>✳</i>{post.category || "TRENDS"}</p>
        <h1>{post.title}</h1>
        <p className="oa-excerpt">{post.excerpt}</p>
        <div className="oa-byline"><span>ORVIAN STUDIO</span><span>{date}</span><span>LEITURA EDITORIAL</span></div>
      </header>
      <div className="oa-cover" role="img" aria-label={getEditorialImageAlt(post.title)} style={{ backgroundImage: `linear-gradient(0deg, rgba(25, 43, 34, .42), rgba(25, 43, 34, .02) 65%), url("${getEditorialImage(post.title, post.category)}")` }}><span className="oa-cover-category">{post.category || "ORVIAN TRENDS"}</span><span className="oa-cover-mark">O.</span><span className="oa-cover-caption">STYLE WITH INTENTION — THE EVERYDAY EDIT</span><span className="oa-cover-index">ORVIAN / 001</span></div>
      <div className="oa-body">
        <aside className="oa-side-note"><span>IN THIS STORY</span><p>Estilo<br/>Movimento<br/>Vida real</p><div>O.</div></aside>
        <div className="oa-prose">{paragraphs.map((paragraph: string, i: number) => <p key={i}>{paragraph}</p>)}</div>
      </div>
      {sources.length > 0 && <aside className="oa-sources"><p className="oa-kicker">LEITURAS COMPLEMENTARES</p><h2>Fontes & referências.</h2><ul>{sources.map((source: unknown, i: number) => { const item = typeof source === "string" ? { url: source, title: source } : source as { url?: string; title?: string }; return item.url && /^https?:\/\//.test(item.url) ? <li key={i}><a href={item.url} target="_blank" rel="noreferrer">{item.title || item.url}<span>↗</span></a></li> : null; })}</ul></aside>}
      <div className="oa-article-end"><span>FIM DA MATÉRIA</span><span>✳</span><span>ORVIAN STUDIO</span></div>
    </article>
    <section className="oa-next"><div><p className="oa-kicker">CONTINUE EXPLORANDO</p><h2>Mais ideias para<br/><em>mover você.</em></h2></div><Link href="/blog">VOLTAR AO ARQUIVO <span>↗</span></Link></section>
    <footer className="oa-footer"><Link href="/" className="oa-footer-brand">ORVIAN<span>®</span></Link><span>© {new Date().getFullYear()} ORVIAN STUDIO</span><span>MODA FEMININA · VISTA SUA MELHOR VERSÃO</span><div className="oa-footer-service"><span>ATENDIMENTO</span><Link href="/contato">CONTATO</Link><Link href="/entrega">ENTREGA</Link><Link href="/devolucao">TROCAS & DEVOLUÇÕES</Link><Link href="/perguntas-frequentes">PERGUNTAS FREQUENTES</Link></div><Link href="https://www.instagram.com/_useorvian/" target="_blank" rel="noreferrer">INSTAGRAM ↗</Link></footer>
    <style>{`
      .orvian-article-page{--oa-ink:#28483a;--oa-paper:#faf9f6;--oa-purple:#28483a;min-height:100vh;background:var(--oa-paper);color:var(--oa-ink);font-family:'DM Sans',Arial,sans-serif}.orvian-article-page *{box-sizing:border-box}.orvian-article-page a{color:inherit;text-decoration:none}
      .oa-announcement{height:34px;background:#28483a;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 6.2%;font-size:9px;letter-spacing:.12em;text-transform:uppercase}.oa-announcement span:first-child{font-weight:800}.oa-announcement span:nth-child(2){color:#d9e0da}
      .oa-header{min-height:91px;padding:18px 6.2%;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:clamp(18px,3vw,46px);border-bottom:1px solid #e9e6df;background:#faf9f6}.oa-header nav{display:flex;justify-content:flex-start;gap:clamp(12px,1.5vw,24px)}.oa-header nav a,.oa-back{font-size:9px;letter-spacing:.09em;text-transform:uppercase;color:#514b55}.oa-wordmark{display:flex;flex-direction:column;align-items:center;gap:7px;white-space:nowrap}.oa-wordmark img{display:block;width:145px;max-height:34px;object-fit:contain;object-position:left center}.oa-wordmark small{display:block;font-size:8px;letter-spacing:1.6px;font-weight:500;color:#85877f}.oa-back{justify-self:end;background:transparent;color:#28483a!important;padding:13px 16px;border:1px solid #28483a;font-size:9px;letter-spacing:.1em}
      .oa-breadcrumb{display:flex;gap:12px;align-items:center;padding:23px clamp(20px,8vw,120px);font-size:8px;letter-spacing:.12em;color:#89818d}.oa-breadcrumb a{color:#4f4755}.oa-article{max-width:1200px;margin:0 auto;padding:28px clamp(20px,6vw,80px) 85px}.oa-article-heading{max-width:900px;margin:0 auto 40px;text-align:center}.oa-kicker{font-size:9px;letter-spacing:.16em;font-weight:700;color:#647467}.oa-kicker i{font-style:normal;color:#b69b78;margin:0 12px}.oa-article-heading h1{font-family:'Manrope','DM Sans',sans-serif;font-size:clamp(40px,7vw,86px);line-height:.98;letter-spacing:-.07em;margin:25px 0 22px}.oa-excerpt{font-size:clamp(16px,2vw,20px);line-height:1.75;color:#69616d;max-width:720px;margin:0 auto}.oa-byline{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-top:28px;padding-top:18px;border-top:1px solid #e3dce6;font-size:8px;letter-spacing:.13em;color:#837987}
      .oa-cover{min-height:clamp(230px,35vw,440px);position:relative;overflow:hidden;background-color:#dfe5dd;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center}.oa-cover:before,.oa-cover:after{content:"";position:absolute;width:65%;aspect-ratio:1;border:1px solid #fff9;border-radius:50%}.oa-cover:after{width:45%}.oa-cover-category{position:absolute;top:22px;left:22px;background:#faf9f6;padding:9px 12px;font-size:8px;letter-spacing:.13em}.oa-cover-mark{position:relative;z-index:1;font-size:clamp(100px,22vw,260px);font-weight:900;letter-spacing:-.13em;color:#faf9f6}.oa-cover-caption{position:absolute;bottom:22px;left:22px;font-size:8px;letter-spacing:.13em}.oa-cover-index{position:absolute;right:22px;bottom:22px;font-size:8px;letter-spacing:.13em}
      .oa-body{display:grid;grid-template-columns:150px minmax(0,700px);gap:clamp(25px,7vw,100px);justify-content:center;padding:60px 0 30px}.oa-side-note{position:relative;border-top:1px solid #cfc3d6;padding-top:15px;align-self:start;font-size:8px;letter-spacing:.13em;color:#7c7181}.oa-side-note p{font-size:12px;line-height:2;color:#332b39;letter-spacing:0}.oa-side-note div{font-size:100px;font-weight:900;letter-spacing:-.13em;color:#eee3f5;margin-top:55px}.oa-prose{font-size:17px;line-height:2;color:#39333d;white-space:pre-wrap}.oa-prose p{margin:0 0 27px}.oa-prose p:first-child:first-letter{float:left;font-size:4.1em;line-height:.82;padding:8px 10px 0 0;color:var(--oa-purple);font-weight:800}
      .oa-sources{max-width:700px;margin:30px auto 0;padding:28px;background:#fff;border:1px solid #e9e2eb}.oa-sources h2{font-size:25px;letter-spacing:-.04em;margin:10px 0 20px}.oa-sources ul{list-style:none;padding:0;margin:0}.oa-sources li{border-top:1px solid #eee7f1;padding:14px 0}.oa-sources li a{display:flex;justify-content:space-between;gap:15px;font-size:13px;line-height:1.6;color:#55465f}.oa-sources li span{color:var(--oa-purple)}.oa-article-end{display:flex;justify-content:space-between;align-items:center;max-width:700px;margin:45px auto 0;padding-top:18px;border-top:1px solid #ded5e3;font-size:8px;letter-spacing:.15em;color:#817687}.oa-article-end span:nth-child(2){color:var(--oa-purple);font-size:18px}
      .oa-next{background:#28483a;color:#fff;padding:clamp(50px,8vw,95px) clamp(20px,8vw,120px);display:flex;align-items:end;justify-content:space-between;gap:25px}.oa-next .oa-kicker{color:#d4c5a9}.oa-next h2{font-family:'Manrope','DM Sans',sans-serif;font-size:clamp(35px,5vw,64px);line-height:1.03;letter-spacing:-.055em;margin:18px 0 0}.oa-next h2 em{font-family:Georgia,serif;color:#c69af5;font-weight:400}.oa-next>a{background:#faf9f6;color:#28483a;padding:16px 18px;font-size:9px;letter-spacing:.1em;white-space:nowrap}.oa-next>a span{margin-left:20px;font-size:15px}.oa-footer{padding:27px clamp(20px,5vw,76px);display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;border-top:1px solid #e4dde7;font-size:8px;letter-spacing:.12em;color:#77707c}.oa-footer-brand{font-size:20px;font-weight:900;letter-spacing:.15em;color:#28483a!important}.oa-footer-service{display:flex;gap:14px;align-items:center;flex-wrap:wrap}.oa-footer-service span{font-size:8px;letter-spacing:.12em;color:#28483a;font-weight:700}
      @media(max-width:760px){.oa-header{grid-template-columns:1fr auto;height:auto;padding-top:18px;padding-bottom:15px}.oa-header nav{grid-column:1/-1;grid-row:2;overflow:auto;justify-content:flex-start;padding:12px 0 0}.oa-header nav a{white-space:nowrap}.oa-wordmark{grid-column:1;grid-row:1;text-align:left}.oa-wordmark img{width:125px}.oa-back{grid-column:2;grid-row:1;font-size:8px;padding:11px 9px}.oa-breadcrumb{flex-wrap:wrap}.oa-body{grid-template-columns:1fr;gap:10px;padding-top:35px}.oa-side-note{display:none}.oa-prose{font-size:16px}.oa-next{align-items:flex-start;flex-direction:column}.oa-footer{align-items:flex-start;flex-direction:column}}
      @media(max-width:520px){.oa-announcement span:nth-child(2){display:none}.oa-article{padding-top:10px}.oa-article-heading h1{font-family:'Manrope','DM Sans',sans-serif;font-size:clamp(38px,11vw,56px)}.oa-byline{gap:10px}.oa-cover{min-height:230px}.oa-cover-caption{max-width:60%;line-height:1.5}.oa-sources{padding:20px}}
    `}</style>
  </main>;
}

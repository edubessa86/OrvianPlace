"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Post = { id: string; slug: string; title: string; excerpt: string; category: string; published_at: string | null; created_at: string };

export default function HomeTrends() {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("editorial_posts")
          .select("id,slug,title,excerpt,category,published_at,created_at")
          .eq("status", "published").order("published_at", { ascending: false }).limit(3);
        if (data) setPosts(data as Post[]);
      } catch { /* A vitrine continua funcionando se a tabela ainda não estiver disponível. */ }
    };
    void load();
  }, []);

  return <section className="orvian-home-trends" id="orvian-trends">
    <div className="oht-heading"><div><p>06 / EDITORIAL ORVIAN</p><h2>Ideias para<br/><em>inspirar você.</em></h2></div><div className="oht-heading-side"><span>ESTILO COM INTENÇÃO</span><p>Inspiração, estilo e conversas para a vida real.</p><Link href="/blog">VER TODAS AS MATÉRIAS ↗</Link></div></div>
    {posts.length ? <div className="oht-grid">{posts.map((post, index) => <article key={post.id} className="oht-card">
      <div className={`oht-art oht-art-${index}`}><span>{post.category || "EDITORIAL ORVIAN"}</span><b>0{index + 1}</b><i>O.</i><small>EDIÇÃO PARA A VIDA REAL</small></div>
      <div className="oht-copy"><small>{new Date(post.published_at ?? post.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</small><h3>{post.title}</h3><p>{post.excerpt}</p><Link href={`/blog/${post.slug}`}>LER MATÉRIA <span>↗</span></Link></div>
    </article>)}</div> : <div className="oht-empty"><span>O.</span><div><p>EDITORIAL ORVIAN / EM BREVE</p><strong>Novas ideias estão a caminho.</strong><span>Em breve, conteúdo sobre moda, fitness, bem-estar e estilo real.</span></div></div>}
    <div className="oht-bottom"><span>ESTILO COM INTENÇÃO · NO SEU RITMO</span><Link href="/blog">EXPLORAR O BLOG <span>↗</span></Link></div>
    <style>{`
      .orvian-home-trends{background:#faf9f6;color:#28483a;padding:clamp(55px,8vw,110px) clamp(20px,8vw,120px);font-family:'DM Sans',Arial,Helvetica,sans-serif}.orvian-home-trends *{box-sizing:border-box}.orvian-home-trends a{color:inherit;text-decoration:none}
      .oht-heading{display:flex;justify-content:space-between;align-items:end;gap:25px;margin-bottom:40px}.oht-heading>div:first-child>p,.oht-heading-side>span,.oht-empty>div>p{font-size:9px;letter-spacing:.16em;font-weight:700;color:#647467}.oht-heading h2{font-size:clamp(43px,6vw,76px);line-height:.94;letter-spacing:-.065em;margin:18px 0 0}.oht-heading h2 em{font-family:Georgia,serif;font-weight:400;color:#a7835e}.oht-heading-side{max-width:280px}.oht-heading-side>span{color:#71756d}.oht-heading-side p{font-size:13px;line-height:1.7;color:#71756d}.oht-heading-side>a{display:inline-block;margin-top:8px;padding-bottom:8px;border-bottom:1px solid #a7835e;font-size:8px;letter-spacing:.12em}
      .oht-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.oht-card{min-width:0}.oht-art{height:clamp(160px,20vw,250px);position:relative;overflow:hidden;padding:17px;display:flex;align-items:flex-start;justify-content:space-between;background:linear-gradient(135deg,#e8e8df,#faf9f6 58%,#d9e0da)}.oht-art-1{background:linear-gradient(135deg,#e9e6df,#faf9f6 55%,#a7835e)}.oht-art-2{background:linear-gradient(135deg,#e9e6df,#faf9f6 60%,#a7835e)}.oht-art>span{font-size:8px;letter-spacing:.12em;background:#faf9f6;padding:7px}.oht-art>b{font-size:10px;letter-spacing:.1em}.oht-art>i{position:absolute;bottom:-35px;left:8px;font-size:clamp(115px,15vw,190px);font-weight:900;letter-spacing:-.13em;font-style:normal;color:#28483a12}.oht-art>small{position:absolute;bottom:17px;right:17px;font-size:7px;letter-spacing:.12em}.oht-copy{padding:20px 0 10px}.oht-copy>small{font-size:10px;color:#71756d}.oht-copy h3{font-size:clamp(18px,2vw,25px);line-height:1.2;letter-spacing:-.035em;margin:12px 0}.oht-copy>p{font-size:13px;line-height:1.7;color:#71756d}.oht-copy>a{display:inline-flex;gap:22px;margin-top:8px;padding-bottom:8px;border-bottom:1px solid #a7835e;font-size:8px;font-weight:700;letter-spacing:.12em}.oht-copy>a span,.oht-bottom>a span{font-size:14px;color:#a7835e}
      .oht-empty{display:flex;gap:25px;align-items:center;padding:28px;background:#f1f0e9;border:1px solid #e9e6df}.oht-empty>span{font-size:60px;font-weight:900;letter-spacing:-.1em;color:#a7835e}.oht-empty>div>p{margin:0 0 10px}.oht-empty>div>strong{display:block;font-size:23px}.oht-empty>div>span{display:block;margin-top:8px;font-size:13px;line-height:1.7;color:#71756d}.oht-bottom{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:38px;padding-top:18px;border-top:1px solid #e9e6df}.oht-bottom>span{font-size:8px;letter-spacing:.13em;color:#71756d}.oht-bottom>a{display:flex;align-items:center;gap:20px;font-size:8px;letter-spacing:.12em;font-weight:700}
      @media(max-width:760px){.oht-heading{align-items:flex-start;flex-direction:column}.oht-heading-side{max-width:450px}.oht-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 18px}.oht-art{height:200px}}
      @media(max-width:520px){.oht-grid{grid-template-columns:1fr}.oht-art{height:235px}.oht-bottom{align-items:flex-start;flex-direction:column}.oht-empty{align-items:flex-start;flex-direction:column}}
    `}</style>
  </section>;
}

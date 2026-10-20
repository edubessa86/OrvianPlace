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
      } catch { /* A vitrine continua funcionando se a tabela ainda não foi criada. */ }
    };
    void load();
  }, []);

  return <section className="store-trends" id="orvian-trends">
    <div className="store-section-heading"><div><p className="store-eyebrow">ORVIAN EDITORIAL</p><h2>Ideias que acompanham<br/><em>o seu movimento.</em></h2></div><p>Inspiração, estilo e conversas para a vida real.</p></div>
    {posts.length ? <div className="store-trends-grid">{posts.map((post) => <article key={post.id} className="store-trends-card">
      <div className="store-trends-art"><span>{post.category}</span><b>O.</b></div>
      <div className="store-trends-copy"><small>{new Date(post.published_at ?? post.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</small><h3>{post.title}</h3><p>{post.excerpt}</p><Link href={`/blog/${post.slug}`}>Ler matéria ↗</Link></div>
    </article>)}</div> : <div className="store-trends-placeholder"><span>O.</span><div><strong>Novas ideias estão a caminho.</strong><p>Em breve, conteúdo sobre moda, fitness, bem-estar e estilo real.</p></div></div>}
    <Link className="store-trends-all" href="/blog">Explorar Orvian Trends <span>↗</span></Link>
  </section>;
}

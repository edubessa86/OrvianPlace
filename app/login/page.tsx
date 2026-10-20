"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const reason = searchParams.get("reason");
  const next = searchParams.get("next");
  const configurationError = reason === "config";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setErrorMessage("Não foi possível entrar. Confira o e-mail e a senha e tente novamente.");
        return;
      }
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
      router.refresh();
    } catch {
      setErrorMessage("Não foi possível conectar ao Supabase. Confira as variáveis de ambiente da aplicação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><div className="brand-mark">O</div><div><strong>ORVIAN<span>PLACE</span></strong><small>COMMERCE INTELLIGENCE</small></div></div>
        <div className="auth-icon"><LockKeyhole size={22}/></div>
        <p className="auth-eyebrow">ÁREA ADMINISTRATIVA</p>
        <h1>Acesse seu espaço.</h1>
        <p className="auth-description">Entre com as credenciais do administrador da ORVIAN.</p>

        {configurationError && <div className="auth-error">A aplicação ainda não está configurada com as variáveis públicas do Supabase. Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel e faça um novo deploy.</div>}
        {errorMessage && <div className="auth-error" role="alert">{errorMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>E-mail<div className="auth-input-wrap"><Mail size={17}/><input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/></div></label>
          <label>Senha<div className="auth-input-wrap"><LockKeyhole size={17}/><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha"/></div></label>
          <button className="auth-submit" type="submit" disabled={loading || configurationError}>{loading ? "Entrando..." : "Entrar no OrvianPlace"}</button>
        </form>
        <div className="auth-security"><ShieldCheck size={16}/><span>Acesso restrito a usuários autorizados.</span></div>
      </section>
      <p className="auth-footnote">ORVIANPLACE · PAINEL PRIVADO</p>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="auth-page"><div className="auth-card">Carregando acesso seguro...</div></main>}><LoginForm /></Suspense>;
}

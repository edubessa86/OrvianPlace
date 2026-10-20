import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-icon"><ShieldAlert size={22}/></div>
        <p className="auth-eyebrow">ACESSO RESTRITO</p>
        <h1>Perfil não autorizado.</h1>
        <p className="auth-description">Sua conta está autenticada, mas não possui um perfil de administrador ativo no OrvianPlace. Solicite ao administrador que confira o registro em public.profiles.</p>
        <Link className="auth-submit auth-link-button" href="/login">Voltar para o login</Link>
      </section>
    </main>
  );
}

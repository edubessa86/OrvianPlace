import { NextRequest, NextResponse } from "next/server";

const recipient = "Useorvian@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();
    const website = String(body.website ?? "").trim();

    // Basic bot trap: bots often fill hidden fields.
    if (website) return NextResponse.json({ ok: true });
    if (name.length < 2 || name.length > 100) return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    if (subject.length > 160 || message.length < 5 || message.length > 5000) return NextResponse.json({ error: "Confira o assunto e a mensagem (máximo de 5.000 caracteres)." }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL;
    if (!apiKey || !from) {
      console.error("Contact form requires RESEND_API_KEY and CONTACT_FROM_EMAIL environment variables.");
      return NextResponse.json({ error: "O formulário está sendo configurado. Por enquanto, envie um e-mail para Useorvian@gmail.com." }, { status: 503 });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: email,
        subject: `Contato pelo site Orvian: ${subject}`,
        text: `Nova mensagem recebida pelo formulário da Orvian.\n\nNome: ${name}\nE-mail: ${email}\nAssunto: ${subject}\n\nMensagem:\n${message}`,
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Contact email provider returned status", response.status);
      return NextResponse.json({ error: "Não foi possível enviar agora. Tente novamente mais tarde ou escreva para Useorvian@gmail.com." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível processar sua mensagem. Confira os campos e tente novamente." }, { status: 400 });
  }
}

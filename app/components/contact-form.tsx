"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar sua mensagem.");
      setStatus("success");
      setMessage("Mensagem enviada! Obrigado por entrar em contato com a Orvian.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.");
    }
  }

  return <form className="oi-form" onSubmit={handleSubmit}>
    <p className="oi-label">ENVIE SUA MENSAGEM</p>
    <h3>Como podemos ajudar?</h3>
    <label>Nome<input name="name" autoComplete="name" required maxLength={100} placeholder="Seu nome" /></label>
    <label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="voce@email.com" /></label>
    <label>Assunto<select name="subject" required defaultValue=""><option value="" disabled>Selecione um assunto</option><option>Dúvida sobre produtos</option><option>Pedido e entrega</option><option>Trocas e devoluções</option><option>Parcerias</option><option>Outro assunto</option></select></label>
    <label>Mensagem<textarea name="message" required minLength={5} maxLength={5000} rows={5} placeholder="Escreva sua mensagem aqui..." /></label>
    <button type="submit" disabled={status === "sending"}>{status === "sending" ? "ENVIANDO..." : "ENVIAR MENSAGEM"} <span>↗</span></button>
    {message && <p className={`oi-form-status ${status}`} role="status">{message}</p>}
    <small>Seus dados serão usados somente para responder ao seu contato.</small>
  </form>;
}

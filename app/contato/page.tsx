import EditorialInfoPage from "@/app/components/editorial-info-page";

export const metadata = { title: "Contato | ORVIAN", description: "Entre em contato com a ORVIAN." };

export default function ContactPage() {
  return <EditorialInfoPage kind="contact" eyebrow="CONTATO" title="Toda boa conversa" emphasis="começa aqui." intro="A Orvian acredita que estilo também é escuta. Queremos conhecer suas dúvidas, ideias e sugestões." sections={[]} />;
}

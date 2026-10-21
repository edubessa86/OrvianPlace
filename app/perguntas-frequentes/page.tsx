import EditorialInfoPage from "@/app/components/editorial-info-page";

export const metadata = { title: "Perguntas frequentes | ORVIAN", description: "Respostas iniciais para dúvidas frequentes sobre a ORVIAN." };

export default function FAQPage() {
  return <EditorialInfoPage kind="faq" eyebrow="ATENDIMENTO / FAQ" title="Dúvidas?" emphasis="Vamos simplificar." intro="Reunimos respostas iniciais para ajudar você a conhecer a loja e a se preparar para comprar com a Orvian." sections={[
    { title: "A loja já está vendendo?", body: "O site está em fase de preparação visual. Produtos, preços, disponibilidade e condições de compra deverão ser confirmados antes do lançamento comercial." },
    { title: "Como entro em contato com a Orvian?", body: "Você pode escrever para useorvian@gmail.com ou acessar a página Contato para encontrar nossos canais oficiais." },
    { title: "Como sei o prazo de entrega?", body: "Quando as vendas estiverem disponíveis, o prazo estimado deverá aparecer durante a compra, de acordo com o CEP e a modalidade de envio." },
    { title: "Posso solicitar troca ou devolução?", body: "As orientações e condições definitivas serão apresentadas na página Trocas e devoluções antes do início das vendas. Em caso de dúvida, fale com nosso atendimento." },
    { title: "Como acompanho novidades e conteúdos?", body: "Acesse o Blog / Orvian Trends para acompanhar conteúdos editoriais e siga nossos canais sociais para novidades sobre a marca." }
  ]} />;
}

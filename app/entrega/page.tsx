import EditorialInfoPage from "@/app/components/editorial-info-page";

export const metadata = { title: "Entrega | ORVIAN", description: "Informações sobre entrega e envio de pedidos ORVIAN." };

export default function DeliveryPage() {
  return <EditorialInfoPage eyebrow="ATENDIMENTO / ENTREGA" title="Seu pedido," emphasis="no seu ritmo." intro="Queremos que sua experiência com a Orvian seja simples desde a escolha até a chegada do pedido. Abaixo, uma visão inicial de como as entregas poderão funcionar." sections={[
    { title: "Preparação do pedido", body: "Após a confirmação do pagamento, o pedido será preparado para envio. O prazo de preparação e a disponibilidade de cada item serão informados na confirmação da compra." },
    { title: "Prazo de entrega", body: "O prazo estimado deverá ser apresentado no checkout conforme o CEP, o método de envio e a disponibilidade do produto. Finais de semana, feriados e situações excepcionais podem afetar a previsão." },
    { title: "Acompanhamento", body: "Quando o pedido for despachado, a ideia é disponibilizar um código ou link de rastreamento, sempre que o serviço de transporte oferecer esse recurso." },
    { title: "Endereço e recebimento", body: "Confira atentamente o endereço antes de concluir a compra. Se perceber algum dado incorreto, entre em contato o quanto antes; alterações podem não ser possíveis após a expedição." }
  ]} />;
}

import EditorialInfoPage from "@/app/components/editorial-info-page";

export const metadata = { title: "Trocas e devoluções | ORVIAN", description: "Informações iniciais sobre trocas, devoluções e reembolsos ORVIAN." };

export default function ReturnsPage() {
  return <EditorialInfoPage eyebrow="ATENDIMENTO / TROCAS & DEVOLUÇÕES" title="Comprar com" emphasis="tranquilidade." intro="Queremos que você se sinta segura em cada etapa da experiência. Estas orientações são um texto inicial e serão ajustadas à política comercial definitiva da loja." sections={[
    { title: "Como solicitar", body: "Se precisar de ajuda com um pedido, entre em contato pelo e-mail useorvian@gmail.com e informe o número do pedido, o item e o motivo da solicitação. Nossa equipe orientará os próximos passos." },
    { title: "Condições do produto", body: "Para análise de troca ou devolução, poderemos solicitar fotos e informações sobre o estado do item, etiquetas e embalagem. As condições aplicáveis serão comunicadas antes da abertura das vendas." },
    { title: "Reembolso", body: "Quando houver reembolso aprovado, o processamento seguirá o meio de pagamento utilizado e os prazos da instituição financeira ou do provedor de pagamento." },
    { title: "Direitos do consumidor", body: "As condições finais serão publicadas de forma clara e observarão a legislação brasileira aplicável, inclusive as regras de compras realizadas pela internet." }
  ]} />;
}

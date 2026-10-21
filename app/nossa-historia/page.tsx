import EditorialInfoPage from "@/app/components/editorial-info-page";

export const metadata = { title: "Nossa história | ORVIAN", description: "Conheça o universo e os valores da ORVIAN." };

export default function OurStoryPage() {
  return <EditorialInfoPage kind="story" eyebrow="NOSSA HISTÓRIA" title="Mais do que vestir." emphasis="É se reconhecer." intro="A ORVIAN nasce de uma ideia simples: a roupa deve acompanhar quem você é — e não dizer quem você precisa ser." sections={[
    { title: "O movimento é seu", body: "Acreditamos que cada pessoa tem seu próprio ritmo. O movimento pode ser um treino, uma caminhada, um novo começo ou simplesmente um momento para cuidar de si. Nosso universo celebra essa liberdade, sem fórmulas prontas e sem comparações." },
    { title: "Estilo que acompanha a vida real", body: "Buscamos uma estética contemporânea que une conforto, personalidade e versatilidade. A inspiração fitness vai além da academia: ela encontra espaço na rotina, nos encontros e nos pequenos momentos em que você se sente bem consigo mesma." },
    { title: "Nossa essência", body: "Queremos construir uma marca próxima, atenta e em constante evolução. Valorizamos escolhas conscientes, comunicação transparente e uma experiência que respeite o tempo e as expectativas de cada cliente." },
    { title: "Vista sua melhor versão", body: "ORVIAN é um convite para se movimentar do seu jeito, experimentar, descobrir e vestir aquilo que faz sentido para você. Seu estilo. Seu ritmo. Sua história." }
  ]} />;
}

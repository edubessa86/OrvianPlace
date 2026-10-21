const editorialImages = {
  fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85",
  fitness: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=85",
  wellness: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1600&q=85",
  style: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=85",
  sustainable: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85",
  default: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=85",
};

export function getEditorialImage(title: string, category = "") {
  const text = `${title} ${category}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/sustent|ecologic|recicla|consci[eê]ncia|slow fashion|ambient/.test(text)) return editorialImages.sustainable;
  if (/fitness|treino|academia|legging|esportiv|movimento|exerc[ií]cio|yoga|pilates|corrida/.test(text)) return editorialImages.fitness;
  if (/bem-estar|bem estar|sa[uú]de|rotina|descanso|equil[ií]brio|autocuidado|mindfulness/.test(text)) return editorialImages.wellness;
  if (/estilo|look|combina|tend[eê]ncia|acess[oó]rio|vestir|cores|eleg[aâ]ncia/.test(text)) return editorialImages.style;
  if (/moda|roupa|femin|cole[cç][aã]o|pe[cç]as|guarda-roupa/.test(text)) return editorialImages.fashion;
  return editorialImages.default;
}

export function getEditorialImageAlt(title: string) {
  return `Imagem editorial ilustrativa sobre: ${title}`;
}

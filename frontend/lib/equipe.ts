// Conteúdo institucional da Home (Sobre + Equipe + números reais do projeto).

export const STORY: string[] = [
  "O ContraDito nasceu na disciplina de Métodos de Desenvolvimento de Software (MDS), na Faculdade de Ciências e Tecnologias em Engenharia (FCTE) da Universidade de Brasília, em 2026. A pergunta que moveu a Squad 09 era simples e incômoda: por que é tão difícil, para um cidadão comum, descobrir o que um parlamentar de fato discursou — e como ele votou?",
  "A informação existe. Está pública nos portais da Câmara dos Deputados e do Senado Federal, mas espalhada, técnica e cansativa de garimpar. O ContraDito reúne discursos, votações e proposições das duas casas num só lugar e deixa você consultar e cruzar esses dados livremente.",
  "Sem notas, sem rótulos, sem ranking: a plataforma não decide quem é “coerente” ou “incoerente”. Ela organiza o registro oficial e devolve a leitura — e o juízo — a quem importa: você.",
];

export type Membro = {
  nome: string;
  papel: string;
  handle: string;
  tags: string[];
  linkedin?: string;
  email?: string;
};

export const EQUIPE: Membro[] = [
  { nome: "Henrique Mendes", papel: "Scrum Master · Lead Fullstack", handle: "henriquemendeselias", tags: ["Scrum Master", "Extração de Dados", "Lead Fullstack"] },
  { nome: "Luiz Henrique Tomaz", papel: "Fullstack", handle: "luizhtmoreira", tags: ["Fullstack", "IA / NLP", "Arquitetura", "Extração", "Frontend"] },
  { nome: "Matheus Rodrigues", papel: "Documentação & DevOps", handle: "matheus0346", tags: ["Documentação (MkDocs)", "Docker / DevOps"] },
  { nome: "João Guilherme Amâncio", papel: "Product Owner · Lead Fullstack", handle: "jot4-ge", tags: ["Product Owner", "Lead Fullstack", "API", "Extração", "Frontend"] },
  { nome: "Gabriel Portácio", papel: "Frontend", handle: "G2SBiell", tags: ["Frontend"] },
  { nome: "Lucas Araújo Lima", papel: "Documentação & DevOps", handle: "lucasaraujoszz", tags: ["Documentação (MkDocs)", "Docker / DevOps"] },
];

// Números reais do projeto (Supabase, 2026-06-25).
export const PROJECT_STATS = [
  { value: "887", label: "parlamentares", sub: "642 Câmara · 245 Senado" },
  { value: "53.329", label: "discursos extraídos", sub: "49.731 Câmara · 3.598 Senado" },
  { value: "2.573", label: "proposições cruzadas", sub: "1.372 Câmara · 1.201 Senado" },
  { value: "51.611", label: "votos nominais", sub: "47.966 Câmara · 3.645 Senado" },
] as const;

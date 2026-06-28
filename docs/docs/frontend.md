# Frontend e Interface

Este documento detalha a arquitetura da interface de usuário do **ContraDito**, desenvolvida para atender às demandas de jornalistas investigativos e cidadãos engajados. O objetivo central é entregar um painel rápido, responsivo e de alta legibilidade para o cruzamento e análise de dados governamentais das duas casas legislativas (Câmara dos Deputados e Senado Federal).

---

## 1. Arquitetura e Roteamento (App Router)

O front-end é construído sobre a fundação do **Next.js 15 (v15.5.19)** utilizando o paradigma do *App Router*, em conjunto com **React 19** e **Tailwind CSS v4**. A arquitetura tira proveito estratégico da separação entre renderização no servidor e no cliente para equilibrar a performance de SEO e a velocidade de entrega inicial com interatividade em tempo real no lado do cliente.

### 1.1. Páginas e Renderização

* **A Home (`app/page.tsx`):** Server Component com renderização dinâmica (`force-dynamic`). Exibe a foto do Congresso Nacional com transição suave de tema, números gerais do projeto (`PROJECT_STATS`), uma seção informativa de apresentação e a seção de pré-visualização rápida do diretório (`DiretorioPreview`), que recebe a lista de parlamentares previamente carregada no servidor.
* **Diretório de Parlamentares (`app/diretorio/page.tsx`):** Server Component (`force-dynamic`) que executa a estratégia de *fetch-all-once* (ADR 003). Busca todos os parlamentares de ambas as casas em paralelo no servidor e repassa os dados para o `DiretorioClient`. No lado do cliente, a lista é unificada, filtrada (busca textual, partido, estado e casa) e paginada instantaneamente, permitindo interatividade imediata e sem novos acessos à rede.
* **Dossiê do Político (`app/politico/[id]/page.tsx`):** Server Component (`force-dynamic`). Utiliza a função `generateMetadata` no servidor para injetar metadados dinâmicos e tags *Open Graph* (contendo nome, partido, cargo, estado e url da foto). Renderiza o cabeçalho no servidor e delega os painéis interativos de votações nominais, afinidades políticas, fidelidade e discursos ao `DossieClient`.
* **O Ringue de Comparação (`app/comparacao/page.tsx`):** Server Component (`force-dynamic`) que carrega a listagem de todos os parlamentares no servidor para alimentar os seletores de comparação de forma instantânea. O cálculo de afinidade mútua, timelines e cruzamento de votos nominais são processados de forma assíncrona no componente cliente `ComparacaoClient`.
* **Discursos (`app/discursos/page.tsx`):** Server Component (`force-dynamic`) que gerencia a paginação e busca textual de discursos no servidor via parâmetros de URL (*searchParams*). Carrega os discursos e a listagem de parlamentares em paralelo via `Promise.all` para exibição no `DiscursosClient`.
* **Coesão Partidária (`app/partidos/page.tsx`):** Server Component (`force-dynamic`) que busca os índices de coesão partidária da Câmara e do Senado em paralelo com o diretório completo e passa os dados para o `PartidosClient`, exibindo o nível de união dos partidos nas votações.
* **Painel de Proposições (`app/proposicoes/page.tsx`):** Server Component (`force-dynamic`). Executa paginação e filtros de proposições no servidor baseado nos parâmetros da URL (ano, tipo de matéria, busca textual e filtragem de analisadas), otimizando a exibição de ementas longas no `ProposicoesClient`.
* **Detalhe da Proposição (`app/proposicoes/[casa]/[id]/page.tsx`):** Server Component (`force-dynamic`). Busca os metadados da proposição e os dados de polarização e distribuição de votos em paralelo no servidor. Provê metadados dinâmicos e renderiza os detalhes por meio do `ProposicaoDetalheClient`.

---

## 2. Comunicação Assíncrona e CQRS

Respeitando a macroarquitetura do sistema, o front-end atua estritamente como consumidor do Lado de Leitura (Query), interagindo exclusivamente com a API **FastAPI** por meio de requisições HTTP `GET`. Não existem rotas de escrita ou submissão direta de dados, mantendo a integridade das informações extraídas e geradas pelos pipelines de ETL e processamentos do Worker NLP.

Para viabilizar o desenvolvimento local desacoplado e a resiliência do sistema:
* **Cache em Camadas:** As requisições no servidor utilizam o mecanismo de cache nativo do `fetch` do Next.js. Dados estáticos ou com baixa taxa de alteração (como diretórios e coesão de partidos) possuem tempo de revalidação de 1 hora (`revalidate: 3600`), enquanto detalhes de políticos e proposições possuem cache de 60 segundos (`revalidate: 60`). Discursos utilizam `cache: 'no-store'` para pesquisas textuais e paginação dinâmica sempre atualizadas.
* **Mock System de Desenvolvimento:** Através da variável de ambiente `NEXT_PUBLIC_USE_MOCK === "true"`, o frontend pode ser executado em modo de simulação offline (usando dados definidos em `lib/mock.ts`), isolando o desenvolvimento da interface das dependências da API ou do banco de dados.

---

## 3. Padrões de Resiliência e Prevenção de Falhas

Para garantir uma navegação fluida e confiável mesmo em cenários de instabilidade na rede ou nos serviços do governo, o frontend adota estratégias ativas de prevenção e indicação de estados do sistema:
* **Skeleton Loaders:** Componentes visuais dedicados, como o `Skeleton` (`components/ui/Skeleton.tsx`) e a `CongressoSilhueta` (`components/CongressoSilhueta.tsx`), simulam a anatomia da interface final com transições de pulsação suave durante o tempo de tráfego HTTP.
* **Tratamento de Exceções de Rede (Error Boundaries):** Envelopamento e tratamentos de exceções nas chamadas de dados que evitam o travamento total da interface. Caso a API apresente falha, mensagens claras e empáticas são exibidas, oferecendo opções de recarregamento sem expor logs técnicos brutos.
* **Empty States (Buscas Vazias):** Telas e avisos orientadores são apresentados sempre que a combinação de termos de busca e filtros (ex: um partido específico em determinado estado) não retornar registros, ajudando o usuário a redefinir seus parâmetros de busca.
* **Sinalização de Nulidade e Ausência de Dados:** Em conformidade com a remoção do Score de Coerência (ADR 003), parlamentares recém-empossados ou sem discursos e votações suficientes têm seus índices analíticos omitidos proativamente, exibindo sinalizações amigáveis de "Ausência de Dados" para evitar falsas métricas ou relatórios incorretos.

---

## 4. Design System e Acessibilidade Visual (WCAG AA)

O frontend implementa um **Design System Modular** e consistente, construído com base em componentes atômicos (como `Avatar.tsx`, `ScoreBadge.tsx`, `Skeleton.tsx` e `MembroCard.tsx`) e componentes estruturais (`Navbar.tsx`, `SiteFooter.tsx` e `VotosTable.tsx`). O desenvolvimento segue estritamente a filosofia *Mobile First*, garantindo usabilidade em qualquer resolução.

A aplicação conta com um alternador de temas (`ThemeToggle.tsx`) que permite a navegação entre os modos Claro e Escuro, salvando a preferência do usuário no armazenamento local (`localStorage`).

### 4.1. Estética e Paleta Semântica

A interface adota a estética de **Dark Glassmorphism** no modo escuro, caracterizada por fundos profundos contrastados com painéis translúcidos e desfoque de fundo (backdrop-blur), e um tema claro polido que preserva a identidade visual da aplicação.

As cores da paleta foram mapeadas e registradas no bloco `@theme` do Tailwind CSS v4 para manter a consistência semântica:

| Token / Variável | Cor (Hex/Tipo) | Justificativa e Aplicação Visual |
|---|---|---|
| `--color-canvas` | `#05080f` (Escuro) / `#eef1f7` (Claro) | Fundo primário da aplicação. Evita fadiga visual e destaca elementos em primeiro plano. |
| `--color-card` | `#0c1220` (Escuro) / `#e4e9f2` (Claro) | Fundo de painéis e blocos de conteúdo com desfoque translúcido (`glass`). |
| `--color-rim` | `#1a2435` (Escuro) / `#bdc8d8` (Claro) | Bordas finas de delimitação que garantem separação e profundidade visual. |
| `--color-coherent` | `#10b981` (Verde) | Escala positiva para notas de coesão, afinidade e fidelidade partidária. |
| `--color-incoherent` | `#f43f5e` (Vermelho) | Escala de alerta visual para taxas de discordância e ausência de fidelidade. |
| `--color-pulse` | `#5e88ff` (Azul) | Cor de identidade visual da Câmara dos Deputados (sem juízo de valor). |
| `--color-aurum` | `#f59e0b` (Âmbar) | Cor de identidade visual do Senado Federal (sem juízo de valor). |
| `--color-serie-a` / `*-b` | `#6366f1` (Índigo) / `#14b8a6` (Teal) | Séries neutras para diferenciar os dois parlamentares comparados no Ringue. |
| `--color-voto-sim` | `#a78bfa` (Violeta) | Diferenciação semântica NEUTRA para o voto Sim em proposições. |
| `--color-voto-nao` | `#22d3ee` (Ciano) | Diferenciação semântica NEUTRA para o voto Não em proposições. |
| `--color-voto-outro` | `#64748b` (Ardósia) | Votos nulos, abstenções, obstruções ou ausências no plenário. |

> [!NOTE]
> A diferenciação de votos por cores neutras (violeta/ciano) foi implementada especificamente para evitar julgamento de valor político (como associar verde a "bom" e vermelho a "ruim" para votações de matérias de lei), focando na exibição imparcial dos fatos.

### 4.2. Estratégias de Otimização e Inclusão

* **Otimização de Mídia (Avatares):** A renderização de fotos de centenas de parlamentares usa o componente `<Image/>` nativo do Next.js com preenchimento responsivo (`fill`) e controle de largura (`sizes`), realizando lazy loading e conversão automática para formatos modernos (WebP/AVIF). Caso a foto não exista, o componente renderiza uma silhueta contendo as iniciais do parlamentar.
* **Navegação Acessível e Teclado:** A interatividade dos componentes respeita as diretrizes **WCAG Nível AA** de contraste e navegação. Menus, tabelas, modais e seletores são estruturados com marcações semânticas do HTML5 e atributos **ARIA**, garantindo usabilidade total por meio do teclado (tecla `Tab` e atalhos) e leitura fidedigna em leitores de tela para usuários com deficiência visual.

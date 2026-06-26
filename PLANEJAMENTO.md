# Planejamento — Reestruturação do Frontend ContraDito

> Documento de planejamento. Nenhuma implementação parte deste arquivo até aprovação.
> Última atualização: 2026-06-25.

## 0. Limitação de dado permanente (premissa de base)

A coluna `eh_coerente` **não será mais preenchida no banco** — confirmado pelo
responsável da API (Luiz). **Não é estado temporário de dados nulos nem decisão de
produto em aberto: é uma limitação de dado permanente.** Consequências diretas:
- Não existe mais **Score de Coerência**, **coerência acumulada** ou qualquer
  métrica derivada de `eh_coerente`, em nenhuma fase.
- A coluna `score_coerencia` ainda existe no banco (e ainda é devolvida por alguns
  endpoints — ver §2), mas é dado morto para o produto: nunca exibida.

## 1. Mudança de Produto: de "Ranking de Coerência" para "Portal de Consulta"

O ContraDito deixa de ser um **ranking de coerência** e passa a ser um
**portal de consulta** de transparência política.

| Antes (descontinuado)                         | Agora                                                  |
| --------------------------------------------- | ------------------------------------------------------ |
| Parlamentares ordenados por `score_coerencia` | Diretório navegável, sem ordenação por nota            |
| Score de Coerência (0–100) exibido            | Score **não existe mais no produto**                   |
| Flag `dados_insuficientes` / toggle           | Removidos (e inexistentes no backend)                  |
| "Quem é mais coerente"                         | "Consulte votos, discursos e proposições"              |
| Comparação por coerência                       | Comparação por **concordância de votos**               |

## 2. Nova API — Endpoints e o que substituem

Toda rota exige `{casa}` (`"camara"`/`"senado"`) no path, **exceto** `GET /api/comparar`
(que recebe `casa` como query). URL base local: `http://localhost:8000`.
Status verificado em `app/rotas/dados.py` em 2026-06-25: **as 15 rotas abaixo existem
com path exato e nenhuma usa `eh_coerente`.**

### Parlamentares
| Endpoint | Substitui / descontinua |
| --- | --- |
| `GET /api/{casa}/politicos` | Listagem global antiga; agora por casa, ordenada por `nome_urna` (sem `ordem`). Payload ainda traz `score_coerencia` — **ignorado** pelo front |
| `GET /api/{casa}/politicos/{id}` | Perfil antigo; agora `politico` + `resumo_votos` |
| `GET /api/{casa}/politicos/{id}/timeline` | Cronologia de votos (ver Fase 2) |
| `GET /api/{casa}/politicos/{id}/afinidades` | Gêmeo (maior concordância) / antípoda (menor) |
| `GET /api/{casa}/politicos/{id}/fidelidade` | Fidelidade partidária bruta |

### Comparações e Partidos
| Endpoint | Substitui / descontinua |
| --- | --- |
| `GET /api/comparar` (única sem `{casa}`) | Comparação antiga; agora `concordancia_percentual` + `divergencias` |
| `GET /api/{casa}/partidos/coesao` | Índice de Rice adaptado por bancada |

### Proposições
| Endpoint | Substitui / descontinua |
| --- | --- |
| `GET /api/{casa}/proposicoes` | Painel de proposições |
| `GET /api/{casa}/proposicoes/{id}` | Detalhe + resumo executivo IA |
| `GET /api/{casa}/proposicoes/{id}/polarizacao` | Badge Consensual / Dividida / Altamente Polarizada |

### Discursos, Chunks e Votos
| Endpoint | Substitui / descontinua |
| --- | --- |
| `GET /api/{casa}/discursos` | Discursos da casa |
| `GET /api/{casa}/politicos/{id}/discursos` | Discursos de um parlamentar |
| `GET /api/{casa}/discursos/{id}` | Transcrição integral |
| `GET /api/{casa}/discursos/{id}/chunks` | Chunks (parágrafos da IA) |
| `GET /api/{casa}/votos` | Votos nominais brutos (+ `chunks_proximos`, pode vir vazio) |

### Divergências código ↔ documentação recebida (a tratar no front)
- A doc diz que `score_coerencia`/`dados_insuficientes` foram removidos, mas o
  schema (`PoliticoDB`) **ainda devolve `score_coerencia`**. Front ignora.
- `dados_insuficientes` **não existe no backend**; remover de `frontend/lib/types.ts`.
- `ordem` e `incluirSemDados` **não existem na API**; remover do front (`page.tsx`,
  `FilterBar`).

## 3. Fase 1 — Home (`/`) + Diretório (`/diretorio`) + Comparação (`/comparacao`)

**Arquitetura de navegação (decidido):** a Fase 1 tem **três rotas distintas**,
inspirada **estruturalmente** em como o ranking.org.br separa a Home (hero +
busca/preview) da lista completa (`/ranking`):

- **`/` (Home)** — vitrine/preview, **não** a lista completa:
  - hero com **imagem de fundo do Congresso Nacional** (requisito detalhado abaixo) +
    storytelling;
  - **números reais do projeto** (Supabase, confirmados em 2026-06-25):
    - **887 parlamentares** extraídos — 642 Câmara + 245 Senado;
    - **53.329 discursos** extraídos — 49.731 Câmara + 3.598 Senado;
    - **2.573 proposições** cruzadas — 1.372 Câmara + 1.201 Senado;
    - **51.611 votos nominais** processados — 47.966 Câmara + 3.645 Senado;
  - barra de **busca** + **seletor de Casa** (Todos/Câmara/Senado) como vitrine/preview;
  - botão **"Ver lista completa"** → **navega para `/diretorio`** (não embute a lista);
  - seção **Sobre + Equipe** no final (ver §3b).
- **`/diretorio` (rota NOVA)** — **listagem completa** dos 887 parlamentares:
  - busca + filtros (UF/Partido) + seletor de Casa **fixos (sticky)**;
  - listagem **completa**, fetch-all-once client-side ([ADR 003](docs/docs/adrs/adr-003.md)).
- **`/comparacao` (rota existente, propósito original mantido)** — **comparação 1×1**
  entre dois parlamentares. **Não** é fundida com o diretório; ver §4.

> As decisões de §3a abaixo (modelo de dados, fetch-all, linha, filtros, toggle de casa)
> descrevem **a listagem completa, que vive em `/diretorio`**. A Home reaproveita apenas
> a busca + seletor de Casa como preview.

#### Hero da Home — fundo do Congresso Nacional (requisito p/ o próximo prototype)

O hero da Home deve usar o **Congresso Nacional** como elemento visual de fundo,
retomando a exploração do protótipo antigo `/prototipo-hero`, mas **corrigindo dois
erros** que existiam lá:

1. **Duas cúpulas, não uma.** O Congresso tem **duas** cúpulas nas extremidades do
   prédio anexo: uma **côncava (voltada para baixo) = Câmara dos Deputados** e uma
   **convexa (voltada para cima) = Senado Federal**. O protótipo antigo desenhava só
   uma — as duas precisam aparecer.
2. **Ponte na metade da altura das torres.** A passarela horizontal que liga as duas
   torres gêmeas centrais fica **na metade da altura** das torres — **não** próxima ao
   topo, como estava desenhado antes.

**Adaptação a tema (obrigatória):** o elemento precisa funcionar tanto no tema **claro**
quanto no **escuro** — overlay/gradiente **adaptável à variável de tema**, não cor
sólida fixa (lição de um round anterior de prototype).

### a) Listagem completa Câmara + Senado (em `/diretorio`)

**Modelo de dados (decidido):** um único tipo `Parlamentar` com campo
**`casa: "camara" | "senado"` obrigatório**, carimbado pelo client no momento do
fetch (o endpoint conhece a casa; o payload não a ecoa). Não há união de dois tipos
(os payloads são idênticos). A identidade estável do parlamentar é o par
**(casa, id)** — usado, inclusive, como React key na lista mesclada de "Todos", já
que o `id` não é único entre casas. Os campos `score_coerencia` e
`dados_insuficientes` **saem do tipo por completo** (não ficam como opcionais).

- Lista única com 3 modos: **Todos · Só Câmara · Só Senado**.
- **Estratégia de dados (decidido — ver [ADR 003](docs/docs/adrs/adr-003.md)):**
  carregar o roster completo das duas casas **uma vez** num buffer client-side e fazer
  tudo no client — escopo por casa (o toggle filtra o buffer), filtros, sort global por
  `nome_urna` e paginação. Caminho único e uniforme nos 3 modos. Não há endpoint
  unificado; o dataset é pequeno (~887 parlamentares) e o sort global no modo "Todos" exige todos os
  registros em mãos. Fetch com `tamanho` grande para reduzir requisições; cache de 1h
  no servidor amortiza a carga inicial.
- **Nada de nota/score/badge de coerência/flag de dados** em nenhum modo.
- **Linha = identidade pura, sem métrica** (decidido). O endpoint de listagem não traz
  contagem de votos (`resumo_votos` só existe no detalhe), então a linha é só
  identificação + navegação para o dossiê. Colunas:
  - avatar · **nome de urna** / nome civil · partido · **UF** (promovida a coluna
    visível) · *(cargo, oculto no mobile)* · **badge de Casa** na coluna da direita,
    que **substitui a antiga coluna "COERÊNCIA"** (header `COERÊNCIA` → `CASA`).
  - `status_mandato` **não** aparece na listagem — fica reservado ao dossiê.
- **Cor (sem semântica de coerência):** tint por casa apenas para identificar a origem
  visualmente — **`pulse` (#5e88ff) para Câmara, `aurum` (#f59e0b) para Senado** —
  aplicado no accent bar e no ring do avatar. Não significa "bom/mau"; substitui o
  antigo `scoreHex` verde/vermelho.
- Filtros: `busca`, `partido`, `estado` (aplicados client-side sobre o buffer) +
  paginação client-side. **Remover** `ordem` e `incluirSemDados`.
- **Toggle de casa = controle de modo primário** (segmented control Todos/Câmara/Senado),
  não um dropdown irmão de UF/Partido. UF/Partido/busca são refinamentos secundários
  sobre o escopo definido pelo toggle.
- **Filtros UF/Partido casa-aware (decidido):** as opções de Partido e UF são
  **derivadas dinamicamente do buffer, escopadas pela casa ativa** ("Só Senado" → só
  partidos/UFs presentes no Senado; "Todos" → união). **Eliminar os arrays hardcoded**
  `PARTIDOS`/`ESTADOS` de `FilterBar.tsx`.
- **Ao trocar de casa:** manter um filtro ativo se o valor ainda existir no novo
  escopo; **limpar (resetar) o filtro cujo valor não existe mais** — nunca manter um
  filtro que zere a lista silenciosamente.
- **Layout da barra de filtros:** a navbar atual (`h-14`, 56px) não comporta
  busca + UF + Partido + toggle de casa junto com logo/tema/links. A solução técnica
  (sub-barra sticky abaixo da navbar vs. navbar que expande no mobile) fica para a
  fase de **prototype visual** — não decidida no grilling.

### b) Seção "Sobre o ContraDito" + Equipe (ao final da Home, via scroll)
- Seção ao final da **Home** (após a vitrine de busca/preview), não página separada.
  O diretório completo agora vive em `/diretorio`, não na Home.
- **Referência apenas estrutural** (não de conteúdo/cor/layout):
  1. Bloco de texto *storytelling* sobre origem/motivação.
  2. Cards de membro com **carrossel de 3 faces**: Perfil (avatar, nome, papel) ·
     Especialidades (tags) · Contato (links sociais).
- **Identidade ContraDito** (de `frontend/app/globals.css`): Fraunces (`.font-display`)
  + DM Sans; paleta canvas `#05080f`, card `#0c1220`, rim `#1a2435`, texto
  `bright/mid/dim`, acentos `pulse #5e88ff` / `aurum #f59e0b`; utilitários
  `.glass`/`.glass-elevated`. Texto, cores e layout **originais**.

#### Texto de origem (proposta — narrativa de portal de consulta; revisão pendente)

Descarta o storytelling score-cêntrico antigo (README/home.html/escopo). Preserva:
nome "ContraDito", disciplina MDS, projeto UnB-FCTE 2026, dados oficiais Câmara+Senado.

> O **ContraDito** nasceu na disciplina de **Métodos de Desenvolvimento de Software
> (MDS)**, na Faculdade de Ciências e Tecnologias em Engenharia (**FCTE**) da
> **Universidade de Brasília**, em **2026**. A pergunta que moveu a Squad 09 era simples
> e incômoda: por que é tão difícil, para um cidadão comum, descobrir o que um
> parlamentar de fato discursou — e como ele votou?
>
> A informação existe. Está pública nos portais da **Câmara dos Deputados** e do
> **Senado Federal**, mas espalhada, técnica e cansativa de garimpar. O ContraDito
> reúne discursos, votações e proposições das duas casas num só lugar e deixa você
> **consultar e cruzar** esses dados livremente.
>
> Sem notas, sem rótulos, sem ranking: a plataforma não decide quem é "coerente" ou
> "incoerente". Ela organiza o registro oficial e devolve a leitura — e o juízo — a
> quem importa: **você**.

#### Equipe — Squad 09 (roster real, papéis confirmados)

Fonte do roster: `docs/overrides/home.html`. Avatar via
`https://avatars.githubusercontent.com/<handle>`. Tags = proposta (revisão pendente).

| Nome | GitHub | Especialidades (tags) |
| --- | --- | --- |
| Henrique Mendes | @henriquemendeselias | Scrum Master · Extração de Dados · Lead Fullstack |
| Luiz Henrique Tomaz | @luizhtmoreira | Fullstack · IA / NLP · Arquitetura · Extração · Frontend |
| Matheus Rodrigues | @matheus0346 | Documentação (MkDocs) · Docker / DevOps |
| João Guilherme Amâncio | @jot4-ge | Product Owner · Lead Fullstack · API · Extração · Frontend |
| Gabriel Portácio | @G2SBiell | Frontend |
| Lucas Araújo Lima | @lucasaraujoszz | Documentação (MkDocs) · Docker / DevOps |

**Contato (face 3):** estrutura por membro com `github` (preenchido para os 6) +
`linkedin?` e `email?` **opcionais, vazios por agora** — o ícone/link de cada canal só
é renderizado quando o campo existir.

## 4. Fase 2 — Anotada (NÃO implementar nesta etapa)

Nenhuma métrica desta fase usa `eh_coerente` (ver §0).

### Comparação 1×1 (`/comparacao` — rota própria, propósito original mantido)

A comparação direta entre dois parlamentares **continua sendo a página `/comparacao`**,
com seu propósito original: **comparar 1×1**. **Não** é fundida com o diretório
(`/diretorio`) — são rotas e superfícies distintas. Conceito central: **concordância**.

- **Seleção dos dois parlamentares** acontece na própria `/comparacao` (seletores/busca
  independentes para cada um). _Mecânica exata de seleção a refinar no prototype da
  Fase 2 — pode, por exemplo, aceitar deep-link `/comparacao?a={id1}&b={id2}`._
- A página consome `GET /api/comparar`
  (`concordancia_percentual` + `proposicoes_em_comum` + `divergencias`) e exibe:
  - o **percentual de concordância**;
  - um **gráfico por votos**: eixo X = proposições/tempo (PECs/PLs em ordem
    cronológica), eixo Y = voto (`voto_oficial`: Sim/Não/Abstenção/etc.), com **uma
    série/linha por parlamentar** — permitindo visualizar onde os votos coincidem e
    onde divergem ao longo do tempo. As duas séries são distinguíveis visualmente,
    preservando a identidade de [[casa]] de cada parlamentar. É a **aplicação concreta
    da "Timeline de Votações"** (definida no grilling da Fase 1: eixo X tempo, eixo Y
    categórico de `voto_oficial`), agora com **dois parlamentares simultâneos** em vez
    de um só;
  - a **lista detalhada das divergências** (proposição, ementa, voto de cada um).

### Métricas do Dossiê
- **Timeline de Votações** (`/timeline`) — cronologia **puramente visual**:
  eixo X = tempo (`data_votacao`); eixo Y = categórico com os valores de
  `voto_oficial` (Sim, Não, Abstenção, etc.). **Sem cálculo de coerência, sem
  acúmulo.**
- **Fidelidade Partidária bruta** (`/fidelidade`) — exibe se o parlamentar votou
  com a maioria do partido ou não, agrupado por voto: `taxa_fidelidade`,
  `votos_alinhados`, `votos_rebeldes`, `total_votos_com_orientacao`. **Sem
  "Quadrantes de Comportamento"** (Coerente&Fiel, Rebelde Coerente, Fidelidade
  Cega, Incoerente&Rebelde) — esses dependiam de `eh_coerente`, que nunca será
  preenchida (limitação de dado permanente, §0).
- **Gêmeo e Antípoda** (`/afinidades`) — por concordância de votos.
- **Assiduidade / presença efetiva** — derivada de `resumo_votos`.
- **Polarização de proposições** (`/proposicoes/{id}/polarizacao`).
- **Coesão partidária** (`/partidos/coesao`).

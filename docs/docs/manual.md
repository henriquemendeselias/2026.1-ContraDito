# Manual do Usuário

Bem-vindo ao **ContraDito**! A plataforma foi desenhada para ser um portal de consulta transparente, rápido e apartidário sobre a atuação de deputados federais e senadores do Congresso Nacional. 

Abaixo, detalhamos como navegar pelas principais abas e funcionalidades da aplicação.

---

## 1. A Página Inicial (Homepage)

A **Homepage** é a vitrine e o ponto de partida da sua navegação. Ela concentra:

* **Silhueta e Transição de Tema:** O cabeçalho apresenta uma foto real do Congresso Nacional que se adapta de forma fluida dependendo do tema visual ativado (Claro ou Escuro).
* **Estatísticas do Projeto:** Exibição quantitativa de dados consolidados em tempo real no rodapé do cabeçalho (parlamentares monitorados, discursos indexados, proposições catalogadas e votos processados).
* **Pré-visualização do Diretório:** Uma seção interativa inspirada no formato do portal *ranking.org.br*, que permite filtrar rapidamente os parlamentares por Casa (Câmara, Senado ou Ambos), realizar buscas por nome e escolher entre incluir ou não suplentes e inativos.
* **Sobre o Projeto e Equipe:** Detalhes institucionais da plataforma e a ficha técnica dos membros desenvolvedores (Squad 09).

---

## 2. Os Parlamentares

Acessível pelo menu superior (`/parlamentares`), a lista é o catálogo unificado de todos os políticos cadastrados:

* **Processamento Instantâneo:** Graças ao carregamento em memória (*fetch-all-once*), a filtragem e a ordenação são imediatas e não causam lentidão de rede.
* **Filtros Avançados:** Refine sua busca combinando livremente a **Casa Legislativa** (Câmara / Senado), **Sigla Partidária**, **Estado (UF)** ou digitação direta do nome de urna ou civil.
* **Filtro de Mandato:** Possibilidade de marcar se deseja visualizar parlamentares inativos (que se afastaram) ou suplentes.
* **Atalho para o Dossiê:** Cada card de parlamentar apresenta partido, UF, cargo e um atalho direto para acessar o dossiê completo.

---

## 3. O Dossiê do Parlamentar

Ao clicar em um político, você é direcionado à sua página de dossiê individual. As informações são organizadas em abas e blocos analíticos:

### 3.1. Visão Geral e Resumo de Votos
Apresenta a foto oficial do parlamentar, seu status atual de mandato e um painel quantitativo de participação no plenário, detalhando o total de votos computados como **Sim**, **Não** ou **Outro** (abstenções, obstruções e ausências).

### 3.2. Métricas Analíticas de Atuação
* **Afinidades Políticas (Gêmeo e Antípoda):** O sistema identifica automaticamente o colega parlamentar da mesma Casa com quem o político mais concorda em votações nominais (seu **Gêmeo**) e com quem ele mais diverge (seu **Antípoda**), exibindo o percentual de concordância e o volume de votos comuns.
* **Fidelidade Partidária:** Mede o alinhamento percentual do parlamentar com as decisões da maioria de sua própria legenda partidária.

### 3.3. Linha do Tempo e Votações
* **Histórico de Votos Nominais:** Tabela interativa listando as proposições legislativas em que o político votou, indicando a ementa da matéria, o voto proferido (usando cores neutras para evitar julgamentos morais de valor) e a ementa analítica gerada pela Inteligência Artificial.
* **Linha do Tempo Cronológica:** Gráfico interativo que resume o fluxo de atuação legislativa do parlamentar ao longo da legislatura.
* **Histórico de Discursos:** Lista cronológica dos pronunciamentos oficiais do político na tribuna, permitindo a leitura integral de cada matéria.

---

## 4. O Ringue de Comparação (Face-to-Face)

A funcionalidade **Comparação** (`/comparacao`) permite cruzar diretamente o posicionamento de dois representantes da mesma Casa Legislativa:

1. **Seleção de Oponentes:** Use os campos de busca interativos para escolher dois parlamentares da Câmara ou do Senado.
2. **Índice de Concordância:** O sistema exibe o percentual consolidado de alinhamento ideológico e o total de matérias em que ambos votaram juntos.
3. **Lista de Divergências:** Exibição detalhada de todas as proposições em que os políticos votaram de forma oposta (ex: Parlamentar A votou "Sim" e Parlamentar B votou "Não"), expondo a ementa da matéria para que o usuário possa analisar os contrastes.

---

## 5. Coesão Partidária (Bancadas)

Na aba **Partidos** (`/partidos`), você visualiza o nível de união e disciplina interna de cada sigla partidária:

* **Índice de Coesão:** Representa o percentual médio em que os membros da bancada de um partido votaram da mesma forma (ou seja, se o partido atua de forma unida ou se possui correntes internas divergentes).
* **Rankings por Casa:** Permite visualizar as legendas mais e menos coesas separadamente para a Câmara e para o Senado.

---

## 6. Painel e Detalhes de Proposições

A aba **Proposições** (`/proposicoes`) monitora as principais matérias e projetos de lei pautados no Congresso Nacional:

* **Busca por Ementa ou Tipo:** Localize projetos de lei (`PL`), propostas de emenda à constituição (`PEC`) e outros tipos filtrando por ano de apresentação.
* **Filtro de Análise de IA:** Permite marcar se deseja visualizar apenas as proposições que já possuem um resumo executivo gerado por Inteligência Artificial (Gemini).
* **Polarização de Plenário:** Dentro da página de detalhes de cada proposição (`/proposicoes/[casa]/[id]`), o sistema apresenta um gráfico de distribuição de votos e classifica o nível de polarização da votação em:
  * **Consensual:** Votação amplamente pacificada (polarização < 30%).
  * **Dividida:** Votação equilibrada com debates relevantes (polarização de 30% a 70%).
  * **Altamente Polarizada:** Plenário profundamente cindido (polarização superior a 70%).

---

## 7. Consulta de Discursos

Na aba **Discursos** (`/discursos`), o usuário tem acesso à ferramenta de transparência verbal:

* **Pesquisa Livre por Palavra-Chave:** Filtre discursos de parlamentares buscando por palavras-chave específicas (ex: "educação", "reforma").
* **Cruzamento de Dados:** Cada discurso traz o parlamentar associado, data de pronunciamento e links rápidos para visualizar o dossiê daquele político.

---

> [!TIP]
> **Navegação Inteligente**: Você pode alternar entre os modos claro e escuro a qualquer momento no ícone de sol/lua localizado no canto superior direito da barra de navegação principal.
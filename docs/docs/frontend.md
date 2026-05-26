# Frontend e Interface

Este documento detalha a arquitetura da interface de usuário do **ContraDito**, desenvolvida para atender às demandas de jornalistas investigativos e cidadãos engajados. O objetivo central é entregar um painel rápido, responsivo e de alta legibilidade para o cruzamento e análise de dados governamentais.

---

## 1. Arquitetura e Roteamento (App Router)

O front-end é construído sobre a fundação do **Next.js** utilizando o paradigma do *App Router*, em conjunto com **React** e **Tailwind CSS**. A arquitetura tira proveito estratégico da separação entre renderização no servidor e no cliente para equilibrar performance de SEO com interatividade em tempo real.

### 1.1. Páginas e Renderização

* **A Home (`app/page.tsx`):** Opera primariamente no lado do cliente (*Client Component*) para garantir a reatividade instantânea da barra de pesquisa com tolerância a erros (*Fuzzy Search*) e a interdependência dos filtros restritos de Partido, Cargo e UF. Exibe o ranking geral dos políticos com os maiores (ou menores) índices de coerência.
* **Dossiê do Político (`app/politico/[id]/page.tsx`):** Adota estritamente o *Server-Side Rendering (SSR)*. Essa escolha técnica viabiliza a injeção dinâmica de metatags *Open Graph*. Assim, quando um dossiê é compartilhado em redes sociais ou mensageiros (WhatsApp, X/Twitter), um *card* visual contendo a foto do político, nome e seu Score de Coerência é gerado automaticamente pelas plataformas.
* **O Ringue (`app/comparacao/page.tsx`):** Interface altamente interativa que exige execução no cliente. Implementa um modelo de *Split Screen* para dispositivos *desktop* e empilhamento inteligente em *mobile*, permitindo que os seletores de políticos operem de forma assíncrona e 100% independente para cada oponente.

---

## 2. Comunicação Assíncrona e CQRS

Respeitando a macroarquitetura do sistema, o front-end é um consumidor passivo de dados. Ele interage única e exclusivamente com o Lado de Leitura (Query) provido pela **FastAPI** por meio de requisições HTTP `GET`.

A interface não possui qualquer rota de submissão de estado ou dados ao servidor, garantindo a imutabilidade das informações geradas pela Inteligência Artificial e desacoplando totalmente a experiência do usuário de possíveis lentidões da camada de processamento do Worker NLP.

---

## 3. Padrões de Resiliência e Prevenção de Falhas

Para que a interface gráfica mantenha a percepção de alta disponibilidade mesmo durante oscilações da API governamental ou lentidões de rede, o sistema implementa um rigoroso tratamento visual de estados:

* **Skeleton Loaders:** Emprego de silhuetas de carregamento (elementos cinzas em pulsação suave) que replicam a anatomia do componente final durante o tráfego HTTP. Isso retém o usuário e impede a sensação de travamento.
* **Error Boundaries:** Envelopamento das rotas para interceptar respostas anômalas (ex: HTTP 503). Impede a exposição de telas de código técnico ou páginas em branco, apresentando mensagens empáticas como *"Nossos servidores estão processando um alto volume de dados no momento. Tente novamente."*.
* **Empty States (Buscas Vazias):** Telas projetadas para orientar o usuário a limpar ou alterar seus critérios de pesquisa sempre que o cruzamento de filtros (ex: Partido "PT" no estado "RR") não produzir resultados lógicos.
* **Sinalização de Nulidade:** Omissão proativa de gráficos de coerência para parlamentares recém-empossados ou com escassez de discursos taquigráficos, exibindo o aviso técnico de "Ausência de Dados" em conformidade com as regras do negócio.

---

## 4. Design System e Acessibilidade Visual (WCAG AA)

A aplicação consolida um **Design System Modular**, onde componentes como "Cards de Políticos" e "Métricas de Score" operam como átomos isolados, assegurando consistência em todas as páginas e facilitando atualizações. A abordagem de desenvolvimento é estritamente *Mobile First*.

### 4.1. Estética e Paleta Semântica

A estética definida é a de **Dark Glassmorphism**, caracterizada por fundos escuros profundos contrapostos a painéis de desfoque translúcido, transmitindo o tom investigativo necessário ao produto jornalístico.

| Elemento | Aplicação Técnica | Justificativa Visual |
|---|---|---|
| **Fundo Primário** | `bg-slate-900` | Evita fadiga visual prolongada e destaca o conteúdo em primeiro plano. |
| **Índice Coerente** | `text-emerald-500` (Verde) | Escala positiva para notas iguais ou superiores a 70%. |
| **Índice Incoerente** | `text-rose-500` (Vermelho) | Escala de alerta semântico para reprovação de integridade discursiva. |

As cores aplicadas aos escores foram rigorosamente avaliadas em relação à cor base do fundo para garantir conformidade de contraste pelo padrão internacional **WCAG Nível AA**, garantindo leitura acessível a portadores de baixa visão ou daltonismo.

### 4.2. Estratégias de Otimização e Inclusão

* **Otimização de Mídia (Avatares):** A renderização simultânea de centenas de imagens parlamentares oficiais exige mitigação severa. A interface utiliza o componente `<Image/>` nativo do framework, responsável por conversão autônoma para os formatos *WebP/AVIF*, redimensionamento responsivo sob demanda e *lazy loading* estrito das fotos que estão fora do viewport do usuário.
* **Navegação Acessível e Teclado:** Toda interatividade — incluindo menus suspensos, campos de busca livre, alternância de ordenação e paginação da listagem — obedece aos atributos **ARIA (Accessible Rich Internet Applications)**, permitindo uma navegação coesa via atalhos de teclado (ex: tecla `Tab`) e suportando integralmente tecnologias assistivas (leitores de tela).

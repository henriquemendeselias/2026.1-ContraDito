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

## 3. Fase 1 — Landing Page / Home

### a) Diretório unificado Câmara + Senado
- Lista única com 3 modos: **Todos · Só Câmara · Só Senado**.
- "Todos" agrega as duas casas; modos por casa chamam `GET /api/{casa}/politicos`.
- **Nada de nota/score/badge de coerência/flag de dados** em nenhum modo. Card:
  foto, nome de urna, partido, estado, cargo, status do mandato.
- Filtros: `busca`, `partido`, `estado` + paginação. **Remover** `ordem` e
  `incluirSemDados`.
- Em aberto (implementação): no modo "Todos", mesclar páginas das duas casas no
  servidor/cliente — a resolver.

### b) Seção "Sobre o ContraDito" + Equipe (na própria landing, via scroll)
- Seção abaixo do diretório, não página separada.
- **Referência apenas estrutural** (não de conteúdo/cor/layout):
  1. Bloco de texto *storytelling* sobre origem/motivação.
  2. Cards de membro com **carrossel de 3 faces**: Perfil (avatar, nome, papel) ·
     Especialidades (tags) · Contato (links sociais).
- **Identidade ContraDito** (de `frontend/app/globals.css`): Fraunces (`.font-display`)
  + DM Sans; paleta canvas `#05080f`, card `#0c1220`, rim `#1a2435`, texto
  `bright/mid/dim`, acentos `pulse #5e88ff` / `aurum #f59e0b`; utilitários
  `.glass`/`.glass-elevated`. Texto, cores e layout **originais**.

## 4. Fase 2 — Anotada (NÃO implementar nesta etapa)

Nenhuma métrica desta fase usa `eh_coerente` (ver §0).

### Página de Comparação
- `GET /api/comparar` → `concordancia_percentual` + `proposicoes_em_comum` +
  `divergencias` (proposição, ementa, voto de cada um). Conceito central:
  **concordância**.

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

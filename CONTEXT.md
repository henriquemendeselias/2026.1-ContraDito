# ContraDito

Portal de consulta de transparência política que reúne votos, discursos e
proposições de parlamentares brasileiros (Câmara e Senado). O cruzamento
discurso↔voto via IA permanece no backend, mas o produto deixou de ser um
**ranking de coerência**.

## Language

### Domínio do Portal

**Portal de Consulta**:
Modelo de produto atual: diretório navegável de parlamentares, proposições, votos e
discursos, voltado à consulta e ao cruzamento factual. Não há ordenação por nota nem
exposição de score.
_Avoid_: Ranking, plataforma de coerência.

**Ranking** _(descontinuado)_:
Conceito antigo de ordenar parlamentares por Score de Coerência. **Removido do
produto.** Não exibir ordenação, posição, top/piores ou nota.
_Avoid_: usar em qualquer contexto de UI.

**Casa**:
Câmara dos Deputados (`"camara"`) ou Senado Federal (`"senado"`). Segmenta todas as
rotas da API (`/api/{casa}/...`), exceto `GET /api/comparar`. Na Home, define os modos
de visualização Todos / Só Câmara / Só Senado.
_Avoid_: Órgão, instituição, legislativo.

**Concordância**:
Conceito central da comparação entre dois parlamentares: percentual de proposições em
que ambos votaram identicamente (Sim/Sim ou Não/Não). **Substituiu o "Score de
Coerência" como base de comparação par a par.** Exposto via `GET /api/comparar`
(`concordancia_percentual`) e nas afinidades (gêmeo/antípoda). Requer mínimo de 5
proposições em comum.
_Avoid_: Similaridade, alinhamento, score comparativo.

### Parlamentares

**Parlamentar**:
Deputado Federal ou Senador rastreado pelo sistema. Identificado de forma única pela
combinação **casa + id** (o `id` numérico não é único entre casas). Toda navegação e
busca de dados de um parlamentar exige a sua [[casa]].
_Avoid_: Político, candidato.

**Dossiê**:
Página de perfil detalhado de um parlamentar (`/politico/[id]`), organizada em três abas — Perfil, Votações e Similares.
_Avoid_: Perfil, página do político.

**Status do Mandato**:
Estado atual do exercício do cargo (ex: "Em Exercício", "Licenciado"). Distinto de cargo ou partido.
_Avoid_: Situação.

### Votos

**Voto Nominal**:
Posição oficial de um parlamentar em uma votação de proposição (`voto_oficial`: Sim,
Não, Abstenção, Obstrução, Ausente, etc.). É o dado bruto de votação do portal.
_Avoid_: Voto válido, posicionamento.

**Timeline de Votações**:
Cronologia **puramente visual** dos votos nominais de um parlamentar: eixo X = tempo
(`data_votacao`), eixo Y = categórico com os valores de `voto_oficial`. **Sem cálculo
de coerência e sem acúmulo.** Exposta via `GET /api/{casa}/politicos/{id}/timeline`.
_Avoid_: Timeline de coerência, gráfico de evolução, coerência acumulada.

**Fidelidade Partidária**:
Taxa bruta de quantas vezes o parlamentar votou alinhado à maioria do seu partido na
época de cada votação (`taxa_fidelidade`, `votos_alinhados`, `votos_rebeldes`,
`total_votos_com_orientacao`). Exposta via `GET /api/{casa}/politicos/{id}/fidelidade`.
**Não há "Quadrantes de Comportamento"** (cruzamento fidelidade × coerência): dependeriam
de `eh_coerente`, que nunca será preenchida.
_Avoid_: Disciplina partidária, quadrantes de comportamento.

**Taxa de Presença**:
Percentual de votações registradas (incluindo ausências) em que o parlamentar
efetivamente votou (voto_oficial ≠ "Ausente" / "NÃO COMPARECEU"). Derivada de
`politico_resumo_votos`.
_Avoid_: Frequência, assiduidade.

**Parlamentar Similar**:
Parlamentar que apresenta alta concordância com outro, com ao menos 5 proposições em
comum. Base do gêmeo (maior concordância) e antípoda (menor) nas afinidades.
_Avoid_: Parlamentar aliado, votante parecido.

### Partidos

**Coesão Partidária (Índice de Rice)**:
Índice que mede o grau de consenso ou unidade de votação interna de um partido
(bancada) nas votações nominais da [[casa]] legislativa. É calculado em escala de
0% (bancada dividida igualmente com 50% de votos Sim e 50% Não) a 100%
(unanimidade, onde todos votam Sim ou todos votam Não). Exposta via
`GET /api/{casa}/partidos/coesao`.
_Avoid_: Alinhamento ideológico, disciplina partidária.

### Termos descontinuados (limitação de dado permanente)

A coluna `eh_coerente` **não é mais preenchida no banco** (confirmado pelo responsável
da API). Não é estado temporário: é definitivo. Por isso os termos abaixo saíram do
produto e não devem ser usados em UI nem em novas features.

**Votação Analisada** _(descontinuado)_:
Antes era um `Voto` com `eh_coerente IS NOT NULL`. Como `eh_coerente` não é mais
preenchida, o conceito deixa de existir.

**Score de Coerência** _(descontinuado)_:
Percentual de coerência discurso↔voto. A coluna `score_coerencia` ainda existe no banco,
mas é dado morto: nunca exibido no produto.
_Avoid_: nota, índice de coerência.

**Dados Suficientes / `dados_insuficientes`** _(descontinuado)_:
Limiar antigo de 3 votações para habilitar score/ranking. Sem score e sem ranking, não
há toggle, ocultação de parlamentares nem denominador explícito. A flag não existe no
backend.

**Benchmark de Coerência** _(descontinuado)_:
Comparava o score contra média de partido/cargo. Dependia de score exposto.

**Tendência Recente** _(descontinuado)_:
Momentum calculado sobre a timeline de coerência acumulada. Dependia de `eh_coerente`.

### Proposições

**Proposição**:
Projeto de Lei (PL) ou Proposta de Emenda à Constituição (PEC) com votação nominal registrada no período 2023–2026.
_Avoid_: Lei, matéria, projeto.

**Resumo Executivo**:
Síntese temática de uma Proposição gerada pelo LLM (Llama 3.1), limitada a 512 tokens, usada como base para vetorização semântica.
_Avoid_: Ementa, sumário.

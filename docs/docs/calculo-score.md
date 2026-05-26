# Entendendo o Score de Coerência

O **Score de Coerência** é a principal métrica do ContraDito. É o resultado de um cruzamento analítico e matemático entre as declarações públicas do parlamentar e seus votos oficiais.

---

## A Fórmula Matemática

O índice é calculado percentualmente, resultando em uma nota de **0 a 100**, baseada exclusivamente nos cruzamentos validados com sucesso pela IA:

$$
Score = \left( \frac{\text{Quantidade de Votos Coerentes}}{\text{Total de Votações Válidas Analisadas}} \right) \times 100
$$

### Critério de Votação Válida (Filtro do Denominador)

Para garantir precisão analítica e não penalizar parlamentares indevidamente, o sistema aplica um filtro estrito sobre o denominador:

- **Posicionamento Ativo Obrigatório:** Apenas votações em que o parlamentar votou **"Sim"** ou **"Não"** são consideradas válidas.
- **Abstenções e Faltas:** Registros de **"Ausente"** ou **"Abstenção"** são ignorados — não compõem o denominador, evitando distorções.

---

## Estado de Ausência de Dados

A plataforma necessita de massa de dados para que o cruzamento semântico seja estatisticamente relevante:

- **Critério de Nulidade:** Políticos sem volume suficiente de discursos (abaixo de ~10% da média do banco) ou com baixíssima participação nas votações não terão o perfil processado pela IA.
- **Reflexo na Interface:** O `score_coerencia` é retornado como nulo pela API. O front-end exibe um indicador neutro ("N/A"), impedindo que a plataforma emita um "Falso Incoerente" (Score 0) por mera falta de registros de atividade legislativa.

---

## Limitações e Mitigações

- **Recorte Temporal (Legislatura Vigente):** Para mitigar efeitos de mudanças naturais de posicionamento ao longo de carreiras extensas, a coleta de dados é limitada ao período do mandato atual (2023–2026). O parlamentar é avaliado exclusivamente com base em sua atuação recente.

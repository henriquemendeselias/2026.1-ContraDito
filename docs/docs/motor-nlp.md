# Especificação Técnica: Motor NLP e Pipeline RAG

---

## 1. Visão Geral do Fluxo (Pipeline Pipe and Filter)

O motor NLP do **ContraDito** opera sob o padrão arquitetural **Pipe and Filter**, onde o processamento é decomposto em etapas independentes e modulares. O objetivo central é transformar textos brutos (discursos e ementas) em vereditos estruturados de coerência política, utilizando uma arquitetura RAG (*Retrieval-Augmented Generation*).

O fluxo segue a seguinte sequência lógica:

1. **Ingestão e Sanitização:** Recebimento dos dados do ETL e limpeza de ruídos (notas taquigráficas, tags HTML).
2. **Processamento de Texto (Chunking e Resumos):** Adaptação de textos longos aos limites do modelo.
3. **Vetorização (Embedding):** Conversão de texto em representações matemáticas densas.
4. **Persistência Vetorial:** Armazenamento de vetores no Supabase via `pgvector`.
5. **Busca Semântica (Retrieval):** Recuperação dos trechos mais relevantes à matéria votada.
6. **Orquestração e Inferência (Generation):** Processamento via LangChain e Llama 3.1.
7. **Cálculo e Persistência de Veredito:** Comparação lógica entre postura inferida e voto real.

---

## 2. Estratégia de Processamento: Fragmentação e Representação Holística

Modelos baseados em Transformer possuem limite estrito de comprimento de sequência. Como textos governamentais frequentemente ultrapassam essa marca, o sistema adota duas abordagens distintas:

### 2.1. Discursos Parlamentares (Fragmentação / Chunking)

Para evitar o truncamento silencioso (onde a IA ignora o final do discurso):

- **Divisão de Texto:** Discursos são fatiados em múltiplos fragmentos via `RecursiveCharacterTextSplitter` do LangChain.
- **Sobreposição (Overlap):** Cada fragmento preserva uma percentagem de caracteres do trecho anterior, garantindo que frases de transição entre ideias não percam contexto legislativo.
- **Impacto Estrutural:** A relação evolui de `1 Discurso : 1 Vetor` para `1 Discurso : N Fragmentos Vetorizados`. No RAG, o LLM recebe apenas o trecho exato onde a matéria foi debatida, otimizando o consumo de tokens.

### 2.2. Matérias Legislativas (Representação Holística)

Diferente dos discursos, os parlamentares votam no mérito do projeto como um todo. Fragmentar uma PEC de 50 páginas e buscar semelhança só no primeiro fragmento destruiria a semântica da busca.

- **Âncora Semântica:** O sistema prioriza a vetorização de um **Resumo Executivo Global** gerado pelo Llama 3.1. O resumo captura de forma mais rica a intenção da votação do que a ementa isolada.
- **Fallback:** Se o resumo falhar, o pipeline usa a ementa oficial como alternativa de contingência — densa, curta e raramente acima do limite de tokens.
- **Impacto Estrutural:** Garante que o "todo" da matéria legislativa seja comparado aos *chunks* dos discursos, preservando o espírito da lei num único espaço semântico de alta qualidade.

---

## 3. O "Dicionário Semântico": Justificativa do Modelo de Embedding

Para que o sistema compreenda a semântica política brasileira, foi selecionado o modelo **`BAAI/bge-m3`**:

| Critério | Detalhamento |
|---|---|
| **Separação de Ruído** | Excelente espaçamento vetorial com margem de segurança clara (*Delta*) entre discursos aderentes à matéria e divagações políticas, permitindo corte preciso no banco. |
| **Janela de Contexto** | Suporta nativamente até **8.192 tokens**, eliminando o truncamento silencioso e garantindo leitura integral de resumos executivos extensos. |
| **Acurácia Multilíngue** | Desempenho de ponta para PT-BR, capturando nuances, ironias e vocabulário específico do ambiente legislativo. |

---

## 4. A Matemática da Similaridade: Distância de Cosseno

A recuperação de discursos relevantes usa **proximidade geométrica**, não busca por palavras-chave.

A métrica principal é a **Similaridade de Cosseno**, que mede o cosseno do ângulo entre dois vetores no espaço n-dimensional. Diferente da distância euclidiana, ela ignora a magnitude (tamanho do texto) e foca na direção (conteúdo semântico):

$$Similaridade(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$

No Supabase, o cálculo é operado pela **Distância de Cosseno**:

$$Distância = 1 - Similaridade$$

- **Distância próxima de 0:** Textos altamente correlacionados semanticamente.
- **Distância próxima de 1:** Textos sem relação aparente.

---

## 5. O Coração da Inferência: Llama 3.1 8B

A decisão final sobre a postura do parlamentar é tomada pelo **Llama 3.1 8B** rodando de forma nativa, sem *fine-tuning* adicional:

- **Prompting Estruturado e Raciocínio Prévio:** O modelo recebe instruções rigorosas e o contexto exato (Resumo da PL + fragmentos filtrados), guiando a IA a avaliar o cenário antes de emitir o veredito.
- **Estruturação de Saída:** A resposta é extraída em formato estruturado (JSON Mode ou Regex), evitando falhas de integração com a API principal.

---

## 6. Orquestração via LangChain

O **LangChain** atua como framework orquestrador, responsável por:

- **Fragmentação (Chunking):** Quebrar discursos longos em fragmentos otimizados antes da vetorização.
- **Gerenciamento de Prompts:** Injetar dinamicamente o Resumo Executivo e os *top-k chunks* filtrados pelo banco.
- **Cadeias de Processamento:** Executar a sequência lógica — *Receber Contexto → Formatar Prompt → Analisar → Gerar Saída*.

---

## 7. Limiar de Similaridade (Threshold) e Validação Empírica

Com base em testes adversários na Prova de Conceito, o sistema estabelece um **threshold de corte de 0.46** (Similaridade de Cosseno) para aprovar a relevância de um fragmento. Se nenhum fragmento atingir esse limiar, o LLM não é acionado — evitando inferências baseadas em "alucinações" ou discursos evasivos e poupando custo computacional.

!!! note "Estratégia de Ajuste Dinâmico"
    O valor de `0.46` provou ser o filtro matemático ideal entre o linguajar político aderente e o "ruído" puro. Contudo, o *threshold* permanece como **variável configurável no backend**, permitindo microajustes conforme a base histórica real for ingerida em produção.

---

## 8. Regras de Integridade: O Viés Temporal

!!! warning "Restrição Inquebrável"
    **Nenhum discurso proferido após a data da votação será considerado pelo cálculo de RAG.** Isso blinda o sistema contra o viés de dados do futuro, julgando o parlamentar exclusivamente pelas convicções públicas que ele possuía no exato momento da votação.

---

## Resumo de Componentes Técnicos

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Embeddings** | `BAAI/bge-m3` | Transformação de textos em tensores matemáticos. |
| **Processamento de Textos** | LangChain / LLM | Fragmentação (*Chunking*) de discursos e sumarização de matérias. |
| **Vector DB** | Supabase (`pgvector`) | Armazenamento e busca vetorial por Similaridade de Cosseno. |
| **Orquestrador** | LangChain | Interligação do fluxo RAG e montagem de *prompts* de inferência. |
| **LLM** | Llama 3.1 8B | Decisão de postura política e justificativa textual. |
| **Formato de Saída** | JSON / Regex | Contrato rigoroso para integração com o backend. |

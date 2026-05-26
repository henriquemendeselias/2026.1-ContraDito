# Especificação Técnica: Motor NLP e Pipeline RAG

---

## 1. Visão Geral do Fluxo (Pipeline Pipe and Filter)

O motor NLP do projeto **contraDito** opera sob o padrão arquitetural **Pipe and Filter**, onde o processamento de dados é decomposto em etapas independentes e modulares. O objetivo central é transformar textos brutos (discursos e ementas) em vereditos estruturados de coerência política, utilizando uma arquitetura de Retrieval-Augmented Generation (RAG).


O fluxo segue a seguinte sequência lógica:

1.  **Ingestão e Sanitização:** Recebimento dos dados do ETL e limpeza de ruídos (notas taquigráficas, tags HTML).
2.  **Processamento de Texto (Chunking e Resumos):** Adaptação de textos longos aos limites do modelo, dividindo discursos e sumarizando matérias legislativas.
3.  **Vetorização (Embedding):** Conversão de texto em representações matemáticas densas.
4.  **Persistência Vetorial:** Armazenamento de vetores no Supabase utilizando a extensão `pgvector`.
5.  **Busca Semântica (Retrieval):** Recuperação dos trechos de discursos contextualmente mais relevantes à matéria votada.
6.  **Orquestração e Inferência (Generation):** Processamento via LangChain e Llama 3.1.
7.  **Cálculo e Persistência de Veredito:** Comparação lógica entre postura inferida e voto real.

---

## 2. Estratégia de Processamento: Fragmentação e Representação Holística

Modelos de linguagem baseados na arquitetura Transformer possuem um limite estrito de comprimento de sequência. Como os textos governamentais frequentemente ultrapassam essa marca, o sistema adota duas abordagens distintas para lidar com a volumetria sem perder contexto:

### 2.1. Discursos Parlamentares (Fragmentação Local / Chunking)
Para evitar o truncamento silencioso (onde a IA ignora o final do discurso), o sistema implementa a técnica de *Chunking*:

* **Divisão de Texto:** Discursos completos são fatiados em múltiplos fragmentos utilizando o `RecursiveCharacterTextSplitter` do LangChain.
* **Sobreposição (Overlap):** Cada fragmento preserva uma percentagem de caracteres do trecho anterior. Isso garante que frases que fazem a transição entre ideias não percam o contexto legislativo.
* **Impacto Estrutural:** A relação de persistência evolui de `1 Discurso : 1 Vetor` para `1 Discurso : N Fragmentos Vetorizados`. Na etapa de RAG, o LLM recebe apenas o trecho exato onde a matéria foi debatida, otimizando o consumo de tokens.

### 2.2. Matérias Legislativas (Representação Holística)
Diferente dos discursos, os parlamentares votam no mérito do projeto como um todo (PL/PEC). Fragmentar um Projeto de Lei de 50 páginas e buscar semelhança apenas no primeiro fragmento destruiria a semântica da busca.

* **Âncora Semântica:** O sistema prioriza a geração e vetorização de um Resumo Executivo Global da matéria utilizando um LLM (Llama 3.1). O motivo de o resumo atuar como método primário é a maior quantidade de contexto que ele oferece, capturando de forma mais rica e ampla a intenção da votação.
* **Fallback:** Caso o resumo global falhe ou seja inviável, o pipeline utiliza a Ementa (resumo oficial) como alternativa de contingência. Ela funciona como um excelente fallback por ser densa, curta e raramente exceder os limites de tokens.
* **Impacto Estrutural:** Garante que o "todo" da matéria legislativa seja comparado aos fragmentos (*chunks*) dos discursos, preservando o espírito da lei num único espaço semântico de alta qualidade.

---

## 3. O "Dicionário Semântico": Justificativa do Modelo de Embedding

Para que o sistema compreenda a semântica política brasileira e conecte as proposições aos discursos, foi selecionado o modelo **`BAAI/bge-m3`**.

**Porquê este modelo?**

* **Separação de Ruído:** Testes empíricos e adversários comprovaram que este modelo possui excelente espaçamento vetorial. Ele cria uma margem de segurança clara (*Delta*) entre discursos aderentes à matéria e divagações políticas, permitindo um corte preciso no banco de dados.
* **Janela de Contexto Massiva:** Suporta nativamente até 8.192 tokens, resolvendo o problema arquitetural de truncamento silencioso e garantindo a leitura integral de resumos executivos extensos.
* **Acurácia Multilíngue:** Mantém desempenho de ponta para o Português Brasileiro, capturando as nuances, ironias e o vocabulário específico do ambiente legislativo.

---

## 4. A Matemática da Similaridade: Distância de Cosseno

A recuperação de discursos relevantes no banco de dados vetorial não utiliza busca por palavras-chave, mas sim proximidade geométrica.

A métrica principal é a **Similaridade de Cosseno**, que mede o cosseno do ângulo entre dois vetores no espaço n-dimensional. Diferente da distância euclidiana, ela ignora a magnitude (tamanho do texto) e foca apenas na direção (conteúdo semântico).

A fórmula para o cálculo da Similaridade de Cosseno é definida como:

$$Similaridade(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$

No Supabase, o cálculo é operado pela **Distância de Cosseno**, onde:

$$Distância = 1 - Similaridade$$

* **Distância próxima de 0:** Textos altamente correlacionados semanticamente.
* **Distância próxima de 1:** Textos sem relação aparente.

---

## 5. O Coração da Inferência: Llama 3.1 8B

A decisão final sobre a postura do parlamentar é tomada pelo modelo **Llama 3.1 8B** rodando de forma nativa, sem necessidade de *fine-tuning* adicional. Para garantir que o modelo atue como um analista político de alta precisão, a arquitetura apoia-se em Engenharia de Prompt e processamento otimizado. Os benefícios incluem:

* **Prompting Estruturado e Raciocínio Prévio:** O modelo recebe instruções rigorosas e o contexto exato (Resumo da PL + fragmentos de discursos filtrados) guiando a IA a avaliar o cenário antes de dar o veredito, garantindo precisão na interpretação de nuances políticas.
* **Estruturação de Saída:** Garantia de que a resposta seja extraída em formato estruturado (via regras de *Regex* ou *JSON Mode* nativo), evitando falhas de integração com a API principal.

---

## 6. Orquestração via LangChain

O **LangChain** atua como o framework orquestrador do pipeline de processamento e formatação, sendo responsável por:

* **Fragmentação (*Chunking*):** Quebrar os textos longos de discursos em fragmentos menores e otimizados antes do processo de vetorização e armazenamento.
* **Gerenciamento de Prompts:** Injetar dinamicamente o Resumo Executivo da votação e apenas os fragmentos de discursos que já foram filtrados e recuperados como válidos pelo banco de dados (*top-k chunks*).
* **Cadeias de Processamento (*Chains*):** Executar a sequência lógica da inferência: *Receber Contexto -> Formatar Prompt -> Analisar -> Gerar Saída*.

---

## 7. Limiar de Similaridade (Threshold) e Validação Empírica

Com base em testes adversários realizados em Prova de Conceito (*Spike Arquitetural*), o sistema estabelece um threshold de corte de 0.46 (Similaridade de Cosseno) no banco de dados para aprovar a relevância de um fragmento de discurso. Se nenhum fragmento atingir este limiar, o LLM não é sequer acionado, evitando inferências baseadas em "alucinações" ou discursos evasivos e poupando custo computacional.

> **Estratégia de Ajuste Dinâmico:** O valor de `0.46` provou ser o filtro matemático ideal entre o linguajar político aderente e o "ruído" puro. Contudo, este *threshold* permanecerá como uma variável configurável no backend, permitindo microajustes de sintonia fina conforme a base histórica real for ingerida em produção.

---

## 8. Regras de Integridade: O Viés Temporal

Para sustentar a ética analítica do Score de Coerência, o motor NLP impõe um filtro restritivo temporal inquebrável: **Nenhum discurso proferido após a data da votação será considerado pelo cálculo de RAG.** Isto blinda o sistema contra o viés de dados do futuro, julgando o parlamentar exclusivamente pelas convicções públicas que ele possuía no exato momento da votação.

---

### Resumo de Componentes Técnicos

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Embeddings** | `BAAI/bge-m3` | Transformação de textos em tensores matemáticos. |
| **Processamento de Textos** | LangChain / LLM | Fragmentação (*Chunking*) de discursos e sumarização de matérias. |
| **Vector DB** | Supabase (`pgvector`) | Armazenamento e busca vetorial filtrada por Similaridade de Cosseno. |
| **Orquestrador** | LangChain | Interligação do fluxo RAG e montagem de *prompts* de inferência. |
| **LLM** | Llama 3.1 8B | Decisão de postura política e justificativa textual baseada no contexto. |
| **Formato de Saída** | JSON / Regex | Contrato rigoroso para facilitação da integração do backend. |

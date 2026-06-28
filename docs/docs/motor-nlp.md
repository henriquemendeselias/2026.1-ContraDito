# Especificação Técnica: Motor NLP e Pipeline RAG

---

## 1. Visão Geral do Fluxo (Pipeline Pipe and Filter)

O motor NLP/ETL do **ContraDito** opera sob o padrão arquitetural **Pipe and Filter**, onde o processamento é decomposto em etapas procedurais independentes e sequenciais. O objetivo central é transformar textos brutos de discursos e proposições legislativas em vetores matemáticos, cruzar suas proximidades semânticas e registrar vínculos de similaridade no banco relacional.

O fluxo segue a seguinte sequência lógica:

1. **Higienização de Textos:** Limpeza de notas taquigráficas, reações de plenário e marcações HTML dos discursos via Regex e BeautifulSoup.
2. **Sumarização Temática:** Envio do inteiro teor da proposição à API do **Google GenAI** (Gemini) para gerar o resumo executivo, registrando-o no Supabase.
3. **Fragmentação (Chunking):** Fatiamento de discursos longos em trechos menores (chunks) para otimizar a representação semântica.
4. **Vetorização (Embedding):** Conversão de chunks e resumos em vetores de 1024 dimensões usando SBERT (`BAAI/bge-m3`).
5. **Persistência Vetorial:** Armazenamento estruturado de vetores e payloads no banco vetorial dedicado **Qdrant Cloud**.
6. **Mecanismo de Similaridade e Vínculo:** Consulta vetorial ao Qdrant para identificar discursos de parlamentares semanticamente relacionados com as proposições legislativas votadas, persistindo os vínculos finais no **Supabase**.

---

## 2. Estratégia de Processamento: Fragmentação e Representação Holística

Modelos baseados em Transformer possuem limite estrito de comprimento de sequência. Como textos governamentais frequentemente ultrapassam essa marca, o sistema adota duas abordagens distintas:

### 2.1. Discursos Parlamentares (Fragmentação / Chunking)

Para evitar o truncamento silencioso (onde o modelo de embedding ignora o final do discurso):

*   **Divisão de Texto:** Discursos são fatiados em múltiplos fragmentos via `RecursiveCharacterTextSplitter` (do LangChain).
*   **Sobreposição (Overlap):** Cada fragmento preserva um segmento de caracteres do trecho anterior, garantindo que frases de transição entre ideias não percam o contexto legislativo.
*   **Impacto Estrutural:** A relação evolui de `1 Discurso : 1 Vetor` para `1 Discurso : N Fragmentos Vetorizados`. No front-end, o eleitor pode visualizar o trecho exato onde a matéria foi debatida, o que melhora a legibilidade e a auditoria de discursos.

### 2.2. Matérias Legislativas (Representação Holística)

Diferente dos discursos, os parlamentares votam no mérito do projeto como um todo. Fragmentar uma PEC de 50 páginas e buscar semelhança só no primeiro fragmento destruiria a semântica da busca.

*   **Âncora Semântica:** O sistema prioriza a vetorização de um **Resumo Executivo Global** gerado pela API do **Google GenAI** (Gemini). O resumo captura de forma mais rica a intenção da votação do que a ementa isolada.
*   **Fallback:** Se a sumarização falhar, o pipeline usa a ementa oficial como alternativa de contingência — que é densa, curta e raramente excede o limite de tokens do modelo.
*   **Impacto Estrutural:** Garante que o "todo" da matéria legislativa seja comparado aos *chunks* dos discursos, preservando o espírito da lei num único espaço semântico de alta qualidade no Qdrant.

---

## 3. O "Dicionário Semântico": Justificativa do Modelo de Embedding

Para que o sistema compreenda a semântica política brasileira, foi selecionado o modelo **`BAAI/bge-m3`**:

| Critério | Detalhamento |
|---|---|
| **Separação de Ruído** | Excelente espaçamento vetorial com margem de segurança clara (*Delta*) entre discursos aderentes à matéria e divagações políticas, permitindo corte preciso no espaço vetorial do Qdrant. |
| **Janela de Contexto** | Suporta nativamente até **8.192 tokens**, eliminando o truncamento silencioso e garantindo a leitura e vetorização integral de resumos legislativos. |
| **Acurácia Multilíngue** | Desempenho de ponta para PT-BR, capturando nuances, ironias e vocabulário específico do ambiente legislativo. |

---

## 4. A Matemática da Similaridade: Similaridade de Cosseno no Qdrant

A recuperação de discursos relevantes usa **proximidade geométrica**, não busca por palavras-chave.

A métrica principal é a **Similaridade de Cosseno**, que mede o cosseno do ângulo entre dois vetores no espaço n-dimensional. Diferente da distância euclidiana, ela ignora a magnitude (tamanho do texto) e foca na direção (conteúdo semântico):

$$Similaridade(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$

No **Qdrant Cloud**, a indexação e a busca espacial são operadas nativamente utilizando essa métrica:

*   **Score próximo de 1.0:** Textos altamente correlacionados semanticamente.
*   **Score próximo de 0.0:** Textos sem relação semântica aparente.

---

## 5. Sumarização Temática: Google GenAI (Gemini)

Para garantir resumos consistentes e de alta fidelidade das proposições legislativas, o sistema utiliza o modelo **`gemini-2.5-flash-lite`** da API do Google GenAI:

*   **Prompting de Sumarização:** O modelo é instruído sistematicamente a gerar um resumo executivo objetivo de no máximo 400 tokens, em prosa (texto corrido), proibindo detalhadamente o uso de bullet points, tópicos ou formatações markdown adicionais.
*   **Limitação de Escopo e Foco:** O resumo captura os objetivos fundamentais da proposição, as obrigações criadas e os argumentos centrais de sua justificativa oficial, gerando uma representação compacta e semanticamente densa para o vetorizador.

---

## 6. Orquestração e Pipelines Procedurais (Python Nativo)

A orquestração do fluxo adota pipelines procedurais simples em Python nativo em substituição a frameworks de agentes:

*   **Fatiamento (Chunking):** O fatiamento de transcrições longas é executado via `RecursiveCharacterTextSplitter` (do LangChain) para processamento estático do texto, fatiando discursos longos em blocos de texto menores com sobreposição calculada.
*   **Processamento Sequencial:** O pipeline do Worker executa de forma unidirecional as etapas de ingestão relacional, chamada ao Gemini, vetorização do SBERT e busca por similaridade de cosseno no Qdrant Cloud.

---

## 7. Limiar de Similaridade (Threshold) e Validação Empírica

O sistema estabelece limites mínimos de relevância semântica para validar a vinculação entre os chunks de discursos e os votos correspondentes. Se nenhum fragmento de fala do parlamentar atingir o limiar de corte de similaridade no Qdrant, nenhuma associação é registrada no banco relacional.

O limiar de corte configurados no pipeline é um threshold de **0.70**.

!!! note "Estratégia de Ajuste Dinâmico"
    Esse valor foi definido empiricamente para separar de forma robusta os discursos diretamente focados no tema votado de meras divagações ou manifestações genéricas. O limiar permanece como um parâmetro ajustável no backend.

---

## Resumo de Componentes Técnicos

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Embeddings** | `BAAI/bge-m3` (SBERT) | Conversão de chunks de discursos e resumos executivos em representações vetoriais de 1024 dimensões. |
| **Processamento de Textos** | LangChain / Python | Fragmentação (*Chunking*) recursiva de discursos volumosos em blocos com sobreposição. |
| **Sumarização** | Google GenAI (Gemini) | Geração de resumos executivos estruturados das proposições a serem vetorizados. |
| **Vector DB** | Qdrant Cloud | Armazenamento e busca espacial por Similaridade de Cosseno de alto desempenho na nuvem. |
| **Relational DB** | Supabase (PostgreSQL) | Armazenamento de dados cadastrais, votos nominais e registros de vinculação de proximidade. |
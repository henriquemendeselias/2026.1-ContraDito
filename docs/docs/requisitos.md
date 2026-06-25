# Requisitos do Sistema

---

## Épico 1: Ingestão de Dados (ETL)

### Requisitos Funcionais

- **RF01 – Ingestão Incremental Resiliente:** O sistema deve extrair os dados de deputados e senadores, pronunciamentos oficiais, proposições de mérito (PLs e PECs) e votos das APIs federais (Câmara e Senado) da legislatura 2023–2026, implementando retentativas com *backoff* em caso de falha.
- **RF02 – Sumarização de Matérias:** O sistema deve gerar resumos executivos das proposições legislativas (via API do Gemini) e salvar os metadados e os resumos no banco de dados Supabase.

### Regras de Negócio

- **RN01 – Escopo de Votações:** Ingerir apenas votações nominais concluídas do texto-base (descartando requerimentos regimentais, emendas e obstruções).
- **RN02 – Performance e CQRS:** O pipeline de ingestão (Worker) executa as tarefas pesadas de forma isolada do portal. As requisições de leitura na API FastAPI devem ser cacheadas em memória com TTL curto para garantir tempos de resposta rápidos.
- **RN03 – Parsing de PDF Legislativo:** Quando a ementa textual da API for insuficiente, o ETL deve realizar o download do arquivo PDF do inteiro teor da proposição e extrair seu texto programaticamente (via `pdfplumber`) para alimentar a sumarização.

---

## Épico 2: Motor NLP e RAG

### Requisitos Funcionais

- **RF03 – Fragmentação e Vetorização:** O sistema deve fatiar discursos longos (com sobreposição/overlap usando `RecursiveCharacterTextSplitter`) e gerar embeddings de 1024 dimensões (via modelo `BAAI/bge-m3`) tanto para os resumos de proposições quanto para os trechos de discursos, indexando-os no Qdrant Cloud.
- **RF04 – Vinculação por Similaridade:** O sistema deve buscar no Qdrant trechos de discursos de cada parlamentar que sejam semanticamente semelhantes ao resumo da proposição votada (threshold mínimo de 0.70 de similaridade de cosseno) e salvar os trechos correspondentes na tabela de votos do Supabase.
- **RF05 – Cálculo de Métricas Políticas:** O backend deve computar métricas analíticas e de alinhamento político em tempo de consulta (afinidade gêmeo/antípoda, fidelidade partidária e polarização).

---

## Épico 3: Busca, Filtros e Comparação

### Requisitos Funcionais

- **RF06 – Busca Dinâmica Paginada:** O sistema deve disponibilizar busca dos parlamentares por nome e filtros por partido e UF limitados a dropdowns fechados, exibindo resultados paginados vindos do backend para otimizar o tempo de carregamento.
- **RF07 – Painel Comparativo Espelhado:** O sistema deve permitir selecionar dois parlamentares para visualização lado a lado de suas afinidades, timelines sobrepostas e histórico de votações coincidentes/divergentes em tela dividida.
- **RF08 – Ranking de Coesão Partidária:** O sistema deve disponibilizar um ranking geral dos partidos políticos de cada casa legislativa, ordenando-os pelo seu índice médio de coesão/disciplina partidária nas votações nominais.

---

## Épico 4: Raio-X Parlamentar e Transparência

### Requisitos Funcionais

- **RF09 – Dossiê do Parlamentar:** Exibir o perfil consolidado do político com foto, suas métricas de fidelidade partidária e afinidade, e a listagem de suas votações com o respectivo voto oficial registrado.
- **RF10 – Destaque de Afinidade Política:** No perfil do parlamentar, o sistema deve exibir de forma explícita o seu parlamentar "gêmeo" (maior concordância de voto) e o seu "antípoda" (maior divergência) na respectiva casa.
- **RF11 – Linha do Tempo Cronológica:** O dossiê do parlamentar deve exibir um gráfico de linha do tempo evolutiva que ilustra o posicionamento e a constância do político ao longo das sessões legislativas.
- **RF12 – Histórico Geral de Pronunciamentos:** O sistema deve permitir ao usuário listar e ler na íntegra de forma paginada o histórico geral de discursos proferidos pelo parlamentar, independente de estarem vinculados a alguma votação específica.
- **RF13 – Exibição de Discursos Vinculados:** Exibir os trechos reais dos discursos (chunks) que justificaram a correlação semântica com o tema votado (também deve ser mostrado o resumo executivo da proposição votada).
- **RF14 – Página de Transparência e LGPD:** Disponibilizar uma seção estática explicando a origem pública dos dados e o funcionamento das inteligências artificiais e métricas.
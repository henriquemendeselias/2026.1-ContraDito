# Visão Geral da Arquitetura

A arquitetura do **ContraDito** foi desenhada com foco em resiliência absoluta e simplicidade estrutural, separando rigorosamente o processamento de inteligência artificial da entrega de dados ao usuário final.

---

## 1. Visão Arquitetural: C4 Model

Para garantir clareza e transparência no fluxo de processamento e arquitetura do ContraDito, utilizamos o modelo C4 para documentar os diferentes níveis de abstração do sistema.

### Nível 1: C4 Context (Sistema e Usuário)
O diagrama de Contexto mostra a visão de "helicóptero" de como a plataforma interage com o usuário final e sistemas externos (governamentais).

```mermaid
C4Context
  title Nível 1: Contexto de Sistemas - ContraDito
  
  Person(cidadao, "Cidadão / Eleitor / Jornalista", "Busca dados")
  System(contradito, "ContraDito", "Exibe dados")
  
  System_Ext(camara, "API da Câmara", "Deputados e dados relacionados")
  System_Ext(senado, "API do Senado", "Senadores e dados relacionados")
  
  Rel_D(cidadao, contradito, "Acessa vitrine", "Web")
  Rel_D(contradito, camara, "Extrai", "REST")
  Rel_D(contradito, senado, "Extrai", "REST")
  
  UpdateElementStyle(cidadao, $bgColor="#08427b", $fontColor="#ffffff", $borderColor="#052e56")
  UpdateElementStyle(contradito, $bgColor="#1168bd", $fontColor="#ffffff", $borderColor="#0b4884")
  UpdateElementStyle(camara, $bgColor="#374151", $fontColor="#ffffff", $borderColor="#4b5563")
  UpdateElementStyle(senado, $bgColor="#374151", $fontColor="#ffffff", $borderColor="#4b5563")
  
  UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

### Nível 2: C4 Container (Aplicações e Dados)
O diagrama de Container detalha a Plataforma ContraDito em seus serviços independentes, evidenciando o padrão arquitetural CQRS que isola leitura de processamento, e especificando que os bancos relacional e vetorial residem na nuvem como serviços gerenciados.

```mermaid
C4Container
  title Nível 2: Diagrama de Container - ContraDito
  
  Person(cidadao, "Cidadão / Eleitor / Jornalista", "Acessa portal e documentação")
  System_Ext(gov_apis, "APIs do Governo", "Câmara/Senado")

  ContainerDb(supabase, "Banco Relacional (Supabase - Nuvem)", "PostgreSQL", "Armazena dados cadastrais de políticos, votos, discursos e resumos")
  ContainerDb(qdrant, "Banco Vetorial (Qdrant - Nuvem)", "Qdrant Cloud", "Armazena embeddings e chunks de discursos/proposições")

  Container_Boundary(c1, "ContraDito") {
    Container(frontend, "Front-end Web", "Next.js", "Interface e Vitrine")
    Container(fastapi, "API de Leitura", "FastAPI", "Endpoints View_Query")
    Container(worker, "Worker NLP / Scripts ETL", "Python", "Processa View_Command, extração e vetorização")
    Container(mkdocs, "Servidor de Documentação", "MkDocs (Material Theme)", "Disponibiliza a documentação do projeto")
  }

  Rel_D(cidadao, frontend, "Navega", "HTTPS")
  Rel_D(cidadao, mkdocs, "Consulta documentação", "HTTPS")
  Rel_D(frontend, fastapi, "Consome", "JSON")
  Rel_D(fastapi, supabase, "Lê dados", "SQL")
  
  Rel_R(worker, gov_apis, "Extrai dados", "HTTPS")
  Rel_U(worker, supabase, "Lê/Escreve dados relacionais", "SQL")
  Rel_U(worker, qdrant, "Escreve embeddings", "gRPC/HTTP")
  
  UpdateElementStyle(cidadao, $bgColor="#08427b", $fontColor="#ffffff", $borderColor="#052e56")
  UpdateElementStyle(gov_apis, $bgColor="#374151", $fontColor="#ffffff", $borderColor="#4b5563")
  UpdateElementStyle(frontend, $bgColor="#2563eb", $fontColor="#ffffff", $borderColor="#93c5fd")
  UpdateElementStyle(fastapi, $bgColor="#2563eb", $fontColor="#ffffff", $borderColor="#93c5fd")
  UpdateElementStyle(worker, $bgColor="#2563eb", $fontColor="#ffffff", $borderColor="#93c5fd")
  UpdateElementStyle(mkdocs, $bgColor="#2563eb", $fontColor="#ffffff", $borderColor="#93c5fd")
  UpdateElementStyle(supabase, $bgColor="#059669", $fontColor="#ffffff", $borderColor="#6ee7b7")
  UpdateElementStyle(qdrant, $bgColor="#059669", $fontColor="#ffffff", $borderColor="#6ee7b7")
  
  UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

### Nível 3: C4 Component (Worker NLP)
Focando nos scripts e pipelines de processamento do backend — o **Worker NLP / Scripts ETL** —, este diagrama ilustra o fluxo de dados em formato de Pipe and Filter para a extração de dados, sumarização, fragmentação, vetorização e vinculação de proximidade semântica.

```mermaid
C4Component
  title Nível 3: Diagrama de Componentes - Worker NLP / ETL
  
  ContainerDb(supabase, "Supabase (Nuvem)", "PostgreSQL", "Armazena dados cadastrais, proposições, votos, discursos e vínculos")
  ContainerDb(qdrant, "Qdrant (Nuvem)", "Qdrant Cloud", "Armazena embeddings e chunks de discursos/proposições")
  System_Ext(gov_apis, "APIs do Governo", "Câmara e Senado")
  
  Container_Boundary(worker_nlp, "Worker NLP / ETL Pipeline") {
    Component(extrator, "1: Extrator", "Python Scripts", "Extrai dados brutos de parlamentares, discursos, proposições e votos")
    Component(sumarizador, "2: Sumarizador", "Llama 3.1 / Gemini", "Gera resumos executivos temáticos das proposições")
    Component(chunker, "3: Chunker", "Python Scripts", "Fragmenta discursos longos em blocos textuais menores")
    Component(vetorizador, "4: Vetorizador", "SBERT / BGE-M3", "Gera embeddings para blocos de discurso e resumos")
    Component(vinculador, "5: Vinculador de Chunks", "Python (run_vinculo_chunks)", "Calcula similaridade via Qdrant e vincula chunks de discursos a votos correspondentes")
  }
  
  Rel_D(extrator, gov_apis, "Extrai via REST", "HTTPS")
  Rel_D(extrator, supabase, "Salva dados relacionais", "SQL")
  
  Rel_D(sumarizador, supabase, "Lê proposições", "SQL")
  Rel_D(sumarizador, supabase, "Salva resumos", "SQL")
  
  Rel_D(chunker, supabase, "Lê discursos", "SQL")
  Rel_D(chunker, vetorizador, "Repassa chunks", "Memória")
  
  Rel_D(vetorizador, qdrant, "Salva embeddings", "gRPC/HTTP")
  
  Rel_D(vinculador, qdrant, "Busca vizinhos semânticos", "gRPC/HTTP")
  Rel_D(vinculador, supabase, "Lê votos e salva vínculos de proximidade", "SQL")
  
  UpdateElementStyle(supabase, $bgColor="#059669", $fontColor="#ffffff", $borderColor="#6ee7b7")
  UpdateElementStyle(qdrant, $bgColor="#059669", $fontColor="#ffffff", $borderColor="#6ee7b7")
  UpdateElementStyle(gov_apis, $bgColor="#374151", $fontColor="#ffffff", $borderColor="#4b5563")
  UpdateElementStyle(extrator, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  UpdateElementStyle(sumarizador, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  UpdateElementStyle(chunker, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  UpdateElementStyle(vetorizador, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  UpdateElementStyle(vinculador, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  
  UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

### Nível 4: C4 Code (Diagrama de Classes de Domínio)
O modelo de classes a seguir apresenta as principais estruturas de domínio que trafegam pelo motor NLP até persistirem no banco de dados para consumo posterior.

```mermaid
classDiagram
  class Politico {
    +UUID id
    +String nome
    +String partido
    +String estado
  }
  
  class Proposicao {
    +UUID id
    +String ementa_oficial
    +String resumo_executivo
    +String tema
  }
  
  class Discurso {
    +UUID id
    +UUID politico_id
    +String texto
    +Date data

  }

  class ChunkDiscurso {
    +UUID id
    +UUID discurso_id
    +String texto
    +Date data
    +Vector_1024 embedding_bge_m3
  }
  
  class Voto {
    +UUID id
    +UUID politico_id
    +UUID proposicao_id
    +Enum tipo_voto
  }
  

  Politico "1" *-- "many" Discurso : Realiza
  Politico "1" *-- "many" Voto : Efetua
  Discurso "1" *-- "many" ChunkDiscurso : Possui
  Voto "many" -- "1" Proposicao : Pertence a
```

---


## 2. Macroarquitetura: CQRS

O sistema é dividido física e logicamente em dois lados independentes que não realizam chamadas diretas ou comunicação síncrona entre si, utilizando o **Supabase (PostgreSQL)** e o **Qdrant (Banco Vetorial)** como meios de persistência e acoplamento indireto de dados.

| | Lado de Leitura (Query — FastAPI) | Lado de Escrita (Command — Worker/ETL) |
|---|---|---|
| **Tipo** | API REST para consultas e agregação de métricas em tempo de execução | Conjunto de scripts e pipelines Python executados em contêiner isolado |
| **Responsabilidades** | Ler dados consolidados do Supabase e entregar JSONs estruturados ao front-end | Extração das APIs governamentais, fragmentação de textos, geração de embeddings com SBERT e geração de resumos executivos via Google GenAI |
| **Cache** | Opera com respostas cacheadas em memória (FastAPICache) | Não se aplica (persistência direta nos bancos de dados) |
| **Resiliência** | Continua servindo o portal mesmo se o Worker/ETL estiver inativo ou falhar | As falhas do pipeline ficam restritas ao contêiner do Worker, sem qualquer impacto na API principal |

---

## 3. Microarquitetura do Worker: Pipe and Filter

Para o processamento interno do Worker NLP, a arquitetura abandona abstrações complexas e segue um fluxo procedural, determinístico e linear. O pacote de dados trafega de forma unidirecional por 6 estágios sequenciais:

1. **Filtro 1 — Extração (API):** Consumo das APIs federais para capturar perfis, proposições validadas e discursos.
2. **Filtro 2 — Sumarização:** Submissão da proposição legislativa para a API do Google GenAI para geração de um resumo executivo coeso.
3. **Filtro 3 — Fragmentação (Chunking):** Divisão dos discursos limpos em *chunks* textuais com sobreposição, preparando a carga para modelos com limite de contexto estrito.
4. **Filtro 4 — Vetorização:** Geração de embeddings com SBERT ( BAAI/bge-m3 ) para chunks e resumos.
5. **Filtro 5 — Armazenamento Vetorial:** Envio e indexação dos chunks com seus vetores no Qdrant.
6. **Filtro 6 — Vinculação de Chunks a Votos:** Execução do mecanismo de similaridade vetorial comparando discursos do Qdrant e associando-os aos votos no Supabase.
---

## 4. Stack Tecnológica

A tabela a seguir consolida as principais tecnologias que compõem o ecossistema do **ContraDito**, agrupadas por camada de atuação:

| Camada / Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Front-end** | React, Next.js, Tailwind CSS | Interface interativa, roteamento da aplicação web e estilização visual. |
| **API de Leitura** | FastAPI | Camada REST para entrega rápida e cacheada dos dados (CQRS - *Query*). |
| **Banco de Dados** | Supabase (PostgreSQL), Qdrant Cloud | Supabase para persistência relacional de políticos/votos/discursos e Qdrant para armazenamento/busca vetorial de embeddings. |
| **Extração e Processamento (ETL)** | Regex, BeautifulSoup4, `pdfplumber` | Coleta governamental, limpeza textual rigorosa e extração de PDFs legislativos. |
| **Inteligência Artificial** | Google GenAI (Gemini), `BAAI/bge-m3` (SBERT) | Google GenAI para sumarização temática de proposições e SBERT para vetorização de textos e busca semântica. |
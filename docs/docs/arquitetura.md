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
  
  Person(cidadao, "Cidadão / Eleitor", "Busca coerência política")
  System(contradito, "ContraDito", "Calcula e exibe Scores")
  
  System_Ext(camara, "API da Câmara", "Deputados e Votos")
  System_Ext(senado, "API do Senado", "Senadores e Discursos")
  
  Rel_D(cidadao, contradito, "Acessa vitrine", "Web")
  Rel_D(contradito, camara, "Extrai votos", "REST")
  Rel_D(contradito, senado, "Extrai falas", "REST")
  
  UpdateElementStyle(cidadao, $bgColor="#08427b", $fontColor="#ffffff", $borderColor="#052e56")
  UpdateElementStyle(contradito, $bgColor="#1168bd", $fontColor="#ffffff", $borderColor="#0b4884")
  UpdateElementStyle(camara, $bgColor="#374151", $fontColor="#ffffff", $borderColor="#4b5563")
  UpdateElementStyle(senado, $bgColor="#374151", $fontColor="#ffffff", $borderColor="#4b5563")
  
  UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

### Nível 2: C4 Container (Aplicações e Dados)
O diagrama de Container detalha a Plataforma ContraDito em seus serviços independentes, evidenciando o padrão arquitetural CQRS que isola leitura de processamento.

```mermaid
C4Container
  title Nível 2: Diagrama de Container - ContraDito
  
  Person(cidadao, "Cidadão / Eleitor", "Acessa portal")
  System_Ext(gov_apis, "APIs do Governo", "Câmara/Senado")

  Container_Boundary(c1, "ContraDito") {
    Container(frontend, "Front-end Web", "Next.js", "Interface e Vitrine")
    Container(fastapi, "API de Leitura", "FastAPI", "Endpoints View_Query")
    Container(worker, "Worker NLP", "Python", "Processa View_Command")
    ContainerDb(supabase, "Banco de Dados", "Supabase", "Armazena tudo")
  }

  Rel_D(cidadao, frontend, "Navega", "HTTPS")
  Rel_D(frontend, fastapi, "Consome", "JSON")
  Rel_D(fastapi, supabase, "Lê dados", "SQL")
  
  Rel_R(worker, gov_apis, "Extrai dados", "HTTPS")
  Rel_U(worker, supabase, "Escreve", "pgvector")
  
  UpdateElementStyle(cidadao, $bgColor="#08427b", $fontColor="#ffffff", $borderColor="#052e56")
  UpdateElementStyle(gov_apis, $bgColor="#374151", $fontColor="#ffffff", $borderColor="#4b5563")
  UpdateElementStyle(frontend, $bgColor="#2563eb", $fontColor="#ffffff", $borderColor="#93c5fd")
  UpdateElementStyle(fastapi, $bgColor="#2563eb", $fontColor="#ffffff", $borderColor="#93c5fd")
  UpdateElementStyle(worker, $bgColor="#2563eb", $fontColor="#ffffff", $borderColor="#93c5fd")
  UpdateElementStyle(supabase, $bgColor="#2563eb", $fontColor="#ffffff", $borderColor="#93c5fd")
  
  UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

### Nível 3: C4 Component (Worker NLP)
Focando no serviço mais complexo do backend — o **Worker NLP** —, este diagrama ilustra o padrão Pipe and Filter para a extração, sumarização e cálculo de coerência.

```mermaid
C4Component
  title Nível 3: Diagrama de Componentes - Worker NLP
  
  ContainerDb(supabase, "Supabase", "Armazenamento", "Tabelas e Vetores")
  System_Ext(gov_apis, "APIs do Governo", "Câmara e Senado")
  
  Container_Boundary(worker_nlp, "Worker NLP") {
    Component(extrator, "1: Extrator", "Python", "Busca proposições")
    Component(sumarizador, "2: Sumarizador", "Llama 3.1", "Resume tema")
    Component(chunker, "3: Chunker", "Python", "Fragmenta texto")
    Component(sbert, "4: Vetorizador", "SBERT", "Gera embeddings")
    Component(rag, "5: Mecanismo RAG", "pgvector", "Recupera discursos")
    Component(veredito, "6: Orquestrador", "Llama 3.1", "Calcula score")
  }
  
  Rel_D(extrator, gov_apis, "Consulta", "HTTPS")
  Rel_R(extrator, sumarizador, "Repassa", "Memória")
  Rel_D(sumarizador, chunker, "Repassa", "Memória")
  Rel_L(chunker, sbert, "Repassa", "Memória")
  Rel_D(sbert, rag, "Repassa", "Memória")
  Rel_L(rag, supabase, "Busca vizinhos", "SQL")
  Rel_R(rag, veredito, "Repassa", "Memória")
  Rel_U(veredito, supabase, "Salva score", "SQL")
  
  UpdateElementStyle(supabase, $bgColor="#2563eb", $fontColor="#ffffff", $borderColor="#93c5fd")
  UpdateElementStyle(gov_apis, $bgColor="#374151", $fontColor="#ffffff", $borderColor="#4b5563")
  UpdateElementStyle(extrator, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  UpdateElementStyle(sumarizador, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  UpdateElementStyle(chunker, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  UpdateElementStyle(sbert, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  UpdateElementStyle(rag, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  UpdateElementStyle(veredito, $bgColor="#1d4ed8", $fontColor="#ffffff", $borderColor="#60a5fa")
  
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
    +Float score_coerencia_geral
    +atualizar_score()
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
    +String texto_higienizado
    +Date data
    +Vector_768 embedding_bge_m3
  }
  
  class Voto {
    +UUID id
    +UUID politico_id
    +UUID proposicao_id
    +Enum tipo_voto
  }
  
  class VereditoCoerencia {
    +UUID id
    +UUID politico_id
    +UUID proposicao_id
    +String explicacao_llama
    +Float pontuacao_local
    +List~Discurso~ discursos_recuperados
    +calcular_coerencia()
  }

  Politico "1" *-- "many" Discurso : Realiza
  Politico "1" *-- "many" Voto : Efetua
  Voto "many" -- "1" Proposicao : Pertence a
  Politico "1" *-- "many" VereditoCoerencia : Possui
  VereditoCoerencia "many" -- "1" Proposicao : Avalia
```

---


## 2. Macroarquitetura: CQRS

O sistema é dividido física e logicamente em dois serviços independentes que não realizam chamadas HTTP diretas entre si, usando o Supabase (PostgreSQL + `pgvector`) como único meio de persistência e comunicação indireta.

| | Lado de Leitura (Query — FastAPI) | Lado de Escrita (Command — Worker NLP) |
|---|---|---|
| **Tipo** | API REST para consultas de alta performance | Serviço Python isolado, executado em background via Cron Jobs |
| **Responsabilidades** | Ler dados consolidados, paginar, validar parâmetros, entregar JSONs ao front-end | Extração de APIs governamentais, comunicação com SBERT, inferência local do Llama 3.1 8B |
| **Cache** | Opera com respostas cacheadas em memória | Ao final de cada ciclo, publica sinal de invalidação de cache via Redis |
| **Resiliência** | Continua servindo o portal mesmo se o Worker falhar | Falhas ficam restritas ao contêiner do Worker — sem impacto na API principal |

---

## 3. Microarquitetura do Worker: Pipe and Filter

Para o processamento interno do Worker NLP, a arquitetura abandona abstrações complexas e segue um fluxo **estritamente procedural, determinístico e linear**. O pacote de dados trafega de forma unidirecional por 6 estágios sequenciais — a saída de um filtro é obrigatoriamente a entrada do próximo:

1. **Filtro 1 — Extração (API):** Consumo das APIs federais para capturar perfis, proposições validadas e discursos, com higienização textual imediata.
2. **Filtro 2 — Sumarização:** Submissão da ementa legislativa ao Llama 3.1 local para geração de um resumo executivo coeso.
3. **Filtro 3 — Fragmentação (Chunking):** Divisão dos discursos limpos em *chunks* textuais com sobreposição, preparando a carga para modelos com limite de contexto estrito.
4. **Filtro 4 — Vetorização:** Transformação em *embeddings* vetoriais via SBERT (modelo `BAAI/bge-m3`), parametrizando tanto os fragmentos de discurso quanto o resumo legislativo.
5. **Filtro 5 — Recuperação Contextual (RAG):** Busca espacial no Supabase via distância de cosseno — apenas fragmentos discursivos semanticamente próximos à proposição avaliada são selecionados.
6. **Filtro 6 — Inferência e Veredito:** Orquestração dos dados filtrados para envio ao LLM, determinando a coerência ou incoerência do voto e armazenando os scores consolidados no banco.

---

## 4. Stack Tecnológica

A tabela a seguir consolida as principais tecnologias que compõem o ecossistema do **ContraDito**, agrupadas por camada de atuação:

| Camada / Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Front-end** | React, Next.js, Tailwind CSS | Interface interativa, roteamento da aplicação web e estilização visual. |
| **API de Leitura** | FastAPI | Camada REST para entrega rápida e cacheada dos dados (CQRS - *Query*). |
| **Banco de Dados** | Supabase, PostgreSQL, HNSW, `pgvector` | Persistência relacional, indexação avançada e suporte estrutural à busca vetorial. |
| **Extração (ETL)** | Regex, BeautifulSoup4, `pdfplumber`, Celery, Redis | Coleta governamental, limpeza textual rigorosa, extração de PDFs e orquestração de rotinas automatizadas em *background*. |
| **Inteligência Artificial** | Llama 3.1 8B, `BAAI/bge-m3`, LangChain| Processamento e vetorização de textos, busca semântica, orquestração do fluxo RAG e inferência contextual.|
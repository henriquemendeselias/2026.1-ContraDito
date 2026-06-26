# Manual de Arquitetura Docker — ContraDito

Este documento descreve as decisões arquiteturais que governam a infraestrutura Docker do ContraDito e fornece o guia de execução local.

---

## 1. Visão Geral da Orquestração

A infraestrutura é orquestrada via Docker Compose. Os bancos de dados **não são contêineres** — utilizamos o Supabase (relacional) e o Qdrant (vetorial) como serviços externos em nuvem, e toda persistência de dados e vetores é responsabilidade deles.

Os contêineres locais são exatamente quatro:

| Contêiner | Tecnologia | Porta exposta no host |
|---|---|---|
| `nextjs` | Next.js (Node.js 20) | `3000` |
| `fastapi` | FastAPI (Python 3.12) | `8001` |
| `worker` | Python 3.12 + PyTorch + BAAI/bge-m3 | **Nenhuma** |
| `docs` | MkDocs Material | `8002` |

O Worker não expõe portas diretamente no host (sendo de uso estritamente interno e isolado). O contêiner `docs` é totalmente isolado de rede e serve apenas para a visualização da documentação local.

---

## 2. Decisões Arquiteturais Docker

### 2.1 Isolamento de rede obrigatório (CQRS)

Os sistema é dividido em dois lados que nunca se comunicam diretamente. Essa separação é garantida pela **topologia de redes Docker**, não apenas por convenção de código. A orquestração define duas redes internas distintas:

- **Rede `read`**: conecta `nextjs` ↔ `fastapi`.
- **Rede `write`**: abriga o contêiner `worker`. O Worker acessa o Supabase, o Qdrant e a API do Gemini via egress HTTPS — não via rede interna Docker.

A `fastapi` **não pertence à rede `write`** e o `worker` **não pertence à rede `read`**. Portanto, eles nunca se enxergam diretamente — a topologia de rede torna a comunicação direta impossível, garantindo o desacoplamento CQRS.

```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TB
    subgraph READ["rede read"]
        NX["nextjs\nNode.js 20 · :3000"]
        FA["fastapi\nPython 3.12 · :8000"]
    end

    subgraph WRITE["rede write"]
        WK["worker\nPython + PyTorch"]
    end

    EXT1[("Supabase\nRelacional (Nuvem)")]
    EXT2[("Qdrant\nVetorial (Nuvem)")]
    EXT3[("Gemini API\nLLM Externo")]

    NX -->|HTTP| FA
    FA -->|HTTPS (Leitura)| EXT1
    WK -->|HTTPS (Escrita)| EXT1
    WK -->|HTTPS (Vetorização)| EXT2
    WK -->|HTTPS (Resumos)| EXT3
```

### 2.2 Bancos de dados externos — sem contêineres locais

Não existe e não deve existir nenhum contêiner Docker para bancos de dados no `docker-compose.yml`. A persistência é responsabilidade exclusiva de dois serviços em nuvem com papéis complementares e bem definidos:

- **Supabase (Relacional):** armazena todos os dados estruturados do domínio. FastAPI e Worker acessam o banco via variáveis de ambiente `SUPABASE_URL` e `SUPABASE_KEY`, por egress HTTPS.
- **Qdrant (Vetorial):** armazena e indexa 100% dos embeddings gerados pelo Worker. O Supabase não possui mais nenhuma responsabilidade vetorial — o pgvector não é utilizado. O Worker acessa o Qdrant via variáveis de ambiente `QDRANT_URL` e `QDRANT_API_KEY`, também por egress HTTPS.

Como ambos os bancos são serviços externos, nenhum volume Docker adicional é necessário para persistência de dados. O comando `docker compose down -v` não representa risco de perda de dados de negócio.

> Para detalhes sobre o Supabase como plataforma e o modelo de persistência relacional, consulte a [Visão Geral da Arquitetura](arquitetura.md).

### 2.3 Motor de Inferência externo — Gemini API via `.env`

O Motor de Inferência não é um contêiner local. Ele utiliza diretamente a API oficial do Gemini (`gemini-2.5-flash-lite`) como serviço externo em nuvem.

O Worker acessa a API do Gemini exclusivamente por meio de chamadas HTTPS a partir da rede `write`, autenticando-se com a variável `GEMINI_API_KEY` injetada via `.env`.

### 2.4 Volumes — cache HuggingFace

O modelo `BAAI/bge-m3` (~2,3 GB) é baixado automaticamente via HuggingFace na primeira execução do Worker. Para evitar redownload a cada rebuild, os pesos são persistidos em volume Docker:

- Caminho no contêiner: `/root/.cache/huggingface`
- Volume nomeado: `huggingface_cache`

### 2.5 Dockerfile do Worker — layer caching para builds ágeis

O Dockerfile do Worker separa dependências pesadas do código-fonte em camadas distintas (do que muda menos para o que muda mais):

1. Imagem base Python 3.12
2. Dependências de IA: PyTorch, Sentence-Transformers, LangChain
3. Dependências de parsing de PDF
4. Demais dependências Python
5. Código-fonte da aplicação

Isso garante que uma alteração no código da aplicação não invalide as camadas pesadas de IA, que raramente mudam.

### 2.6 Contenção de recursos

O Worker executa NLP intensivo — carrega o modelo de embedding em memória e processa batches. Para não degradar FastAPI e Next.js, **limites de CPU e memória são definidos por contêiner** via `deploy.resources` no `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: "2.0"
      memory: 4G
```

!!! warning "Apple Silicon"
    Em desenvolvimento local com Apple Silicon, definir esse teto é especialmente importante: sem ele, a vetorização do PyTorch pode consumir todos os núcleos e degradar o ambiente inteiro durante o processamento.

### 2.7 Healthchecks e ordem de inicialização

Como ambos os bancos são externos, não há dependência de inicialização de contêineres de banco. A ordem relevante de inicialização é:

- `fastapi` inicia e disponibiliza seus endpoints REST.
- `nextjs` aguarda a `fastapi` estar saudável antes de aceitar tráfego do usuário.

Uma falha ou inatividade temporária do contêiner `worker` não derruba o Lado de Leitura — a FastAPI continua servindo os dados consolidados persistidos anteriormente no Supabase.

### 2.8 Invalidação de Cache

As respostas da API FastAPI são mantidas em um cache em memória com tempo de vida limitado (TTL de 1 hora). A atualização dos dados ocorre na próxima consulta do front-end após a expiração do TTL, sem acoplamento direto ou dependência de barramento de mensagens.

### 2.9 Hot-Reload em Desenvolvimento

O ambiente local usa *bind mounts* (volumes mapeados para o host), refletindo instantaneamente modificações no código do Next.js e da FastAPI dentro dos contêineres — sem necessidade de rebuilds contínuos.

---

## 3. Variáveis de Ambiente

As variáveis abaixo afetam diretamente o comportamento dos contêineres:

```env
# Supabase — banco relacional gerenciado (obrigatório para FastAPI e Worker)
SUPABASE_URL=
SUPABASE_KEY=

# Qdrant — banco vetorial gerenciado (obrigatório para Worker)
QDRANT_URL=
QDRANT_API_KEY=

# Motor de Inferência — API do Gemini (obrigatório para Worker)
GEMINI_API_KEY=

# Front-end
NEXT_PUBLIC_API_URL=http://localhost:8001
```

!!! danger "Atenção"
    `GEMINI_API_KEY` não possui valor padrão e é obrigatória para o funcionamento das análises de IA do Worker. `QDRANT_URL` e `QDRANT_API_KEY` são obrigatórias para o Worker — a ausência de qualquer uma deve gerar erro explícito antes de iniciar o pipeline de vetorização.

---

## 4. Guia de Execução Local

!!! info "Arquitetura Nativa Multiplataforma"
    A orquestração do Docker está configurada sem a diretiva rígida de `platform` no `docker-compose.yml`. Isso permite que o Docker monte e execute imagens nativas automaticamente para a arquitetura do seu sistema operacional host (ARM64 para chips Apple Silicon e AMD64 para PCs Intel/AMD com Windows/Linux), garantindo a máxima performance de processamento local sem lentidão de emulação.

### Passo 1 — Clonar o repositório

```bash
git clone https://github.com/unb-mds/2026.1-ContraDito.git
cd ContraDito
git checkout develop
```

### Passo 2 — Configurar o `.env`

Crie o arquivo `.env` na raiz conforme a seção 3. Defina ao menos `SUPABASE_URL`, `SUPABASE_KEY`, `QDRANT_URL`, `QDRANT_API_KEY` e `GEMINI_API_KEY`.

### Passo 3 — Subir o ambiente

```bash
docker compose up --build
```

Na primeira execução, o Docker irá:

1. Construir as imagens customizadas (FastAPI e Worker)
2. Baixar as imagens base (Node.js 20, Python 3.12)
3. Instalar as dependências (as camadas de IA do Worker são as mais pesadas)
4. Baixar os pesos do `BAAI/bge-m3` (~2,3 GB) para o volume `huggingface_cache`

A partir da segunda execução, o *Layer Caching* e o volume HuggingFace eliminam esses custos.

Ao final, estarão disponíveis:

- **Interface do usuário:** http://localhost:3000
- **Documentação da API (Swagger):** http://localhost:8001/docs
- **Portal de Documentação (MkDocs):** http://localhost:8002

### Passo 4 — Derrubar o ambiente

```bash
# Derruba os contêineres e remove redes residuais
docker compose down
```

O volume `huggingface_cache` é preservado. Para remover também os volumes:

```bash
docker compose down -v
```

!!! danger "Atenção"
    `down -v` apaga os pesos do modelo. A próxima execução fará o redownload dos ~2,3 GB. Os dados de negócio (Supabase) e os embeddings (Qdrant) **não são afetados** — ambos residem em nuvem, fora do escopo dos volumes Docker.

---

## 5. Executar o Worker Manualmente (Pipelines de Script)

Como o sistema utiliza uma arquitetura **Pipe and Filter**, o pipeline do Worker é dividido em etapas sequenciais executadas por scripts independentes localizados na raiz do projeto. 

Para executar o pipeline completo ou etapas específicas manualmente durante o desenvolvimento, execute os comandos do docker compose apontando para os scripts `run_*.py` na ordem correta:

**Etapa 1: Ingestão de Dados Brutos (Extração)**
```bash
# Extração de Deputados e Senadores cadastrais
docker compose run --rm worker python run_extrator_politicos.py

# Extração de Proposições
docker compose run --rm worker python run_extrator_proposicoes.py

# Extração de Votos
docker compose run --rm worker python run_extrator_votos.py

# Extração de Discursos
docker compose run --rm worker python run_extrator_discursos.py
```

**Etapa 2: Sumarização Temática (Gemini)**
```bash
# Gera os resumos executivos das proposições extraídas
docker compose run --rm worker python run_resumo_proposicoes.py
```

**Etapa 3: Fragmentação e Vetorização (Qdrant)**
```bash
# Cria os chunks dos discursos e gera os embeddings no Qdrant
docker compose run --rm worker python run_chunker_discursos.py
```

**Etapa 4: Vinculação e Inferência Semântica**
```bash
# Vincula os chunks aos votos por similaridade
docker compose run --rm worker python run_vinculo_chunks_votos.py

# Executa a inferência de postura
docker compose run --rm worker python run_inferencia.py
```

---

## 6. Executar os Testes Automatizados via Docker

O repositório possui contêineres específicos para testes unitários e de integração configurados sob o perfil `test` no `docker-compose.yml`. Eles rodam o `pytest` de forma isolada.

Para executar os testes do Lado de Leitura (API):
```bash
docker compose --profile test run --rm test-api pytest tests/api tests/test_setup.py
```

Para executar os testes do Lado de Escrita (ETL / Worker):
```bash
docker compose --profile test run --rm test-worker pytest tests/etl
```

---

## 7. Restrições que Nunca Devem Ser Violadas

| Restrição | Razão |
|---|---|
| FastAPI sem rota de rede para o Motor de Inferência | Isolamento CQRS — garantido por topologia Docker |
| Worker sem rota de rede direta para a FastAPI | Comunicação de dados ocorre indiretamente e assincronamente através do banco relacional (Supabase) |
| Next.js sem acesso direto ao Supabase | Todo acesso ao banco relacional passa pela FastAPI |
| Nenhum contêiner de banco de dados local (PostgreSQL ou Qdrant) | Persistência relacional é o Supabase; persistência vetorial é o Qdrant — ambos em nuvem |
| Qdrant sem volume local | Banco vetorial externo — dados residem na nuvem, fora do escopo Docker |
| Credenciais e chaves de API injetadas apenas via `.env` | Evita exposição de segredos no código ou no Docker |
| Responsabilidade vetorial exclusiva do Qdrant | O pgvector (Supabase) não deve ser usado para embeddings — consistência do espaço vetorial |
| Modelo de embedding fixo: `BAAI/bge-m3` | Consistência do espaço vetorial com dados já indexados no Qdrant |
| Worker sem portas expostas no host | Isolamento do processamento pesado |
# ContraDito

> **O que os políticos dizem vs. o que eles votam.** Uma plataforma de transparência política.

<div align="center">

[![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)](#)
[![Licença MIT](https://img.shields.io/badge/Licença-MIT-green?style=for-the-badge)](#)
[![Documentação Oficial](https://img.shields.io/badge/Documentação-MkDocs-blue?style=for-the-badge)](https://unb-mds.github.io/2026.1-ContraDito/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#)

</div>

---

## Documentação Completa

Este README fornece apenas um guia de execução rápido e panorama estrutural. **Toda a arquitetura do projeto, documentação de engenharia (ADRs), escopo, pipeline ETL e fluxos do motor de inteligência artificial** estão profundamente documentados em nosso portal:

 **[Acesse a Documentação Completa do ContraDito](https://unb-mds.github.io/2026.1-ContraDito/)**

---

## O Projeto

O **ContraDito** atua como um motor de auditoria contínua que coleta o histórico legislativo de Deputados Federais e Senadores, processando o texto de seus discursos e cruzando-os com seus votos em plenário (em projetos e propostas de lei).

Utilizando Inteligência Artificial (modelo *BAAI/bge-m3* para vetorização e a API do *Google GenAI - Gemini* para resumos executivos das proposições) em uma arquitetura **RAG** (Retrieval-Augmented Generation), o sistema extrai dados e calcula métricas analíticas em tempo de consulta (como afinidades gêmeo/antípoda, fidelidade partidária, coesão partidária e polarização). Seu objetivo é dar transparência à atuação de parlamentares, evidenciando aos eleitores o alinhamento de suas ações legislativas.

## A Arquitetura (Resumo)

O sistema opera sob o padrão arquitetural **CQRS** rigorosamente isolado e orquestrado por contêineres Docker:

1. **Lado de Leitura (Query):** Front-end responsivo desenvolvido em **Next.js** comunicando-se com uma API de Leitura em **FastAPI** (porta `8001`). O ambiente é otimizado para atender consultas de leitura rápidas com cache em memória de TTL curto.
2. **Lado de Escrita (Command / Worker NLP):** Um *Worker* autônomo em Python que executa pipelines procedurais (padrão *Pipe and Filter*) para extração das APIs governamentais, fragmentação (*chunking*), geração de resumos das proposições via API do Gemini e vetorização. Ele roda de forma assíncrona por meio de run scripts específicos sob demanda.
3. **Persistência Central:** Os dados estruturados relacionais (perfis, proposições, discursos e votos) são armazenados no **Supabase (PostgreSQL)** em nuvem. A extensão `pgvector` foi descontinuada: 100% dos embeddings de discursos e resumos são armazenados e indexados de forma isolada no banco vetorial **Qdrant (Nuvem)**.

---

## Como Executar Localmente

Toda a orquestração do projeto foi projetada para que nenhum framework pesado precise ser instalado em sua máquina local, rodando estritamente em contêineres.

### Pré-requisitos
- **Docker** e **Docker Compose** nativamente instalados.
- **Git** para a clonagem.

### Passos de Execução

**1. Clone o repositório e acesse a pasta:**
```bash
git clone https://github.com/unb-mds/2026.1-ContraDito.git
cd 2026.1-ContraDito
```

**2. Configure o ambiente (.env):**
Crie um arquivo `.env` na raiz da pasta do projeto e defina as seguintes credenciais obrigatórias:
```env
# Supabase — banco relacional gerenciado
SUPABASE_URL=sua_url_do_projeto_aqui
SUPABASE_KEY=sua_chave_anon_publica_aqui

# Qdrant — banco vetorial gerenciado
QDRANT_URL=sua_url_do_qdrant_aqui
QDRANT_API_KEY=sua_chave_do_qdrant_aqui

# Motor de Inferência — API do Gemini
GEMINI_API_KEY=sua_chave_do_gemini_aqui

# Integração Interna / Front-end
NEXT_PUBLIC_API_URL=http://localhost:8001
```

**3. Inicie a Orquestração dos Contêineres:**
```bash
docker compose up --build
```

**4. Acesso aos Serviços Locais:**
Com a stack ativa, a plataforma será roteada localmente para as seguintes portas:
- **Aplicação Web (Next.js):** [http://localhost:3000](http://localhost:3000)
- **API de Leitura / Documentação Swagger (FastAPI):** [http://localhost:8001/docs](http://localhost:8001/docs)
- **Portal de Documentação (MkDocs):** [http://localhost:8002](http://localhost:8002)

**5. Executar o Worker Manualmente:**
O pipeline do Worker segue o padrão *Pipe and Filter* e é executado rodando os scripts sequenciais `run_*.py` na raiz do projeto (como `run_extrator_politicos.py`, `run_chunker_discursos.py`, etc.). O passo a passo e a ordem detalhada de execução de cada script podem ser consultados no manual de [execucao.md](file:///home/henrique/Faculdade%20-%20UNB/4%20SEMESTRE/MDS/Projeto_MDS/api-coerencia/docs/docs/execucao.md#L209).

---

## A Equipe (Squad 09)

Projeto idealizado e desenvolvido colaborativamente para a disciplina de Métodos de Desenvolvimento de Software da **Universidade de Brasília** (UnB - Faculdade do Gama):

- Henrique ([@henriquemendeselias](https://github.com/henriquemendeselias))
- João Guilherme ([@jot4-ge](https://github.com/jot4-ge))
- Luiz Henrique ([@luizhtmoreira](https://github.com/luizhtmoreira))
- Gabriel ([@G2SBiell](https://github.com/G2SBiell))
- Lucas ([@lucasaraujoszz](https://github.com/lucasaraujoszz))
- Matheus ([@matheus0346](https://github.com/matheus0346))

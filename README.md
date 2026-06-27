# ContraDito

> **O que os políticos dizem vs. o que eles votam.** Uma plataforma de transparência política movida a Inteligência Artificial.

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

O **ContraDito** atua como um motor de auditoria contínua que coleta o histórico legislativo de Deputados Federais e Senadores, processando o texto das notas taquigráficas de seus discursos e cruzando-os semanticamente com seus votos em plenário (em projetos e propostas de lei). 

Utilizando Inteligência Artificial avançada (modelos *LLaMA 3.1 8B* para sumarização e inferência, e *BAAI/bge-m3* para vetorização) em uma arquitetura **RAG** (Retrieval-Augmented Generation), o sistema calcula um **Score de Coerência** matemático e rastreável. Seu objetivo é evidenciar aos eleitores se as atitudes no plenário refletem verdadeiramente o que foi proferido no microfone público.

## A Arquitetura (Resumo)

O sistema foi concebido sob restrições estritas de alta performance e uso eficiente de recursos de IA, operando em um padrão arquitetural **CQRS** rigorosamente isolado e orquestrado por contêineres Docker:

1. **Lado de Leitura (Query):** Front-end responsivo desenvolvido em **Next.js** comunicando-se com uma API de Leitura blindada em **FastAPI**. O ambiente é otimizado para atender um alto volume de acessos lendo apenas dados consolidados e pré-processados, fazendo uso inteligente de cache em memória (InMemoryBackend).
2. **Lado de Escrita (Command / Worker NLP):** Um *Worker* autônomo em Python rodando processos agendados em *background*. Operando sob o padrão arquitetural *Pipe and Filter*, ele absorve a carga pesada de NLP: coleta das APIs federais oficiais, fragmentação (*chunking*), processamento de embeddings e inferência de veredito, escrevendo o *Score de Coerência* consolidado na base.
3. **Persistência Central:** Todo o estado do sistema, desde entidades básicas até vetores dimensionais gerados pelo modelo BAAI/bge-m3, é gerenciado pelo **Supabase** (PostgreSQL) potencializado pela extensão `pgvector`.

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
Crie um arquivo `.env` na raiz da pasta do projeto e defina as seguintes credenciais obrigatórias. *(Nota: o Supabase atua como banco de dados externo Serverless, ele não roda em contêiner).*
```env
# Conexões com o Supabase
SUPABASE_URL=sua_url_do_projeto_aqui
SUPABASE_KEY=sua_chave_anon_publica_aqui

# Conexões com Motor de Inferência IA
LLM_PROVIDER=groq # "groq" ou "colab"
GROQ_API_KEY=sua_chave_da_groq_aqui

# Integração Interna (Docker)
NEXT_PUBLIC_API_URL=http://localhost:8001
```

**3. Inicie a Orquestração dos Contêineres:**
```bash
docker compose up --build
```

> ** Atenção (Desenvolvedores em Apple Silicon / ARM64):**
> Certifique-se de que a tag `platform: linux/arm64` esteja incluída no `docker-compose.yml`. Emular os processos PyTorch via Rosetta resultará em degradação acentuada de CPU e consumo abusivo de RAM. Em sua primeira execução, o build baixará o modelo HuggingFace completo (~2.3GB), salvando em volume cache para agilizar os *rebuilds* seguintes.

**4. Acesso aos Serviços Locais:**
Com a stack ativa, a plataforma será roteada localmente para as seguintes portas:
- **Aplicação Web (Next.js - Vitrine do Eleitor):** [http://localhost:3000](http://localhost:3000)
- **API de Leitura / Documentação Swagger (FastAPI):** [http://localhost:8001/docs](http://localhost:8001/docs)

---

## A Equipe (Squad 09)

Projeto idealizado e desenvolvido colaborativamente para a disciplina de Métodos de Desenvolvimento de Software da **Universidade de Brasília** (UnB - Faculdade do Gama):

- Henrique ([@henriquemendeselias](https://github.com/henriquemendeselias))
- João Guilherme ([@jot4-ge](https://github.com/jot4-ge))
- Luiz Henrique ([@luizhtmoreira](https://github.com/luizhtmoreira))
- Gabriel ([@G2SBiell](https://github.com/G2SBiell))
- Lucas ([@lucasaraujoszz](https://github.com/lucasaraujoszz))
- Matheus ([@matheus0346](https://github.com/matheus0346))

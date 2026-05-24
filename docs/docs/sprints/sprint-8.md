# Sprint 08: Planejamento e Pair Programming

* **Data da Reunião:** 12/05/2026
* **Data de Entrega:** 19/05/2026
* **Dashboard de Produtividade:** [Acessar Dashboard](https://unb-mds.github.io/2026.1-ContraDito/productivity/)

## 1. Descrição e Objetivo
* Retrospectiva da sprint anterior com foco na revisão da documentação do projeto.
* Consolidação do dashboard de produtividade utilizando a abordagem SDD (Specification-Driven Development).
* Integração de métricas de produtividade com GitHub Actions.
* Planejamento do backlog baseado na metodologia XP (Extreme Programming), com adoção de Pair Programming para módulos de alta complexidade.

## 2. Participantes
* @henriquemendeselias
* @jot4-ge
* @luizhtmoreira
* @G2SBiell
* @lucasaraujoszz
* @matheus0346

## 3. Backlog da Sprint 08 (Tarefas e Requisitos)
1. **Gabriel (Front-end / UX):** Refatorar layout das Provas de Contradição [RF08], adicionar animações de Skeleton Screen durante carregamento da API [RF36] e criar Empty States para falhas e buscas vazias [RF38, RF39].
2. **João Guilherme e Lucas (Pair Programming - Extração, ETL e Banco Vetorial):** Coletar ementas de PLs e PECs [RF20], mapear voto nominal de cada parlamentar [RF21], adicionar Exponential Backoff [RF24], configurar threshold (0.2) no pgvector [RNF06, RF25] e persistir dados na tabela de provas [RF34].
3. **Henrique (API, Swagger e Infraestrutura):** Codificar lógica do Score de Coerência no FastAPI [RF27], configurar retorno de Score Nulo por falta de dados [RF15], implementar Rate Limiting [RNF09], configurar invalidação de cache [RF16] e isolar contêineres com timeout estrito [RNF08, RNF10].
4. **Luiz Henrique e Matheus (Pair Programming - Motor IA, NLP e RAG):** Orquestrar prompt RAG com Texto da Lei e Discursos [RF30, RF31], implementar restrição de viés temporal [RN01], criar trava de aborto do LLM para vetores vazios [RN02] e configurar estratégia de Chunking para matérias extensas [RF35].

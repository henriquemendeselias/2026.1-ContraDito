# Escopo e Visão Geral do Produto

Para garantir a entrega de uma Prova de Conceito (PoC) funcional e de alto valor dentro do semestre letivo, o **ContraDito** delimitou um escopo de atuação rigoroso.

---

## 1. Visão Geral

O sistema funciona como uma vitrine de transparência política. Ele coleta o histórico legislativo (fala e voto) de políticos federais, processa esses textos semanticamente por meio de Inteligência Artificial para correlacionar discursos e votos, e apresenta painéis com os dados processados.

---

## 2. O que ESTÁ no Escopo

- **Recorte Político e Temporal:** Análise restrita a Deputados Federais e Senadores, legislatura de **2023 a 2026**.
- **Filtro de Proposições e Votos:** Apenas PLs e PECs que foram a votação nominal. Somente o voto no **texto-base** é considerado.
- **Fontes de Dados (Discursos):** Notas Taquigráficas de Plenário ou Comissões, consumidas da API oficial do governo.
- **Processamento de IA:**
    - **Sumarização Temática:** Geração de resumos executivos das matérias via API do **Google GenAI** (Gemini).
    - **Fragmentação (Chunking):** Divisão dos discursos limpos em blocos menores com sobreposição para vetorização precisa.
    - **Busca Semântica e Vinculação:** Vetorização via SBERT (`BAAI/bge-m3`) com indexação e busca espacial no **Qdrant Cloud** para aproximar e vincular falas de parlamentares com os temas votados no Supabase.

---

## 3. O que NÃO ESTÁ no Escopo

!!! warning "Limitações Deliberadas"
    O sistema foca no mérito principal da lei. Estão excluídos: votos em **destaques, emendas e pedidos de urgência**, além de projetos menores (moções, homenagens e requerimentos procedimentais).

- **Atores Não-Federais:** Deputados Distritais, Estaduais, Vereadores, Prefeitos, Governadores e membros dos Poderes Executivo e Judiciário.
- **Redes Sociais e Mídia:** O motor vetorial ignora postagens em X (Twitter), Instagram, Facebook, TikTok ou entrevistas à imprensa. É exigido o registro taquigráfico oficial.
- **Tempo Real:** O portal não é um *feed* em tempo real — os dados dependem do ciclo agendado de extração.
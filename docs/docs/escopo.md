# Escopo e Visão Geral do Produto

Para garantir a entrega de uma Prova de Conceito (PoC) funcional e de alto valor dentro do semestre letivo, o **ContraDito** delimitou um escopo de atuação rigoroso.

---

## 1. Visão Geral

O sistema funciona como um **motor de auditoria contínua**. Ele coleta o histórico legislativo (fala e voto) de políticos, processa o texto semanticamente por meio de Inteligência Artificial e exibe um **Score de Coerência** ao eleitor.

A interface central concentra a barra de pesquisa, o ranking de parlamentares mais coerentes e as funcionalidades principais. A partir dela, o usuário navega entre:

- **Face-to-Face:** comparação direta entre dois políticos.
- **Dossiê:** página de perfil detalhada de cada parlamentar.

---

## 2. O que ESTÁ no Escopo

- **Recorte Político e Temporal:** Análise restrita a Deputados Federais e Senadores, legislatura de **2023 a 2026**.
- **Filtro de Proposições e Votos:** Apenas PLs e PECs que foram a votação nominal. Somente o voto no **texto-base** é considerado.
- **Fontes de Dados (Discursos):** Notas Taquigráficas de Plenário ou Comissões, consumidas da API oficial do governo.
- **Processamento de IA:**
    - **Resumo Executivo:** Gerado obrigatoriamente para respeitar o limite de vetorização do BGE-M3 (máx. 512 tokens).
    - **Chunking:** Discursos enviados em fragmentos ao modelo, prevenindo esgotamento de janela de contexto e alucinações.
    - **Inferência:** Uso restrito do **Llama 3.1 8B** para determinar a coerência.

---

## 3. O que NÃO ESTÁ no Escopo

!!! warning "Limitações Deliberadas"
    O sistema foca no mérito principal da lei. Estão excluídos: votos em **destaques, emendas e pedidos de urgência**, além de projetos menores (moções, homenagens e requerimentos procedimentais).

- **Atores Não-Federais:** Deputados Distritais, Estaduais, Vereadores, Prefeitos, Governadores e membros dos Poderes Executivo e Judiciário.
- **Redes Sociais e Mídia:** O motor vetorial ignora postagens em X (Twitter), Instagram, Facebook, TikTok ou entrevistas à imprensa. É exigido o registro taquigráfico oficial.
- **Tempo Real:** O portal não é um *feed* em tempo real — os dados dependem do ciclo agendado de extração.

### Exceções Matemáticas

Para garantir a integridade do Score de Coerência, os seguintes cenários são descartados pelo motor:

1. **Anacronismo de Discurso:** Discursos proferidos *após* a data de votação não entram no cálculo para aquela matéria.
2. **Ausências e Abstenções:** Não compõem o denominador do cálculo.
3. **Cold Start:** Políticos com dados insuficientes não terão o perfil avaliado, evitando distorções estatísticas.

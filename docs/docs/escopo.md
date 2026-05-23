# Escopo e Visão Geral do Produto

Para garantir a entrega de uma Prova de Conceito (PoC) funcional, testável e de alto valor agregado dentro do semestre letivo, o **ContraDito** delimitou um escopo de atuação rigoroso.

## 1. Visão Geral
O sistema funciona como um "motor de auditoria contínua". Ele coleta o histórico legislativo (fala e voto) de políticos, processa o texto semanticamente através de Inteligência Artificial e exibe um **Score de Coerência** ao eleitor. 

A interface central do produto concentra a barra de pesquisa de políticos, o ranking dos parlamentares mais coerentes e as principais funcionalidades do sistema. A partir dela, o usuário pode navegar entre o Face-to-Face, focado na comparação direta entre dois políticos distintos, e o Dossiê, uma página de perfil detalhada para cada parlamentar.

## 2. O que ESTÁ no escopo:

* **Recorte Político e Temporal:** Análise restrita a Deputados Federais e Senadores pertencentes ao ciclo legislativo de **2023 a 2026**.

* **Filtro de Proposições e Votos:** Avaliação exclusiva de Projetos de Lei (PLs) e Propostas de Emenda à Constituição (PECs) que **foram a votação nominal**. 
    * Apenas o voto registrado no **texto-base** da proposição é considerado.

* **Fontes de Dados (Discursos):** Extração limitada a Notas Taquigráficas de Plenário ou Comissões, consumidas diretamente da API oficial do governo.

* **Processamento de Inteligência Artificial:**
    * **Resumo Executivo:** Geração obrigatória de um resumo das ementas legislativas para respeitar o limite arquitetural de vetorização do modelo SBERT (máximo de 512 tokens).
    * **Fragmentação (*Chunking*):** Envio de *chunks* do discurso para avaliação do modelo, em vez do texto integral, prevenindo o esgotamento da janela de contexto e alucinações.
    * **Stack de Inferência:** Utilização restrita do modelo local **Llama 3.1 8B** para determinar a coerência.


## 3. O que NÃO ESTÁ no escopo:

O sistema foca exclusivamente no mérito principal da lei. Estão sumariamente excluídos da análise os votos em **destaques, emendas, pedidos de urgência**, bem como projetos menores (moções de aplauso, homenagens e requerimentos procedimentais).

* **Atores Políticos Não-Federais:** Deputados Distritais, Deputados Estaduais, Vereadores, Prefeitos, Governadores, além de membros do Poder Executivo (Presidente, Ministros) e Judiciário.
* **Análise de Redes Sociais e Mídia:** O motor vetorial ignora completamente postagens do X (Twitter), Instagram, Facebook, TikTok ou entrevistas concedidas à imprensa. A validação exige o registro taquigráfico oficial.
* **Tempo Real (*Real-time*):** O portal não é um *feed* em tempo real. Votos computados na Câmara não aparecerão instantaneamente na plataforma, dependendo do ciclo agendado de extração.

* **Exceções Matemáticas e Regras de Negócio:**
    Para garantir a integridade do cálculo do *Score* de Coerência, os seguintes cenários são descartados pelo motor de IA:
    
    1. **Anacronismo de Discurso:** Discursos proferidos em datas *posteriores* à votação da lei não entram no cálculo para aquela matéria específica.
    2. **Ausências e Abstenções:** Não entram no cálculo matemático penalizador ou bonificador da coerência.
    3. **Dados Insuficientes (Cold Start):** Políticos com um número irrisório de discursos ou votações catalogadas não terão seu perfil avaliado para evitar distorções estatísticas.

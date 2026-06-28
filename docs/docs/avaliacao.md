# Avaliação Final e Relevância

O desenvolvimento do **ContraDito** representou um desafio complexo no escopo da disciplina de Métodos de Desenvolvimento de Software (MDS/UnB). Esta seção consolida a avaliação final do produto, destacando seu impacto cívico e as conquistas de engenharia.

---

## 1. Relevância Social e Produto

O ecossistema político brasileiro é denso e, muitas vezes, opaco para o eleitor comum. O ContraDito cumpre seu objetivo principal: **reduzir a assimetria de informação**.

<!-- Ao traduzir discursos e registros de votações em um único *Score de Coerência*, a plataforma entrega uma métrica compreensível e direta. --> A capacidade de expor contradições — ou confirmar integridade política — empodera a sociedade civil com inteligência de dados, promovendo um controle social fundamentado em fatos.

---

## 2. Avaliação Técnica

Sob a ótica da engenharia de software, o projeto estabeleceu um padrão de excelência ao adotar uma arquitetura moderna, escalável e resiliente:

- **Orquestração via Docker Compose:** Ambiente padronizado, isolando responsabilidades de forma eficaz.
- **Isolamento do Motor NLP:** O Worker (PyTorch/SBERT) opera em rede interna sem exposição desnecessária, com tolerância a falhas que não afeta a FastAPI.
- **Performance e Escalabilidade:** Layer Caching otimizado e FastAPI garantem respostas ágeis. O `pgvector` local (escalando para Supabase) demonstra visão de futuro para produção.
- **Agnosticismo de Hardware:** Infraestrutura multi-arquitetura (ARM64 e AMD64) elimina gargalos nos ambientes de desenvolvimento.

---

## 3. Maturidade na Regra de Negócio

O grande êxito do ContraDito foi ir além do cruzamento binário de palavras.
<!-- A implementação de mitigações na fórmula do Score provou a sofisticação da análise: -->
<!-- - Ao instruir a IA a considerar o **fator temporal** (RN05) e o contexto de votos regimentais (destaques e emendas), o sistema evita a penalização injusta de parlamentares por manobras procedimentais. -->
<!-- - Isso garante uma blindagem lógica e aumenta a confiabilidade da métrica gerada. -->

---

## 4. Conclusão

O ContraDito transcende o status de projeto acadêmico tradicional. A equipe aplicou rigor metodológico, práticas avançadas de DevOps, inteligência artificial e design centrado no usuário para construir uma solução real para um problema real — um produto tecnicamente sofisticado e de alto valor público.
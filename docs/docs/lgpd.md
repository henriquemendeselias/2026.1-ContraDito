# Transparência, Governança de Dados e LGPD

O **ContraDito** possui um compromisso inegociável com a transparência pública, a ética algorítmica e a privacidade, operando em conformidade com a **LGPD (Lei nº 13.709/2018)** e a **LAI (Lei nº 12.527/2011)**.

---

## 1. Governança na Análise de Dados Públicos

O objetivo central é promover o controle social e evidenciar a aderência entre o discurso e a prática legislativa de figuras públicas. As premissas que garantem imparcialidade e legalidade são:

- **Enquadramento Legal (LGPD e LAI):** O processamento dos dados dos parlamentares ocorre sob as premissas do **interesse público** e da **transparência ativa** do Estado, enquadrando-se nas exceções do Artigo 4º da LGPD. São processados exclusivamente dados relacionados ao exercício do mandato público (votos, discursos e propostas legislativas).
- **Fontes Primárias Oficiais:** O pipeline ETL não realiza raspagem de sites de terceiros. A ingestão ocorre exclusivamente pelas APIs de Dados Abertos do Governo Federal (Câmara dos Deputados e Senado Federal).
- **Isenção Algorítmica:** O Score de Coerência não é uma avaliação subjetiva. É o resultado matemático e determinístico do cruzamento de dados executado pelo sistema. Para aprofundar, consulte a página [Cálculo do Score](./calculo-score.md).
- **Rastreabilidade e Auditoria:** A rastreabilidade é garantida pela exibição do voto oficial registrado (ex: PEC 45/2019) acompanhado da justificativa analítica elaborada pela IA.

---

## 2. Privacidade e Proteção do Cidadão

Se você é um cidadão navegando no ContraDito, a *Privacy by Default* é a regra.

### Quais dados coletamos e por quê?

- **Minimização de Dados:** A arquitetura atual **não exige criação de conta, login ou autenticação**. Não são solicitados, capturados ou processados Dados Pessoais Identificáveis (PII) dos visitantes, como e-mail, nome ou CPF.
- **Métricas de Navegação:** São coletados apenas dados de telemetria básicos e anonimizados (ex: taxa de rejeição, tempo de carregamento de página) para monitorar a estabilidade dos servidores e aprimorar a experiência de uso.

### Compartilhamento de Dados

!!! note "Natureza Acadêmica do Projeto"
    O **ContraDito não comercializa, aluga ou cede dados de tráfego para terceiros.** O projeto é mantido com o propósito exclusivo de fomentar a inovação cívica e o uso da Ciência de Dados para o bem público, com raízes no ambiente acadêmico da Universidade de Brasília (UnB).

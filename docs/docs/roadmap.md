# Próximos Passos (Roadmap)

A arquitetura atual do **ContraDito** estabelece uma fundação escalável e resiliente. Com o NLP e o banco vetorial consolidados, o projeto possui um vasto horizonte de evolução técnica e de produto.

---

## 1. Retenção e Personalização de Usuários

- **Monitoramento Personalizado:** Sistema de favoritos para acompanhar parlamentares específicos (ex: bancada do próprio estado).
- **Score de Coerência:**Score de coerência gerado pelo pipeline de IA que será disponibilizado no dossiê.
- **Motor de Alertas:** Notificações por e-mail sobre novos discursos, pautas iminentes ou variações significativas no Score de Coerência.

---

## 2. Evolução Analítica e Histórica

- **Série Histórica do Score:** Transformação do Score em um gráfico de linha do tempo, mostrando se o político ganhou ou perdeu coerência ao longo do mandato.
- **Extração Temática (Topic Modeling):** Uso do motor SBERT para clusterização de temas — gerando resumos visuais dos assuntos mais falados pelo político e os temas em que mais vota.

---

## 3. Ecossistema e Acesso aos Dados

- **API Pública para Pesquisadores:** Rotas públicas no FastAPI protegidas por *rate limiting* e chaves de API, transformando o ContraDito em provedor de dados para ONGs e veículos de mídia investigativa.
- **Near Real-Time:** Evolução do ETL (atualmente em *batch*) para arquitetura orientada a eventos (*webhooks* ou *polling* de alta frequência), reduzindo o tempo entre um discurso proferido e seu processamento na plataforma.
- **Implementação de Rotinas Cron:** Rotinas automatizadas de extração, agendadas semanalmente.
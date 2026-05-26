# Frontend e Interface (Next.js & Tailwind CSS)

A interface do **ContraDito** foi projetada com foco na experiência do usuário (UX), voltada principalmente ao **jornalista investigativo**. O objetivo é um painel rápido, responsivo e de fácil leitura para cruzamento de dados.

---

## Arquitetura Base

O frontend foi construído com **Next.js** (App Router), **React** e **Tailwind CSS**.

```mermaid
flowchart LR
    subgraph APP["App Router (Next.js)"]
        HOME["app/page.tsx\nDiretório + Busca + Ranking"]
        DOSSIE["app/politico/[id]/page.tsx\nDossiê do Parlamentar"]
        RINGUE["app/comparacao/page.tsx\nFace-to-Face"]
    end

    API["FastAPI\n:8000"]

    HOME -->|GET /api/politicos| API
    DOSSIE -->|GET /api/politicos/{id}| API
    RINGUE -->|GET /api/politicos/{id} x2| API
```

- **Tela Inicial (O Diretório):** `app/page.tsx` — barra de busca com filtros cruzados (Partido/UF) e ranking de políticos.
- **Dossiê do Político:** `app/politico/[id]/page.tsx` — tela detalhada listando histórico de discursos e evidências de contradição.

---

## Guia de Estilos e Design System

Para manter a identidade visual padronizada e transmitir a credibilidade de uma ferramenta *GovTech*:

| Elemento | Estilo |
|---|---|
| **Fundo principal** | `bg-slate-900` — escuro, tom investigativo e jornalístico. |
| **Tipografia** | `font-sans` — clean e moderna para leiturabilidade de textos longos. |
| **Score alto (coerente)** | `text-green-600` — verde semântico. |
| **Score baixo (contraditório)** | `text-red-600` — vermelho semântico. |
| **Cards e Tabelas** | `border-slate-300` + `bg-white` — alto contraste para leitura de dados. |
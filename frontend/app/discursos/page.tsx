// Página de discursos paginada (Câmara + Senado) — Server Component.
// Acessa searchParams para buscar a página correspondente no backend (Server-side Pagination).
// Carrega o diretório de parlamentares em paralelo para cruzamento de dados de avatar/partido no client.

import { fetchDiscursos } from "@/lib/discursos";
import { fetchDiretorioCompleto } from "@/lib/diretorio";
import { DiscursosClient } from "./DiscursosClient";
import type { Casa } from "@/lib/casa";
import type { Parlamentar } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    casa?: string;
    politico_id?: string;
    termo?: string;
    pagina?: string;
  }>;
};

export default async function DiscursosPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const casa: Casa = searchParams.casa === "senado" ? "senado" : "camara";
  const politicoId = searchParams.politico_id ? Number(searchParams.politico_id) : undefined;
  const termo = searchParams.termo ? searchParams.termo : undefined;
  const pagina = searchParams.pagina ? Number(searchParams.pagina) : 1;
  const tamanho = 20;

  let paginaDiscursos = null;
  let parlamentares: Parlamentar[] = [];
  let erro = false;

  try {
    const [discursosRes, parlamentaresRes] = await Promise.all([
      fetchDiscursos(casa, { politico_id: politicoId, termo, pagina, tamanho }),
      fetchDiretorioCompleto(),
    ]);
    paginaDiscursos = discursosRes;
    parlamentares = parlamentaresRes;
  } catch (e) {
    console.error("Erro ao buscar dados de discursos no servidor:", e);
    paginaDiscursos = {
      total_registros: 0,
      pagina_atual: pagina,
      tamanho_pagina: tamanho,
      total_paginas: 0,
      itens: [],
      aviso: termo
        ? "Não foi possível concluir a busca por esta palavra-chave. Tente usar um termo mais específico ou diferente."
        : "Não foi possível carregar a listagem de discursos neste momento.",
    };
    erro = false;
  }

  return (
    <DiscursosClient
      paginaDiscursos={
        paginaDiscursos ?? {
          total_registros: 0,
          pagina_atual: pagina,
          tamanho_pagina: tamanho,
          total_paginas: 0,
          itens: [],
        }
      }
      parlamentares={parlamentares}
      erro={erro}
    />
  );
}

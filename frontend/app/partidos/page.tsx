// Página de coesão partidária (Câmara + Senado) — Server Component.
// Faz o fetch em paralelo de ambas as casas no servidor e passa os dados para o Client Component.

import { fetchCoesaoPartidosCompleta } from "@/lib/partidos";
import type { CoesaoPartido } from "@/lib/types";
import { PartidosClient } from "./PartidosClient";

export const dynamic = "force-dynamic";

export default async function PartidosPage() {
  let partidos: CoesaoPartido[] | null = null;
  let erro = false;

  try {
    partidos = await fetchCoesaoPartidosCompleta();
  } catch (e) {
    console.error("Erro ao buscar coesão de partidos no servidor:", e);
    erro = true;
  }

  return <PartidosClient partidos={partidos ?? []} erro={erro} />;
}

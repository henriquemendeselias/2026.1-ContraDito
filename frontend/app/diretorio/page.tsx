// Diretório completo de parlamentares (Câmara + Senado) — Server Component.
// Faz o fetch-all-once no servidor (ADR 003) e passa dados OU erro para o client.

import { fetchDiretorioCompleto } from "@/lib/diretorio";
import type { Parlamentar } from "@/lib/types";
import { DiretorioClient } from "./DiretorioClient";

// Sempre renderiza no request (a lista vem da API; não prerenderizar estático).
export const dynamic = "force-dynamic";

export default async function DiretorioPage() {
  let parlamentares: Parlamentar[] | null = null;
  let erro = false;

  try {
    parlamentares = await fetchDiretorioCompleto();
  } catch {
    erro = true;
  }

  return <DiretorioClient parlamentares={parlamentares ?? []} erro={erro} />;
}

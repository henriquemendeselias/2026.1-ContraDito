"use client";

// Vitrine de busca da Home (preview). Decisão A2: SEM resultados ao vivo — o submit
// (Enter ou seta) e o CTA "Ver lista completa" NAVEGAM para /diretorio?busca=…&casa=…
// O diretório completo (listagem real) é responsabilidade da rota /diretorio.

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function HomeBusca() {
  const router = useRouter();

  return (
    <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => router.push("/diretorio")}
        className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-medium bg-coherent text-canvas hover:opacity-90 transition-all cursor-pointer"
      >
        Ver lista completa <ArrowRight size={17} />
      </button>
      <span className="text-xs font-semibold text-mid">887 parlamentares no diretório →</span>
    </div>
  );
}

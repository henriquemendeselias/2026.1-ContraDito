"use client";

// Vitrine de busca da Home (preview). Decisão A2: SEM resultados ao vivo — o submit
// (Enter ou seta) e o CTA "Ver lista completa" NAVEGAM para /diretorio?busca=…&casa=…
// O diretório completo (listagem real) é responsabilidade da rota /diretorio.

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function HomeBusca() {
  const router = useRouter();

  return (
    <div className="w-full max-w-xl mx-auto flex items-center justify-center">
      <button
        type="button"
        onClick={() => router.push("/diretorio")}
        className="inline-flex items-center gap-2.5 h-12 px-6 rounded-xl font-medium bg-coherent text-canvas hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-coherent/10 cursor-pointer"
      >
        Explorar todos os 887 parlamentares <ArrowRight size={17} />
      </button>
    </div>
  );
}

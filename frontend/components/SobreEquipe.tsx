// Seção "Sobre o ContraDito" + Equipe (storytelling + grid de cards de membro).
// Aparece ao final da Home, via scroll.

import { STORY, EQUIPE } from "@/lib/equipe";
import { MembroCard } from "@/components/MembroCard";

export function SobreEquipe() {
  return (
    <section id="sobre" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
      <p className="text-xs uppercase tracking-[0.25em] text-coherent">Sobre o ContraDito</p>
      <div className="mt-5 max-w-3xl space-y-4">
        {STORY.map((p, i) => (
          <p key={i} className={i === 0 ? "font-display text-2xl sm:text-3xl text-bright leading-snug" : "text-mid leading-relaxed"}>
            {p}
          </p>
        ))}
      </div>

      <div className="mt-16">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <h3 className="font-display text-2xl text-bright">A equipe — Squad 09</h3>
          <p className="text-sm text-dim">Estudantes de Engenharia de Software · UnB / FCTE</p>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EQUIPE.map((m) => <MembroCard key={m.handle} m={m} />)}
        </div>
      </div>
    </section>
  );
}

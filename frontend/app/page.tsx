// Home (vitrine) do portal de consulta ContraDito.
// Hero com a silhueta do Congresso Nacional + storytelling + números reais + busca/
// seletor de Casa (preview → /diretorio). Sem score, sem ranking, sem listagem aqui.

import { CongressoSilhueta } from "@/components/CongressoSilhueta";
import { HomeBusca } from "@/components/home/HomeBusca";
import { SobreEquipe } from "@/components/SobreEquipe";
import { SiteFooter } from "@/components/SiteFooter";
import { PROJECT_STATS } from "@/lib/equipe";
import { CASA, tint } from "@/lib/casa";

export default function HomePage() {
  return (
    <div className="pt-14">
      {/* HERO */}
      <header className="relative min-h-[86vh] flex items-center justify-center overflow-hidden px-5 text-center">
        {/* brilho ambiente (pulse/aurum) */}
        <div className="absolute inset-0 z-0" style={{
          background: `radial-gradient(80% 60% at 50% -10%, ${tint(CASA.camara.hex, 18)}, transparent 60%), radial-gradient(55% 50% at 85% 15%, ${tint(CASA.senado.hex, 14)}, transparent 55%)`,
        }} />

        {/* silhueta do Congresso, largura cheia, ancorada na base */}
        <CongressoSilhueta
          variant="fill"
          className="absolute bottom-0 inset-x-0 z-0 w-full h-auto pointer-events-none"
        />

        {/* overlay adaptável ao tema (legibilidade do texto sobre a silhueta) */}
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{
          background: `radial-gradient(72% 58% at 50% 40%, var(--color-canvas) 0%, var(--color-canvas) 30%, color-mix(in srgb, var(--color-canvas) 55%, transparent) 56%, transparent 80%), linear-gradient(to top, var(--color-canvas) 8%, transparent 48%)`,
        }} />

        {/* conteúdo */}
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-coherent">Portal de consulta · Câmara e Senado</p>
          <h1 className="font-display text-bright font-black leading-[0.92] mt-5 text-6xl sm:text-8xl">
            O que dizem.<br /><span className="text-coherent italic font-normal">Como votam.</span>
          </h1>
          <p className="text-mid max-w-xl mx-auto mt-6 text-lg leading-relaxed">
            Discursos, votações e proposições das duas casas legislativas, reunidos e abertos para você consultar.
          </p>
          <div className="mt-8">
            <HomeBusca />
          </div>
        </div>
      </header>

      {/* faixa de números reais do projeto */}
      <section className="relative z-10 border-y border-rim/30 bg-card/30">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-2 lg:grid-cols-4 divide-x divide-rim/20">
          {PROJECT_STATS.map((s) => (
            <div key={s.label} className="px-5 py-7 text-center">
              <p className="font-display text-4xl text-bright">{s.value}</p>
              <p className="text-sm text-mid mt-1 capitalize">{s.label}</p>
              <p className="text-[11px] text-dim mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <SobreEquipe />
      <SiteFooter />
    </div>
  );
}

// Skeleton Loader para a página do Dossiê do Parlamentar (/politico/[id]).
// Exibido instantaneamente pelo Next.js (App Router) durante o fetch server-side.

export default function PoliticoLoading() {
  return (
    <div className="pt-14 min-h-screen animate-pulse">
      {/* Cover / Header Profile Skeleton */}
      <header className="border-b border-rim/30 bg-card/20 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-28 h-28 rounded-full bg-card-alt/80 border border-rim/40 shrink-0" />
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="h-8 w-64 bg-card-alt/90 rounded-xl mx-auto md:mx-0" />
            <div className="h-4 w-48 bg-card-alt/60 rounded-lg mx-auto md:mx-0" />
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
              <div className="h-6 w-20 bg-card-alt/70 rounded-full" />
              <div className="h-6 w-24 bg-card-alt/70 rounded-full" />
              <div className="h-6 w-16 bg-card-alt/70 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo do Dossiê Skeleton */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 rounded-2xl border border-rim/30 bg-card/30 p-4 space-y-2">
            <div className="h-3 w-20 bg-card-alt/60 rounded" />
            <div className="h-8 w-16 bg-card-alt/90 rounded" />
          </div>
          <div className="h-24 rounded-2xl border border-rim/30 bg-card/30 p-4 space-y-2">
            <div className="h-3 w-20 bg-card-alt/60 rounded" />
            <div className="h-8 w-16 bg-card-alt/90 rounded" />
          </div>
          <div className="h-24 rounded-2xl border border-rim/30 bg-card/30 p-4 space-y-2">
            <div className="h-3 w-20 bg-card-alt/60 rounded" />
            <div className="h-8 w-16 bg-card-alt/90 rounded" />
          </div>
        </div>

        {/* Linha do Tempo e Votos Skeleton */}
        <div className="h-80 rounded-2xl border border-rim/30 bg-card/30 p-6 space-y-4">
          <div className="h-6 w-56 bg-card-alt/80 rounded-lg" />
          <div className="h-56 w-full bg-card-alt/40 rounded-xl" />
        </div>
      </main>
    </div>
  );
}

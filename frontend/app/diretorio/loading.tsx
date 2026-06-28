// Skeleton Loader para a página de Diretório de Parlamentares.
// Exibido instantaneamente pelo Next.js (App Router) durante o fetch server-side.

export default function DiretorioLoading() {
  return (
    <div className="pt-14 min-h-screen animate-pulse">
      {/* Cabeçalho */}
      <header className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-5">
        <div className="h-10 w-72 bg-card-alt/80 rounded-xl mb-3" />
        <div className="h-4 w-96 bg-card-alt/50 rounded-lg" />
      </header>

      {/* Controles Sticky Skeleton */}
      <div className="sticky top-14 z-30 bg-canvas/90 backdrop-blur-md border-y border-rim/30">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex flex-wrap items-center gap-3">
          <div className="h-10 w-48 bg-card-alt/80 rounded-xl" />
          <div className="h-10 flex-1 min-w-[200px] max-w-md bg-card-alt/60 rounded-xl" />
          <div className="h-10 w-28 bg-card-alt/60 rounded-xl" />
          <div className="h-10 w-32 bg-card-alt/60 rounded-xl" />
          <div className="h-4 w-24 bg-card-alt/50 rounded-lg ml-auto" />
        </div>
      </div>

      {/* Tabela de Parlamentares Skeleton */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-6">
        <div className="rounded-xl border border-rim/30 overflow-hidden bg-card/20">
          {/* Header da Tabela */}
          <div className="hidden sm:grid grid-cols-[1fr_5rem_3rem_9rem_7rem] gap-4 px-5 py-3 bg-card-alt/60 border-b border-rim/30">
            <div className="h-3 w-20 bg-card-alt/80 rounded" />
            <div className="h-3 w-12 bg-card-alt/80 rounded" />
            <div className="h-3 w-8 bg-card-alt/80 rounded" />
            <div className="h-3 w-16 bg-card-alt/80 rounded" />
            <div className="h-3 w-12 bg-card-alt/80 rounded justify-self-end" />
          </div>

          {/* Linhas Skeleton */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_5rem_3rem_9rem_7rem] gap-4 items-center px-5 py-3.5 border-b border-rim/15"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-card-alt/80 shrink-0" />
                <div className="space-y-2 flex-1 max-w-xs">
                  <div className="h-4 w-36 bg-card-alt/90 rounded" />
                  <div className="h-3 w-48 bg-card-alt/50 rounded" />
                </div>
              </div>
              <div className="hidden sm:block h-4 w-12 bg-card-alt/70 rounded" />
              <div className="hidden sm:block h-4 w-8 bg-card-alt/70 rounded" />
              <div className="hidden sm:block h-4 w-24 bg-card-alt/50 rounded" />
              <div className="h-6 w-20 bg-card-alt/80 rounded-full justify-self-end" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

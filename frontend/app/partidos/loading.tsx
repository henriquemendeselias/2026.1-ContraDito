// Skeleton Loader para a página de Coesão Partidária.
// Exibido instantaneamente pelo Next.js (App Router) durante o fetch server-side.

export default function PartidosLoading() {
  return (
    <div className="pt-14 min-h-screen animate-pulse">
      {/* Cabeçalho */}
      <header className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-5">
        <div className="h-10 w-60 bg-card-alt/80 rounded-xl mb-3" />
        <div className="h-4 w-96 max-w-full bg-card-alt/50 rounded-lg" />
      </header>

      {/* Controles de Filtro e Busca Skeleton */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-rim/30">
          <div className="h-10 w-48 bg-card-alt/80 rounded-xl" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-64 bg-card-alt/60 rounded-xl" />
            <div className="h-10 w-40 bg-card-alt/60 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Grid de Cards de Partidos Skeleton */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-rim/30 bg-card/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-card-alt/80" />
                <div className="h-6 w-20 bg-card-alt/90 rounded-lg" />
              </div>
              <div className="h-8 w-16 bg-card-alt/80 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="h-3 w-24 bg-card-alt/60 rounded" />
                <div className="h-3 w-12 bg-card-alt/80 rounded" />
              </div>
              <div className="h-3 w-full bg-card-alt/40 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-card-alt/80 rounded-full" />
              </div>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-rim/15">
              <div className="h-3 w-28 bg-card-alt/50 rounded" />
              <div className="h-3 w-20 bg-card-alt/50 rounded" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

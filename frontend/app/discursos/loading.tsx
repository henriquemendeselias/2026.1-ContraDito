// Skeleton Loader para a página de Discursos.
// Exibido instantaneamente pelo Next.js (App Router) durante o fetch server-side.

export default function DiscursosLoading() {
  return (
    <div className="pt-14 min-h-screen animate-pulse">
      {/* Cabeçalho */}
      <header className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-5">
        <div className="h-10 w-64 bg-card-alt/80 rounded-xl mb-3" />
        <div className="h-4 w-96 max-w-full bg-card-alt/50 rounded-lg" />
      </header>

      {/* Painel de Filtros e Busca Skeleton */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-6">
        <div className="rounded-2xl border border-rim/30 bg-card/30 p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 w-44 bg-card-alt/80 rounded-xl" />
            <div className="h-10 flex-1 min-w-[240px] bg-card-alt/60 rounded-xl" />
            <div className="h-10 w-36 bg-card-alt/60 rounded-xl" />
          </div>
          <div className="h-12 w-full bg-card-alt/50 rounded-xl" />
        </div>
      </div>

      {/* Grid de Cards de Discursos Skeleton */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-rim/30 bg-card/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-card-alt/80" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-card-alt/90 rounded" />
                  <div className="h-3 w-28 bg-card-alt/50 rounded" />
                </div>
              </div>
              <div className="h-6 w-24 bg-card-alt/80 rounded-full" />
            </div>
            <div className="space-y-2 py-2 border-y border-rim/15">
              <div className="h-4 w-full bg-card-alt/60 rounded" />
              <div className="h-4 w-5/6 bg-card-alt/60 rounded" />
              <div className="h-4 w-4/6 bg-card-alt/40 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-32 bg-card-alt/50 rounded" />
              <div className="h-8 w-28 bg-card-alt/70 rounded-lg" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

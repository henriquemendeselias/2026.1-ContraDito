// Skeleton Loader para a página de Proposições.
// Exibido instantaneamente pelo Next.js (App Router) durante o fetch server-side.

export default function ProposicoesLoading() {
  return (
    <div className="pt-14 min-h-screen animate-pulse">
      {/* Cabeçalho */}
      <header className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-5">
        <div className="h-10 w-64 bg-card-alt/80 rounded-xl mb-3" />
        <div className="h-4 w-96 max-w-full bg-card-alt/50 rounded-lg" />
      </header>

      {/* Busca e Filtros Skeleton */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-6">
        <div className="flex flex-wrap gap-3 py-3 border-y border-rim/30">
          <div className="h-10 w-44 bg-card-alt/80 rounded-xl" />
          <div className="h-10 flex-1 min-w-[200px] bg-card-alt/60 rounded-xl" />
          <div className="h-10 w-36 bg-card-alt/60 rounded-xl" />
        </div>
      </div>

      {/* Lista de Proposições Skeleton */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-rim/30 bg-card/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-card-alt/90 rounded-lg" />
              <div className="h-6 w-20 bg-card-alt/70 rounded-full" />
            </div>
            <div className="h-4 w-full bg-card-alt/60 rounded" />
            <div className="h-4 w-4/5 bg-card-alt/50 rounded" />
            <div className="flex items-center justify-between pt-2 border-t border-rim/15">
              <div className="h-3 w-36 bg-card-alt/40 rounded" />
              <div className="h-3 w-24 bg-card-alt/40 rounded" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

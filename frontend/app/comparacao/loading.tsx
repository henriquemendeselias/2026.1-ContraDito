// Skeleton Loader para a página de Comparação 1×1.
// Exibido instantaneamente pelo Next.js (App Router) durante o fetch server-side.

export default function ComparacaoLoading() {
  return (
    <div className="pt-14 min-h-screen animate-pulse">
      {/* Cabeçalho */}
      <header className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-5">
        <div className="h-10 w-72 bg-card-alt/80 rounded-xl mb-3" />
        <div className="h-4 w-96 max-w-full bg-card-alt/50 rounded-lg" />
      </header>

      {/* Seletores 1x1 Skeleton */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 rounded-2xl border border-rim/30 bg-card/30 p-5 space-y-3">
            <div className="h-4 w-28 bg-card-alt/80 rounded" />
            <div className="h-12 w-full bg-card-alt/60 rounded-xl" />
          </div>
          <div className="h-32 rounded-2xl border border-rim/30 bg-card/30 p-5 space-y-3">
            <div className="h-4 w-28 bg-card-alt/80 rounded" />
            <div className="h-12 w-full bg-card-alt/60 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Gráfico / Timeline Skeleton */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-4 space-y-6">
        <div className="h-72 rounded-2xl border border-rim/30 bg-card/30 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="h-6 w-48 bg-card-alt/80 rounded-lg" />
            <div className="h-6 w-32 bg-card-alt/60 rounded-lg" />
          </div>
          <div className="h-44 w-full bg-card-alt/40 rounded-xl flex items-end p-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-card-alt/80 rounded-t"
                style={{ height: `${20 + Math.sin(i) * 30 + 40}%` }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

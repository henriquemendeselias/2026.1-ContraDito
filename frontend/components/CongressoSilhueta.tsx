// Silhueta do Congresso Nacional (Niemeyer, 1960) — elemento de fundo do hero da Home.
//
// Referência arquitetônica:
//   • DUAS cúpulas nas extremidades do prédio anexo baixo e horizontal:
//       - CÔNCAVA (tigela, abertura p/ cima) = Câmara dos Deputados  [à esquerda]
//       - CONVEXA (cúpula fechada por cima)  = Senado Federal        [à direita]
//   • DUAS torres gêmeas verticais e altas no centro, entre as cúpulas
//   • PONTE horizontal ligando as torres NA METADE DA ALTURA delas
//   • Prédio anexo horizontal e baixo conectando tudo na base
//
// Tema: usa currentColor (herda a cor do container) — adapta-se a claro/escuro
// automaticamente. Nenhuma cor sólida hardcoded.

export function CongressoSilhueta({ className = "", variant = "fill" }: {
  className?: string;
  variant?: "outline" | "fill";
}) {
  const fillOpacity = variant === "fill" ? 0.13 : 0;
  const strokeOpacity = variant === "fill" ? 0.42 : 0.6;

  return (
    <svg
      viewBox="0 0 1200 480"
      preserveAspectRatio="xMidYMax meet"
      className={className}
      role="img"
      aria-label="Silhueta do Congresso Nacional"
      style={{ color: "var(--color-bright)" }}
    >
      <g
        fill="currentColor"
        fillOpacity={fillOpacity}
        stroke="currentColor"
        strokeOpacity={strokeOpacity}
        strokeWidth={2.25}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        {/* espelho d'água / esplanada */}
        <line x1="60" y1="424" x2="1140" y2="424" strokeOpacity={strokeOpacity * 0.5} />
        <line x1="120" y1="436" x2="1080" y2="436" strokeOpacity={strokeOpacity * 0.3} />
        {/* prédio anexo: volume horizontal baixo (plataforma do Congresso) */}
        <path d="M100 380 H1100 V410 H100 Z" />
        <line x1="100" y1="380" x2="1100" y2="380" />
        {/* Câmara dos Deputados — cúpula CÔNCAVA (tigela, abre p/ cima) */}
        <path d="M195 322 A105 58 0 0 0 405 322" />
        {/* Senado Federal — cúpula CONVEXA (domo fechado por cima) */}
        <path d="M807 380 A98 66 0 0 1 1003 380" />
        {/* torres gêmeas centrais (base y=380, topo y=44) */}
        <path d="M556 380 V44 H586 V380 Z" />
        <path d="M614 380 V44 H644 V380 Z" />
        {/* ponte/passarela ligando as torres NA METADE DA ALTURA (meio em y=212) */}
        <path d="M556 205 H644 V219 H556 Z" />
      </g>
    </svg>
  );
}

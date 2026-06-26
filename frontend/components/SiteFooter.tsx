// Rodapé do site (Home e demais páginas que quiserem reaproveitar).

import { ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-rim/30 bg-card/40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-display font-black tracking-tight text-lg">
          <span className="text-bright">CONTRA</span>
          <span className="text-coherent italic font-normal">dito</span>
        </span>
        <p className="text-xs text-dim text-center">
          Portal de consulta · dados oficiais da Câmara dos Deputados e do Senado Federal · projeto acadêmico MDS · UnB / FCTE · 2026
        </p>
        <a href="https://unb-mds.github.io/2026.1-ContraDito/" target="_blank" rel="noreferrer"
           className="text-xs text-mid hover:text-bright inline-flex items-center gap-1">
          Documentação <ArrowUpRight size={13} />
        </a>
      </div>
    </footer>
  );
}

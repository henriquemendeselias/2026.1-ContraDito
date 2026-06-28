"use client";

import { useState } from "react";
import Link from "next/link";
import { List, GitCompareArrows, Building2, MessageSquare, FileText, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 border-b border-rim/20 bg-canvas/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="font-display font-black tracking-tight text-lg select-none">
          <span className="text-bright">CONTRA</span>
          <span className="text-coherent italic font-normal">dito</span>
        </Link>

        {/* Menu Desktop (Escondido em telas menores que md) */}
        <div className="max-md:hidden flex items-center gap-1">
          <Link
            href="/diretorio"
            className="px-3 py-1.5 inline-flex items-center gap-1.5 text-sm text-mid hover:text-bright transition-colors"
          >
            <List size={15} /> Parlamentares
          </Link>
          <Link
            href="/partidos"
            className="px-3 py-1.5 inline-flex items-center gap-1.5 text-sm text-mid hover:text-bright transition-colors"
          >
            <Building2 size={15} /> Partidos
          </Link>
          <Link
            href="/discursos"
            className="px-3 py-1.5 inline-flex items-center gap-1.5 text-sm text-mid hover:text-bright transition-colors"
          >
            <MessageSquare size={15} /> Discursos
          </Link>
          <Link
            href="/proposicoes"
            className="px-3 py-1.5 inline-flex items-center gap-1.5 text-sm text-mid hover:text-bright transition-colors"
          >
            <FileText size={15} /> Proposições
          </Link>
          <Link
            href="/comparacao"
            className="px-3 py-1.5 inline-flex items-center gap-1.5 text-sm text-mid hover:text-bright border border-white/10 rounded-full transition-colors hover:border-white/20"
          >
            <GitCompareArrows size={15} /> Comparação
          </Link>
          <ThemeToggle />
        </div>

        {/* Controles Mobile (Apenas visíveis em mobile < md) */}
        <div className="max-md:flex hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="w-9 h-9 rounded-lg border border-rim/30 flex items-center justify-center text-mid hover:text-bright hover:bg-card-alt/50 transition-colors cursor-pointer"
            aria-label={menuAberto ? "Fechar Menu" : "Abrir Menu"}
          >
            {menuAberto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      {menuAberto && (
        <div className="absolute top-14 left-0 right-0 border-b border-rim/25 bg-canvas/95 backdrop-blur-md flex flex-col p-4 gap-2.5 max-md:flex hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/diretorio"
            onClick={() => setMenuAberto(false)}
            className="px-4 py-3 rounded-xl bg-card-alt/40 border border-rim/15 inline-flex items-center gap-3 text-sm text-mid hover:text-bright transition-colors"
          >
            <List size={16} /> Parlamentares
          </Link>
          <Link
            href="/partidos"
            onClick={() => setMenuAberto(false)}
            className="px-4 py-3 rounded-xl bg-card-alt/40 border border-rim/15 inline-flex items-center gap-3 text-sm text-mid hover:text-bright transition-colors"
          >
            <Building2 size={16} /> Partidos
          </Link>
          <Link
            href="/discursos"
            onClick={() => setMenuAberto(false)}
            className="px-4 py-3 rounded-xl bg-card-alt/40 border border-rim/15 inline-flex items-center gap-3 text-sm text-mid hover:text-bright transition-colors"
          >
            <MessageSquare size={16} /> Discursos
          </Link>
          <Link
            href="/proposicoes"
            onClick={() => setMenuAberto(false)}
            className="px-4 py-3 rounded-xl bg-card-alt/40 border border-rim/15 inline-flex items-center gap-3 text-sm text-mid hover:text-bright transition-colors"
          >
            <FileText size={16} /> Proposições
          </Link>
          <Link
            href="/comparacao"
            onClick={() => setMenuAberto(false)}
            className="px-4 py-3 rounded-xl bg-card-alt/60 border border-coherent/40 inline-flex items-center gap-3 text-sm text-coherent font-medium transition-colors"
          >
            <GitCompareArrows size={16} /> Comparação
          </Link>
        </div>
      )}
    </nav>
  );
}
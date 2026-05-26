import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

// --- Configuração das fontes do ContraDito ---
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"], // Pesos usados nos títulos
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Pesos usados no corpo do texto e tabela
  variable: "--font-dm",
});

// --- SEO e Metadados do Projeto ---
export const metadata: Metadata = {
  title: "Contradito – O que foi dito vs. Realidade",
  description: "Acompanhe a coerência dos parlamentares brasileiros com base em Inteligência Artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0d1117]">
        {children}
      </body>
    </html>
  );
}
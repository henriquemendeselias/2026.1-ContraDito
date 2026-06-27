"use client";

import { useEffect, useState } from "react";

export function CongressoFoto() {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const updateTheme = () => {
      const current = document.documentElement.getAttribute("data-theme") as "dark" | "light";
      setTheme(current || "light");
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Exibe estritamente a foto de dia no modo claro e a foto de noite no modo escuro */}
      {theme === "light" ? (
        <img
          src="/images/foto_dia_congresso.jpeg"
          alt="Congresso Nacional - Dia"
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 opacity-95"
        />
      ) : (
        <img
          src="/images/foto_noite_congresso.jpeg"
          alt="Congresso Nacional - Noite"
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 opacity-80"
        />
      )}

      {/* Overlay transparente e equilibrado para garantir visibilidade da foto e legibilidade do texto */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-500"
        style={{
          background:
            theme === "light"
              ? "linear-gradient(to bottom, rgba(238, 241, 247, 0.45) 0%, rgba(238, 241, 247, 0.2) 40%, rgba(238, 241, 247, 0.75) 85%, rgba(238, 241, 247, 1) 100%)"
              : "linear-gradient(to bottom, rgba(5, 8, 15, 0.65) 0%, rgba(5, 8, 15, 0.35) 40%, rgba(5, 8, 15, 0.85) 85%, rgba(5, 8, 15, 1) 100%)",
        }}
      />
    </div>
  );
}

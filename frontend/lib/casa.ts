// Identidade visual por casa legislativa. pulse (azul) = Câmara, aurum (âmbar) = Senado.
// Só identificação visual de origem — sem julgamento de valor (não é score).

export type Casa = "camara" | "senado";

export const CASA: Record<Casa, { label: string; full: string; hex: string }> = {
  camara: { label: "Câmara", full: "Câmara dos Deputados", hex: "#5e88ff" },
  senado: { label: "Senado", full: "Senado Federal", hex: "#f59e0b" },
};

export const tint = (hex: string, a: number) =>
  `color-mix(in srgb, ${hex} ${a}%, transparent)`;

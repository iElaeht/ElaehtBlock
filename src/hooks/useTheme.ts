import { useState, useCallback, useMemo } from "react";

const THEMES = [
  // --- GRUPO: CAFÉ Y CÁLIDOS (SUAVES) ---
  { id: "cappuccino", bg: "bg-gradient-to-br from-[#2D1B14] via-[#4B3832] to-[#634832]", text: "text-amber-50/90", accent: "bg-amber-100/10 border border-amber-200/30 !text-amber-100", accentText: "text-amber-200" },
  { id: "espresso", bg: "bg-gradient-to-br from-[#120C06] via-[#2A1D15] to-[#3E2C23]", text: "text-amber-50/80", accent: "bg-orange-900/40 border border-orange-700/50 !text-orange-100", accentText: "text-orange-400" },
  
  // --- GRUPO: FRÍOS Y NOCTURNOS (BAJO BRILLO) ---
  { id: "midnight-nebula", bg: "bg-gradient-to-br from-[#0A0A1A] via-[#12122B] to-[#1A1A3A]", text: "text-cyan-50/90", accent: "bg-cyan-500/10 border border-cyan-500/40 !text-cyan-100", accentText: "text-cyan-400" },
  { id: "arctic-night", bg: "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155]", text: "text-sky-50/90", accent: "bg-sky-500/10 border border-sky-400/40 !text-sky-100", accentText: "text-sky-400" },
  { id: "deep-ocean", bg: "bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#1E1B4B]", text: "text-indigo-100/90", accent: "bg-indigo-500/20 border border-indigo-400/40 !text-indigo-200", accentText: "text-indigo-300" },

  // --- GRUPO: NATURALEZA (MATES) ---
  { id: "deep-forest", bg: "bg-gradient-to-br from-[#051109] via-[#062D17] to-[#143D21]", text: "text-emerald-50/90", accent: "bg-emerald-500/10 border border-emerald-500/40 !text-emerald-100", accentText: "text-emerald-400" },
  { id: "moss-stone", bg: "bg-gradient-to-br from-[#1C1D17] via-[#2E3025] to-[#454739]", text: "text-lime-50/80", accent: "bg-lime-500/10 border border-lime-400/30 !text-lime-200", accentText: "text-lime-300" },
  { id: "sage-garden", bg: "bg-gradient-to-br from-[#2D362F] via-[#4A5D4E] to-[#607D66]", text: "text-green-50/90", accent: "bg-green-100/10 border border-green-200/20 !text-green-50", accentText: "text-green-200" },

  // --- GRUPO: VINTAGE Y PASTELES OSCUROS ---
  { id: "deep-plum", bg: "bg-gradient-to-br from-[#1A091A] via-[#311131] to-[#4A194A]", text: "text-fuchsia-50/90", accent: "bg-fuchsia-500/10 border border-fuchsia-500/40 !text-fuchsia-100", accentText: "text-fuchsia-400" },
  { id: "muted-coral", bg: "bg-gradient-to-br from-[#2D1616] via-[#4A2626] to-[#633434]", text: "text-rose-50/90", accent: "bg-rose-500/10 border border-rose-500/40 !text-rose-100", accentText: "text-rose-400" },
  { id: "dusty-rose", bg: "bg-gradient-to-br from-[#3D2B2B] via-[#5C4141] to-[#7A5656]", text: "text-pink-50/90", accent: "bg-pink-100/10 border border-pink-200/20 !text-pink-50", accentText: "text-pink-200" },

  // --- GRUPO: PREMIUM / OSCUROS TOTALES ---
  { id: "charcoal-gold", bg: "bg-gradient-to-br from-[#0A0A0A] via-[#141414] to-[#1F1F1F]", text: "text-amber-100/80", accent: "bg-amber-500/10 border border-amber-600/40 !text-amber-200", accentText: "text-amber-500" },
  { id: "obsidian-slate", bg: "bg-gradient-to-br from-[#020202] via-[#0F172A] to-[#1E293B]", text: "text-slate-100/80", accent: "bg-slate-400/10 border border-slate-500/40 !text-slate-200", accentText: "text-slate-400" },
  { id: "industrial-iron", bg: "bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#404040]", text: "text-gray-100/90", accent: "bg-gray-400/10 border border-gray-500/30 !text-gray-100", accentText: "text-gray-300" },
];

export const useTheme = () => {
  const [themeIndex, setThemeIndex] = useState(0);
  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem("performance-mode") === "true");

  // AHORA RECIBE LAS LÍNEAS: Esto sincroniza el fondo con el tablero
  const changeTheme = useCallback((lines: number) => {
    const nextIndex = lines % THEMES.length;
    setThemeIndex(nextIndex);
  }, []);

  const togglePerformance = useCallback(() => {
    setPerformanceMode((prev) => {
      const newValue = !prev;
      localStorage.setItem("performance-mode", newValue.toString());
      return newValue;
    });
  }, []);

  const currentTheme = useMemo(() => THEMES[themeIndex], [themeIndex]);

  return {
    theme: currentTheme,
    performanceMode,
    changeTheme,
    togglePerformance
  };
};
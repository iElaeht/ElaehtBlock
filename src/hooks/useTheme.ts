import { useState, useCallback, useMemo } from "react";

const THEMES = [
  { id: "cappuccino", bg: "bg-gradient-to-br from-[#4B3832] via-[#854442] to-[#BE9B7B]", text: "text-white/90", accent: "bg-[#FFF4E6] !text-[#4B3832]", accentText: "text-[#BE9B7B]" },
  { id: "latte", bg: "bg-gradient-to-br from-[#7E6D5E] via-[#A89481] to-[#D6C5B3]", text: "text-white/90", accent: "bg-white/90 !text-[#7E6D5E]", accentText: "text-[#A89481]" },
  { id: "midnight-nebula", bg: "bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460]", text: "text-white/90", accent: "bg-cyan-400/20 border border-cyan-400/50 !text-cyan-100", accentText: "text-cyan-400" },
  { id: "deep-forest", bg: "bg-gradient-to-br from-[#0B201A] via-[#14532D] to-[#166534]", text: "text-white/90", accent: "bg-emerald-400/20 border border-emerald-400/50 !text-emerald-100", accentText: "text-emerald-400" },
  { id: "soft-lavender", bg: "bg-gradient-to-br from-[#5D54A4] via-[#7D73D1] to-[#9B91E2]", text: "text-white/90", accent: "bg-white/90 !text-[#5D54A4]", accentText: "text-[#9B91E2]" },
  { id: "muted-coral", bg: "bg-gradient-to-br from-[#935D5D] via-[#B37D7D] to-[#D39D9D]", text: "text-white/90", accent: "bg-white/90 !text-[#935D5D]", accentText: "text-[#B37D7D]" },
  { id: "sage-garden", bg: "bg-gradient-to-br from-[#4A5D4E] via-[#718F78] to-[#99BFA1]", text: "text-white/90", accent: "bg-white/90 !text-[#4A5D4E]", accentText: "text-[#718F78]" },
  { id: "arctic-night", bg: "bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#4B6584]", text: "text-white/90", accent: "bg-sky-100 !text-[#2C3E50]", accentText: "text-sky-400" },
  { id: "deep-plum", bg: "bg-gradient-to-br from-[#2D132C] via-[#510A32] to-[#801336]", text: "text-white/90", accent: "bg-pink-100 !text-[#2D132C]", accentText: "text-pink-400" },
  { id: "charcoal-gold", bg: "bg-gradient-to-br from-[#121212] via-[#242424] to-[#3D3D3D]", text: "text-white/90", accent: "bg-[#D4AF37]/20 border border-[#D4AF37] !text-[#D4AF37]", accentText: "text-[#D4AF37]" },
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
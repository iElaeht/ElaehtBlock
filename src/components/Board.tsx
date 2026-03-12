/* src/components/Board.tsx */
import { memo, useMemo } from "react";
import { BoardCell } from "./BoardCell";
import type { PreviewData } from "../types";

interface BoardProps {
  grid: (string | null)[][];
  preview: PreviewData | null;
  performanceMode: boolean;
  currentThemeId: string;
}

export const Board = memo(({ 
  grid, 
  preview, 
  performanceMode, 
  currentThemeId 
}: BoardProps) => {
  
  // 1. MEMOIZAR ESTILOS DEL TEMA (ADN AI Mangas)
  const boardStyle = useMemo(() => {
    const themeStyles: Record<string, { bg: string, border: string, glow: string }> = {
      "cappuccino": { bg: "bg-[#4B3832]/60", border: "border-[#BE9B7B]/40", glow: "shadow-[#4B3832]/40" },
      "latte": { bg: "bg-[#7E6D5E]/50", border: "border-[#D6C5B3]/50", glow: "shadow-[#7E6D5E]/20" },
      "midnight-nebula": { bg: "bg-[#0F172A]/80", border: "border-cyan-500/30", glow: "shadow-cyan-500/10" },
      "deep-forest": { bg: "bg-[#061A14]/80", border: "border-emerald-500/30", glow: "shadow-emerald-500/10" },
      "soft-lavender": { bg: "bg-[#4338CA]/40", border: "border-white/30", glow: "shadow-[#4338CA]/30" },
      "muted-coral": { bg: "bg-[#7F1D1D]/40", border: "border-white/30", glow: "shadow-[#7F1D1D]/30" },
      "sage-garden": { bg: "bg-[#2D3A30]/60", border: "border-[#99BFA1]/40", glow: "shadow-[#2D3A30]/40" },
      "arctic-night": { bg: "bg-[#0F172A]/70", border: "border-sky-400/30", glow: "shadow-sky-900/30" },
      "deep-plum": { bg: "bg-[#2D0A2A]/80", border: "border-pink-500/30", glow: "shadow-pink-900/10" },
      "charcoal-gold": { bg: "bg-black/80", border: "border-[#D4AF37]/40", glow: "shadow-[#D4AF37]/10" },
    };
    return themeStyles[currentThemeId] || themeStyles["charcoal-gold"];
  }, [currentThemeId]);

  // 2. EXTRACCIÓN DE DATOS DE PREVIEW (Lógica de alta velocidad)
  const pR = preview?.r ?? -10;
  const pC = preview?.c ?? -10;
  const pShape = preview?.shape;
  const pValid = preview?.isValid ?? false;
  const pColor = preview?.color;

  return (
    <div className="w-full flex justify-center items-center px-4 py-2 select-none touch-none">
      {/* CONTENEDOR EXTERIOR: 
         Aumentamos el padding a p-1.5 para dar un borde de "marco" más elegante 
      */}
      <div className={`
        w-[92vw] max-w-[420px] p-1.5 rounded-[1.2rem] 
        bg-white/[0.03] border border-white/10 backdrop-blur-xl 
        transition-all duration-700 ${boardStyle.glow} shadow-2xl
      `}>
        
        {/* GRILLA: 
           Ajustamos gap a [2px] para que las celdas se vean bien separadas como en la captura 
        */}
        <div className={`
          grid grid-cols-8 gap-[2px] aspect-square rounded-[0.8rem] 
          overflow-hidden border-2 ${boardStyle.bg} ${boardStyle.border}
        `}>
          {grid.map((row, r) =>
            row.map((cellColor, c) => {
              // Lógica de detección de preview (Mantenida por su eficiencia)
              let isPreview = false;
              if (pShape && r >= pR && r < pR + pShape.length && c >= pC && c < pC + pShape[0].length) {
                isPreview = !!pShape[r - pR][c - pC];
              }

              return (
                <BoardCell
                  key={`${r}-${c}`}
                  r={r}
                  c={c}
                  color={cellColor}
                  performanceMode={performanceMode}
                  isPreview={isPreview}
                  isInvalid={isPreview && !pValid}
                  previewColor={pColor}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

Board.displayName = "Board";
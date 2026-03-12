import { memo, useMemo } from "react";
import { BoardCell } from "./BoardCell";
import { PIECE_COLORS } from "../logic/constants"; 
import type { PreviewData } from "../types";

interface BoardProps {
  grid: (string | null)[][];
  preview: PreviewData | null;
  performanceMode: boolean;
  currentThemeId: string;
}

export const Board = memo(({ grid, preview, performanceMode, currentThemeId }: BoardProps) => {
  
  const boardStyle = useMemo(() => {
    // Definimos el tinte del cristal para cada tema (RGBA)
    const themeStyles: Record<string, { glassBg: string, border: string, accent: string }> = {
      "cappuccino": { glassBg: "rgba(45, 27, 20, 0.4)", border: "border-[#BE9B7B]/30", accent: "rgba(190, 155, 123, 0.2)" },
      "midnight-nebula": { glassBg: "rgba(10, 10, 30, 0.5)", border: "border-cyan-500/30", accent: "rgba(6, 182, 212, 0.3)" },
      "deep-forest": { glassBg: "rgba(5, 17, 9, 0.5)", border: "border-emerald-500/30", accent: "rgba(16, 185, 129, 0.2)" },
      "deep-plum": { glassBg: "rgba(26, 9, 26, 0.5)", border: "border-fuchsia-500/30", accent: "rgba(236, 72, 153, 0.3)" },
      "charcoal-gold": { glassBg: "rgba(20, 20, 20, 0.6)", border: "border-[#D4AF37]/30", accent: "rgba(212, 175, 55, 0.2)" },
      "arctic-night": { glassBg: "rgba(15, 23, 42, 0.4)", border: "border-sky-400/30", accent: "rgba(56, 189, 248, 0.2)" },
      "espresso": { glassBg: "rgba(18, 12, 6, 0.5)", border: "border-orange-800/30", accent: "rgba(180, 83, 9, 0.2)" },
    };
    
    const active = themeStyles[currentThemeId] || themeStyles["charcoal-gold"];

    return {
      bgStyle: { backgroundColor: active.glassBg },
      borderClass: active.border,
      innerStyle: {
        backgroundImage: performanceMode ? 'none' : `radial-gradient(circle at center, ${active.accent} 0%, transparent 85%)`,
      }
    };
  }, [currentThemeId, performanceMode]);

  const pR = preview?.r ?? -10;
  const pC = preview?.c ?? -10;
  const pShape = preview?.shape;
  const pValid = preview?.isValid ?? false;
  
  const pColorClass = useMemo(() => {
    if (!preview?.color) return null;
    return PIECE_COLORS[preview.color] || null;
  }, [preview?.color]);

  return (
    <div className="w-full flex justify-center items-center px-4 py-2 select-none touch-none transform-gpu">
      {/* Marco de cristal esmerilado */}
      <div className={`
        w-[94vw] max-w-[440px] p-[6px] rounded-[1.8rem] transition-all duration-700
        bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl
      `}>
        <div 
          style={{ ...boardStyle.bgStyle, ...boardStyle.innerStyle }}
          className={`
            grid grid-cols-8 gap-[4px] aspect-square rounded-[1.4rem] 
            overflow-hidden border-[2px] transition-all duration-1000 transform-gpu
            ${boardStyle.borderClass}
          `}
        >
          {grid.map((row, r) =>
            row.map((cellColor, c) => {
              let isPreview = false;
              if (pShape && r >= pR && r < pR + pShape.length && c >= pC && c < pC + pShape[0].length) {
                isPreview = !!pShape[r - pR][c - pC];
              }
              return (
                <BoardCell
                  key={`${r}-${c}`}
                  r={r} c={c}
                  color={cellColor}
                  performanceMode={performanceMode}
                  isPreview={isPreview}
                  isInvalid={isPreview && !pValid}
                  previewColor={pColorClass}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});
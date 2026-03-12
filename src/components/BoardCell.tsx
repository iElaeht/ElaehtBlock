/* src/components/BoardCell.tsx */
import { motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";
import { PERFORMANCE_COLORS } from "../logic/constants";

interface BoardCellProps {
  r: number;
  c: number;
  color: string | null; 
  performanceMode: boolean;
  isPreview: boolean;
  isInvalid: boolean;
  isClearing?: boolean;
  previewColor?: string | null;
  colorName?: string | null;
}

export const BoardCell = memo(({ 
  r, c, color, performanceMode, isPreview, isInvalid, isClearing, previewColor 
}: BoardCellProps) => {
  
  const { setNodeRef } = useDroppable({ 
    id: `cell-${r}-${c}`, 
    data: { r, c } 
  });
  const getPerformanceBg = () => {
    if (!color) return "";
    // Buscamos el nombre del color en el string de clases para mapearlo
    const colorKey = Object.keys(PERFORMANCE_COLORS).find(key => color.includes(key)) || "";
    return PERFORMANCE_COLORS[colorKey] || "bg-gray-500";
  };

  return (
    <div 
      ref={setNodeRef}
      className="relative aspect-square w-full transform-gpu bg-transparent border-[0.5px] border-white/5"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* 1. PIEZA COLOCADA: Estilo "Soft Glass" */}
        {color && (
          <motion.div
            initial={performanceMode ? false : { scale: 0.8, opacity: 0 }}
            animate={isClearing 
              ? { scale: 1.4, opacity: 0, filter: "brightness(2) blur(8px)" } 
              : { scale: 1, opacity: 1 }
            }
            transition={{ duration: isClearing ? 0.3 : 0.2, ease: "easeOut" }}
            className={`
              absolute inset-[2px] z-20 
              rounded-[8px] transition-all duration-500
              ${performanceMode 
                ? `${getPerformanceBg()} border-none shadow-none` 
                : `border-[1px] backdrop-blur-[2px] ${color}` 
              }
            `}
          >
            {/* Brillo de reflejo superior (Efecto Cristal) */}
            {!performanceMode && !isClearing && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[6px]" />
            )}
            
            {/* Pequeño bisel interno para profundidad */}
            {!performanceMode && !isClearing && (
              <div className="absolute inset-[1px] border-[0.5px] border-white/10 rounded-[6px]" />
            )}
          </motion.div>
        )}

        {/* 2. PREVIEW: Holograma sutil */}
        {isPreview && (
          <div 
            className={`
              absolute inset-[2px] z-30 transition-all duration-200 rounded-[8px]
              ${isInvalid 
                ? 'bg-red-500/20 border-[1px] border-red-500/50' 
                : performanceMode
                  ? 'bg-white/20 border-1 border-white/40'
                  : `border-[1px] ${previewColor} bg-white/5 opacity-40 animate-pulse`
              }
            `} 
          />
        )}
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.color === next.color &&
    prev.isPreview === next.isPreview &&
    prev.isInvalid === next.isInvalid &&
    prev.isClearing === next.isClearing &&
    prev.performanceMode === next.performanceMode &&
    prev.previewColor === next.previewColor
  );
});

BoardCell.displayName = "BoardCell";
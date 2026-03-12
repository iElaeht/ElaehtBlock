import { motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";

interface BoardCellProps {
  r: number;
  c: number;
  color: string | null;
  performanceMode: boolean;
  isPreview: boolean;
  isInvalid: boolean;
  isClearing?: boolean;
  previewColor?: string | null;
}

export const BoardCell = memo(({ 
  r, 
  c, 
  color, 
  performanceMode, 
  isPreview, 
  isInvalid, 
  isClearing 
}: BoardCellProps) => {
  
  const { setNodeRef } = useDroppable({ 
    id: `cell-${r}-${c}`, 
    data: { r, c } 
  });

  return (
    <div 
      ref={setNodeRef}
      className={`
        relative aspect-square w-full transform-gpu
        /* Fondo base del tablero: más oscuro para resaltar el preview */
        bg-black/20 border-[0.5px] border-white/10 
        ${!performanceMode ? 'shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]' : ''}
      `}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* 1. PIEZA COLOCADA */}
        {color && (
          <motion.div
            initial={performanceMode ? false : { scale: 0.8, opacity: 0 }}
            animate={isClearing 
              ? { scale: 0, opacity: 0, filter: "brightness(2)" } 
              : { scale: 1, opacity: 1 }
            }
            transition={{ 
              duration: isClearing ? 0.3 : 0.1, // Respuesta más rápida
              ease: "easeOut" 
            }}
            className={`
              absolute inset-[2px] z-20 rounded-[3px] ${color}
              ${!performanceMode 
                ? 'border-t border-white/25 shadow-md' 
                : 'border border-black/20'}
            `}
          >
            {/* Brillo dinámico elegante */}
            {!performanceMode && !isClearing && (
              <motion.div 
                initial={{ x: '-150%' }}
                animate={{ x: '250%' }}
                transition={{ 
                  duration: 2.5, 
                  delay: (r + c) * 0.1, 
                  repeat: Infinity, 
                  repeatDelay: 5 
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
              />
            )}
          </motion.div>
        )}

        {/* 2. PREVIEW (Sombra de caída - ESTILO CAPTURA) */}
        {isPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.03 }} // Casi instantáneo para evitar lag visual
            className={`
              absolute inset-0 z-30
              ${isInvalid 
                ? 'bg-red-500/30 border-2 border-red-500/50' 
                : 'bg-white/30 border-[1.5px] border-white/90 shadow-[0_0_8px_rgba(255,255,255,0.4)]'
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
    prev.performanceMode === next.performanceMode
  );
});

BoardCell.displayName = "BoardCell";
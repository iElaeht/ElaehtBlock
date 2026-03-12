/* src/components/DraggablePiece.tsx */
import { memo, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { PERFORMANCE_COLORS, PIECE_COLORS } from "../logic/constants";

interface DraggablePieceProps {
  id: string;
  shape: number[][];
  color: string;
  isOverlay?: boolean;
  performanceMode: boolean;
}

export const DraggablePiece = memo(({ id, shape, color, isOverlay = false, performanceMode }: DraggablePieceProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  const activeColor = useMemo(() => {
    return performanceMode
      ? PERFORMANCE_COLORS[color] || color
      : PIECE_COLORS[color] || color;
  }, [color, performanceMode]);

  const style = {
    // Escala ajustada: un poco más grande en el overlay para que se vea la luz
    transform: isOverlay ? "scale(0.9)" : "scale(0.7)",
    opacity: isDragging && !isOverlay ? 0 : 1,
    touchAction: "none" as const,
    transition: isOverlay ? "none" : "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    cursor: isOverlay ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`origin-center ${isOverlay ? "z-[1000]" : "relative"}`}
    >
      <div
        className="grid gap-[4px]" // Separación para que los bordes de neón respiren
        style={{
          gridTemplateColumns: `repeat(${shape[0].length}, 1fr)`,
        }}
      >
        {shape.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`
                w-[8vw] h-[8vw] max-w-[34px] max-h-[34px] relative
                ${cell === 1 
                  ? `rounded-[6px] border-[1px] ${activeColor}` 
                  : "bg-transparent"}
              `}
            >
              {cell === 1 && !performanceMode && (
                <>
                  {/* EFECTO TUBO: Línea central blanca sutil para simular el gas del neón */}
                  <div className="absolute inset-[-1px] border-[1px] border-white/30 rounded-[6px] pointer-events-none" />
                  
                  {/* RESPLANDOR INTERNO SUTIL: Para que el bloque no se vea vacío por completo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

DraggablePiece.displayName = "DraggablePiece";
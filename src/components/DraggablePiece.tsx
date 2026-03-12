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

  // LÓGICA V3.8: Escalas y dimensiones para que se vea como en tu captura
  const style = {
    // Si es el overlay, se queda en escala 0.85 (un poco más pequeña que el hueco para que se vea el borde)
    // Si está en el dock, escala 0.6 para que quepan las 3 piezas cómodamente.
    transform: isOverlay ? "scale(0.85)" : "scale(0.65)",
    opacity: isDragging && !isOverlay ? 0 : 1,
    touchAction: "none" as const,
    transition: isOverlay ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
    cursor: isOverlay ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`origin-center ${isOverlay ? "z-[1000] dragging-active" : "relative"}`}
    >
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${shape[0].length}, 1fr)`,
        }}
      >
        {shape.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              /* AJUSTE DE TAMAÑO: Usamos 4.5vw - 5vw (como en v3.8) 
                Esto mantiene la proporción "mini" de tu captura.
              */
              className={`
                w-[7vw] h-[7vw] max-w-[28px] max-h-[28px] rounded-[3px]
                ${cell ? `${activeColor} border border-white/20 shadow-sm ring-1 ring-white/5` : "bg-transparent"}
              `}
            />
          ))
        )}
      </div>
    </div>
  );
});

DraggablePiece.displayName = "DraggablePiece";
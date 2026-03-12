import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

interface PieceDockProps {
  children: ReactNode;
  performanceMode: boolean;
}

export const PieceDock = ({ children, performanceMode }: PieceDockProps) => {
  const { setNodeRef } = useDroppable({ id: "piece-dock" });

  return (
    <div className="w-full flex justify-center items-center px-4 mb-10 sm:mb-14">
      <div
        ref={setNodeRef}
        className={`
          w-[92vw] md:w-[80vw] max-w-[480px]
          h-28 sm:h-36 
          flex justify-center items-center
          rounded-[3rem] relative
          transition-all duration-700 ease-in-out
          
          /* EFECTO DE CUNA DE LUZ: 
             Un gradiente radial que hace que el centro sea más claro que los bordes 
          */
          ${performanceMode 
            ? "bg-black/20" 
            : "bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-xl shadow-[inset_0_1px_20px_rgba(255,255,255,0.05)]"
          }
        `}
      >
        {/* BRILLO INTELIGENTE: 
            Añadimos un resplandor "Aurora" suave en el fondo para que 
            las piezas oscuras (como azul o morado) se recorten contra él.
        */}
        {!performanceMode && (
          <div className="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none">
            <div className="absolute -top-[50%] left-[10%] right-[10%] h-full bg-white/[0.03] blur-[40px] rounded-full" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        )}

        {/* DISTRIBUCIÓN DE PIEZAS */}
        <div className="flex w-full justify-around items-center px-2 sm:px-6 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
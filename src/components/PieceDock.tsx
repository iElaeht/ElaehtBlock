import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

interface PieceDockProps {
  children: ReactNode;
  performanceMode: boolean;
}

export const PieceDock = ({ children, performanceMode }: PieceDockProps) => {
  const { setNodeRef } = useDroppable({ id: "piece-dock" });

  return (
    /* CONTENEDOR DE CENTRADO */
    <div className="w-full flex justify-center items-center px-4 mb-10 sm:mb-14">
      
      <div
        ref={setNodeRef}
        className={`
          /* 1. DIMENSIONES SINCRONIZADAS */
          w-[88vw] md:w-[75vw] max-w-[450px]
          h-28 sm:h-36 
          
          /* 2. LAYOUT */
          flex justify-center items-center
          rounded-[3rem] relative
          transition-all duration-700 ease-in-out
          
          /* 3. ESTÉTICA "INVISIBLE" PERO PRESENTE
             - Eliminamos el 'border' por completo.
             - Usamos un gradiente casi imperceptible que nace del centro.
          */
          bg-radial-gradient from-white/[0.04] to-transparent
          
          /* 4. EFECTO DE PROFUNDIDAD
             En lugar de bordes, usamos un difuminado (blur) muy ligero
             para que las piezas parezcan estar sobre una superficie de seda.
          */
          ${performanceMode 
            ? "bg-transparent" 
            : "backdrop-blur-md"
          }
        `}
      >
        {/* Un ligero destello central para guiar la vista, sin ser un borde */}
        {!performanceMode && (
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[3rem] pointer-events-none" />
        )}

        {/* 5. DISTRIBUCIÓN DE PIEZAS 
            Aumentamos el gap para que se sientan como objetos individuales 
            y no como parte de una lista.
        */}
        <div className="flex w-full justify-evenly items-center px-2 sm:px-6 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
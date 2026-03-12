import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameBackgroundProps {
  themeBg: string; // Recibe el gradiente (ej: "bg-gradient-to-br...")
  themeId: string; // Necesitamos el ID para que Framer sepa cuándo cambió
}

export const GameBackground = memo(({ themeBg, themeId }: GameBackgroundProps) => {
  return (
    <div className="fixed inset-0 -z-10 bg-black overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={themeId} // Al cambiar el ID, Framer crea una capa nueva
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className={`absolute inset-0 ${themeBg}`}
        />
      </AnimatePresence>
      
      {/* Capa de textura sutil para que el gradiente no se vea plano */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
    </div>
  );
});

GameBackground.displayName = "GameBackground";
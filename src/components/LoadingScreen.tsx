import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onFinished: () => void;
}

export const LoadingScreen = ({ onFinished }: LoadingScreenProps) => {
  const [step, setStep] = useState(0);

  // Colores que irán rotando en el fondo y en el bloque
  const colors = [
    "from-orange-900/40 via-[#2A1B15] to-[#0a0a0a]", // Terracota
    "from-emerald-900/40 via-[#152a22] to-[#0a0a0a]", // Jade
    "from-blue-900/40 via-[#151b2a] to-[#0a0a0a]",    // Cobalto
    "from-purple-900/40 via-[#21152a] to-[#0a0a0a]",  // Amatista
  ];

  const variants = {
    0: { width: 80, height: 40, borderRadius: "12px", rotate: 0, backgroundColor: "#fff" },
    1: { width: 60, height: 60, borderRadius: "20px", rotate: 90, backgroundColor: "#f3f4f6" },
    2: { width: 40, height: 80, borderRadius: "12px", rotate: 180, backgroundColor: "#e5e7eb" },
    3: { width: 50, height: 50, borderRadius: "50%", rotate: 270, backgroundColor: "#fff" }, // Se vuelve círculo un momento
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 800);

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    // CONTENEDOR PRINCIPAL CON GRADIENTE DINÁMICO
    <motion.div 
      animate={{ backgroundImage: `radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to))` }}
      className={`fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-[100] transition-all duration-1000 ease-in-out bg-gradient-to-br ${colors[step]}`}
    >
      {/* Luces de fondo ambientales (Bloom) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full"
        />
      </div>

      <div className="relative h-40 flex items-center justify-center">
        {/* El Bloque Animado con Glitch de color */}
        <motion.div
          animate={variants[step as keyof typeof variants]}
          transition={{ 
            type: "spring", 
            stiffness: 150, 
            damping: 12,
          }}
          className="relative z-10 shadow-[0_0_50px_rgba(255,255,255,0.15)] border border-white/20"
        />
        
        {/* Aura pulsante que cambia con el paso */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute w-32 h-32 bg-white rounded-full blur-[60px]"
          />
        </AnimatePresence>
      </div>

      {/* Info de Carga */}
      <div className="mt-20 flex flex-col items-center gap-4">
        <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
          />
        </div>

        <div className="flex flex-col items-center">
          <motion.span 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-[10px] font-black uppercase tracking-[0.6em] text-white/80"
          >
            Sincronizando
          </motion.span>
          <span className="text-[8px] font-bold text-white/30 uppercase mt-2 tracking-widest">
            AI MANGAS V3.8
          </span>
        </div>
      </div>
    </motion.div>
  );
};
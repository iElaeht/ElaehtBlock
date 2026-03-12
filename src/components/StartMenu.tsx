import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StartMenuProps {
  coins: number;
  onPlay: () => void;
  onOpenSettings: () => void;
  playSound: (url: string) => void;
  isOpen: boolean; // <--- Agregamos esta prop para saber si el menú está abierto
}

export const StartMenu = ({ coins, onPlay, onOpenSettings, playSound, isOpen }: StartMenuProps) => {
  const [letterIndex, setLetterIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const letters = ["B", "L", "O", "C", "K"];

useEffect(() => {
  const interval = setInterval(() => {
    setRotation(prev => prev - 360); 
    setTimeout(() => {
      setLetterIndex((prev) => (prev + 1) % letters.length);
    }, 600); 
  }, 3000); 
  return () => clearInterval(interval);
}, [letters.length]);

  return (
    <div className="relative flex flex-col items-center h-full w-full p-6 overflow-hidden bg-transparent">
      
      {/* 1. HUB SUPERIOR */}
      <div className="w-full max-w-[440px] pt-6 sm:pt-10 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
          <span className="text-xs">🪙</span>
          <span className="text-white font-black text-xs tracking-tighter">
            {coins.toLocaleString()}
          </span>
        </div>

        {/* BOTÓN SINCRONIZADO */}
        <button 
          onClick={() => { playSound("/sounds/click.mp3"); onOpenSettings(); }} 
          className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center 
    ${isOpen 
      ? "bg-white border-white text-black" // Estilo cuando está abierto (como en el juego)
      : "bg-white/5 border-white/10 text-white" // Estilo normal
    }`}
>
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!isOpen ? (
                // Vista de TRES PUNTOS
                <motion.svg 
                  key="dots"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="1.2" /><circle cx="12" cy="5" r="1.2" /><circle cx="12" cy="19" r="1.2" />
                </motion.svg>
              ) : (
                // Vista de X (Sincronizada con SettingsMenu)
                <motion.svg 
                  key="close"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </motion.svg>
              )}
            </AnimatePresence>
          </div>
        </button>
      </div>

      {/* 2. BLOQUE CENTRAL (Giro Ligero) */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-[320px] gap-14">
        <div className="flex flex-col items-center">
          <div className="relative mb-8">
            <motion.div 
              animate={{ rotate: rotation }}
              transition={{ duration: 1.2, ease: [0.45, 0, 0.55, 1] }}
              className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center shadow-[0_15px_45px_rgba(255,255,255,0.12)] border border-white/10"
            >
              <motion.span 
                key={letterIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-black font-black text-3xl italic select-none"
              >
                {letters[letterIndex]}
              </motion.span>
            </motion.div>
          </div>
          <div className="text-center">
            <h1 className="text-6xl font-black italic text-white drop-shadow-2xl leading-none tracking-tighter uppercase">
              AI BLOCK
            </h1>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.6em] mt-4">
              Game Of Puzzle
            </p>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <motion.button 
            whileTap={{ scale: 0.96 }}
            onClick={onPlay}
            className="w-64 py-5 bg-white text-black font-black rounded-2xl shadow-xl uppercase tracking-[0.4em] text-[12px]"
          >
            Jugar
          </motion.button>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-1 pb-10 sm:pb-14 z-20 opacity-20">
        <span className="text-[9px] font-black text-white uppercase tracking-widest">Version V4.0</span>
        <span className="text-[9px] font-medium text-white uppercase">BY ELAEHTDEV</span>
      </div>
    </div>
  );
};
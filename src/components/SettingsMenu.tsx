import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsMenuProps {
  performanceMode: boolean;
  isMuted: boolean;
  onTogglePerformance: () => void;
  onToggleMute: () => void;
  onResetGame: () => void;
  onExit: () => void;
  onClose: () => void;
  onClearRecord: () => void;
  linesCleared: number;
  maxCombo: number;
  coins: number;
}

const formatStats = (num: number) => {
  if (num >= 1000000) {
    const truncated = Math.floor((num / 1000000) * 100) / 100;
    return truncated.toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1') + 'M';
  }
  if (num >= 1000) {
    const truncated = Math.floor((num / 1000) * 100) / 100;
    return truncated.toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1') + 'K';
  }
  return num.toLocaleString(); 
};

export const SettingsMenu = ({
  performanceMode,
  isMuted,
  onTogglePerformance,
  onToggleMute,
  onResetGame,
  onExit,
  onClose,
  onClearRecord,
  linesCleared,
  maxCombo,
  coins
}: SettingsMenuProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      // DINÁMICO: Si el modo rendimiento está ON (performanceMode = true), quitamos el blur.
      className={`fixed inset-0 z-[500] flex items-end justify-center transition-all duration-500
        ${performanceMode 
          ? "bg-black/95 backdrop-blur-none" 
          : "bg-black/60 backdrop-blur-md"
        }`}
    >
      <motion.div 
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
        className="w-full max-w-[500px] bg-[#0f0f0f] rounded-t-[3rem] p-8 pb-10 shadow-2xl relative border-t border-white/10"
      >
        <div className="w-full flex justify-center mb-6">
          <div className="w-12 h-1.5 bg-white/10 rounded-full" />
        </div>

        {/* Header con X BLANCA */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-white font-black text-2xl italic tracking-tighter uppercase">Ajustes</h2>
          <button 
            onClick={onClose} 
            className="text-white hover:scale-110 active:scale-90 transition-all p-1"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!isConfirmingDelete ? (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full">
              
              {/* Stats Bar */}
              <div className="flex justify-center gap-4 mb-8 w-full">
                {[
                  { label: "Líneas", val: formatStats(linesCleared) },
                  { label: "Combo", val: `x${maxCombo}` },
                  { label: "Saldo", val: `🪙 ${formatStats(coins)}` }
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl flex flex-col items-center flex-1">
                    <span className="text-[7px] text-white/30 font-black uppercase tracking-[0.2em] mb-1">{s.label}</span>
                    <span className="text-white font-bold text-xs">{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Toggles Técnicos (Estilo ON/OFF) */}
              <div className="w-full bg-white/5 rounded-[2.5rem] overflow-hidden mb-10 border border-white/5">
                
                {/* Sonido */}
                <button onClick={onToggleMute} className="w-full p-6 flex justify-between items-center active:bg-white/10 border-b border-white/5 transition-colors">
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Sonido Global</span>
                  <div className="flex gap-2">
                    <span className={`font-black text-xs ${!isMuted ? 'text-blue-400' : 'text-white/10'}`}>ON</span>
                    <span className="text-white/10 font-black text-xs">/</span>
                    <span className={`font-black text-xs ${isMuted ? 'text-red-500' : 'text-white/10'}`}>OFF</span>
                  </div>
                </button>
                
                {/* RENDIMIENTO MODO */}
                <button onClick={onTogglePerformance} className="w-full p-6 flex justify-between items-center active:bg-white/10 transition-colors">
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Rendimiento Modo</span>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2 items-center">
                      <span className={`font-black text-xs transition-colors ${performanceMode ? 'text-emerald-500' : 'text-white/10'}`}>
                        ON
                      </span>
                      <span className="text-white/10 font-black text-xs">/</span>
                      <span className={`font-black text-xs transition-colors ${!performanceMode ? 'text-blue-400' : 'text-white/10'}`}>
                        OFF
                      </span>
                    </div>
                    {/* Badge de estado MIN/ULTRA */}
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${performanceMode ? 'border-emerald-500/50 text-emerald-500' : 'border-blue-400/50 text-blue-400'}`}>
                      {performanceMode ? "MIN" : "ULTRA"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Stack de Botones de Acción */}
              <div className="w-full flex flex-col gap-4">
                <button 
                  onClick={onResetGame}
                  className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] active:scale-95 transition-all"
                >
                  Reiniciar Partida
                </button>

                {/* Volver al Inicio - Botón Destacado */}
                <button 
                  onClick={onExit}
                  className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all"
                >
                  Volver al Inicio
                </button>

                <button 
                  onClick={() => setIsConfirmingDelete(true)}
                  className="w-full py-3 text-red-500/80 hover:text-red-500 font-black text-[9px] uppercase tracking-[0.3em] transition-colors"
                >
                  Borrar Datos de Usuario
                </button>
              </div>
            </motion.div>
          ) : (
            /* Pantalla de Confirmación */
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center w-full">
              <div className="mb-10">
                <p className="text-white font-black text-xl mb-3 tracking-tighter italic uppercase">¿Borrar Progreso?</p>
                <p className="text-white/30 text-[9px] uppercase tracking-widest px-8 leading-relaxed font-medium">
                  Esta acción eliminará permanentemente tus récords y monedas.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={onClearRecord} className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-red-600/20 active:scale-95 transition-all">
                  SÍ, CONFIRMO EL BORRADO
                </button>
                <button onClick={() => setIsConfirmingDelete(false)} className="w-full py-4 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                  CANCELAR
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-8 text-center text-[7px] font-black opacity-40 tracking-[0.8em] uppercase text-white">
          AI BLOCK // BY ELAEHTDEV
        </p>
      </motion.div>
    </motion.div>
  );
};
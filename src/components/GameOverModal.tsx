import { motion } from "framer-motion";

interface GameOverModalProps {
  score: number;
  highScore: number;
  earnedCoins: number;
  totalCoins: number;
  onReset: () => void; 
  onRetry: () => void; 
  onBackToMenu: () => void;
  canAffordRetry: boolean; 
}

export const GameOverModal = ({ 
  score, highScore, earnedCoins, totalCoins, onReset, onRetry, onBackToMenu, canAffordRetry 
}: GameOverModalProps) => {
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-6 text-center w-full max-w-[320px] shadow-2xl border border-stone-200 relative overflow-hidden flex flex-col"
      >
        
        {/* BALANCE SUPERIOR - Más pequeño */}
        <div className="flex justify-center mb-4">
           <div className="bg-stone-100 px-3 py-1 rounded-full border border-stone-200 flex items-center gap-2">
             <span className="text-[8px] font-black uppercase text-stone-400">Balance</span>
             <span className="text-[10px] font-mono font-bold text-stone-800">🪙 {totalCoins.toLocaleString()}</span>
           </div>
        </div>

        {/* PUNTAJE PRINCIPAL - Compacto */}
        <div className="mb-4">
          <p className="text-[9px] font-black uppercase opacity-30 tracking-[0.3em] mb-1">
            Puntaje Final
          </p>
          <div className="text-6xl font-black text-stone-900 tracking-tighter font-mono italic leading-none">
            {score.toLocaleString()}
          </div>
        </div>

        {/* RECOMPENSA - Menos aire interno */}
        <div className="bg-stone-50 rounded-2xl p-3 mb-4 border border-stone-100 flex flex-col shadow-inner">
          <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Recompensa</p>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-base">🪙</span>
            <span className="text-2xl font-black text-emerald-600 tabular-nums">+{earnedCoins}</span>
          </div>
        </div>

        {/* RÉCORD - En una sola línea para ahorrar espacio */}
        <div className="mb-5 border-y border-stone-100 py-3 flex justify-between items-center px-2">
           <p className="text-[9px] font-bold uppercase opacity-40 tracking-widest">Mejor Puntuación</p>
           <p className="font-mono font-black text-stone-800 text-lg italic">{highScore.toLocaleString()}</p>
        </div>

        {/* ACCIONES - Botones menos altos */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRetry}
            disabled={!canAffordRetry}
            className={`w-full py-4 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase shadow-md
              ${canAffordRetry 
                ? "bg-yellow-400 text-stone-900 active:scale-95 hover:bg-yellow-300" 
                : "bg-stone-100 text-stone-300 cursor-not-allowed"}`}
          >
            {canAffordRetry ? `Continuar (350 🪙)` : "Fondos insuficientes"}
          </button>

          <button
            onClick={onReset}
            className="w-full py-4 rounded-xl bg-stone-900 text-white font-black text-[10px] tracking-widest active:scale-95 transition-all uppercase shadow-md"
          >
            Nuevo Juego
          </button>

          <button
            onClick={onBackToMenu}
            className="w-full py-2 mt-1 text-stone-400 font-bold text-[9px] tracking-[0.1em] active:scale-95 transition-all uppercase"
          >
            Volver al Menú
          </button>
        </div>

        {/* FOOTER - Muy pequeño */}
        <p className="mt-4 text-[7px] font-black opacity-20 tracking-[0.4em] uppercase">
          AI Mangas Core
        </p>
      </motion.div>
    </motion.div>
  );
};
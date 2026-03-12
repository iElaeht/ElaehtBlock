import { motion, AnimatePresence } from "framer-motion";
import { type GameTheme } from "../types"; 

interface GameHeaderProps {
  score: number;
  displayScore: number;
  highScore: number;
  coins: number;
  lastBonus: number | null;
  combo: number;
  theme: GameTheme;
  showMenu: boolean; 
  onOpenMenu: () => void;
}

export const GameHeader = ({ 
  score, displayScore,highScore, coins, lastBonus, combo, theme, onOpenMenu 
}: GameHeaderProps) => {

  const formatValue = (num: number, precision = 1) => {
    if (num >= 1000) {
      const p = num < 10000 ? 2 : precision; 
      return (num / 1000).toFixed(p).replace(/\.0+$/, '') + 'k';
    }
    return num.toLocaleString();
  };

  const arcadeClass = "font-arcade tracking-tighter uppercase";

  return (
    <div className="w-full flex justify-center px-4 pt-6 pb-2 select-none relative z-50">
      <div className="w-full max-w-[480px] flex items-start justify-between relative py-2">
        
        {/* IZQUIERDA: RECORD & COINS */}
        <div className="flex flex-col gap-2 min-w-[110px] pt-1">
          <div className="flex flex-col opacity-60">
            <span className={`text-[7px] text-white/60 mb-0.5 ${arcadeClass}`}>Record</span>
            <span className={`text-xs text-white leading-none ${arcadeClass}`}>
              {formatValue(highScore)}
            </span>
          </div>

          <div className="relative flex items-center">
            <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
              <span className="text-[10px]">🪙</span>
              <span className={`text-[10px] text-yellow-400 ${arcadeClass}`}>
                {formatValue(coins)}
              </span>
            </div>
            
            <AnimatePresence>
              {lastBonus && lastBonus > 0 && (
                <motion.span
                  key={`coin-pop-${coins}`} 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute left-full ml-2 text-[9px] text-emerald-400 whitespace-nowrap ${arcadeClass}`}
                >
                  +{Math.floor(lastBonus / 10)}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTRO: SCORE & FEEDBACK */}
        <div className="flex flex-col items-center justify-center flex-1">
          <motion.span 
            key={`score-${score}`}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className={`text-4xl leading-none drop-shadow-2xl ${theme.text} ${arcadeClass}`}
          >
            {formatValue(displayScore)}
          </motion.span>

          <div className="h-6 mt-1 flex flex-col items-center justify-start">
            {/* 1. CAMBIO A mode="popLayout": Evita que el nuevo bonus empuje al viejo físicamente */}
            <AnimatePresence mode="popLayout">
              {lastBonus !== null && lastBonus > 0 && (
                <motion.div
                  // 2. KEY COMPUESTA: Evita el "doble trigger" si el score y el bonus no cambian a la vez
                  key={`bonus-${score}-${lastBonus}`} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: [0.8, 1.1, 1],
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ 
                    duration: 0.25, // Un poco más rápido para evitar solapamientos
                    ease: "easeOut"
                  }}
                  className="flex items-center gap-2"
                >
                  {combo > 1 && (
                    <span className={`text-[9px] text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.4)] ${arcadeClass}`}>
                      x{combo}
                    </span>
                  )}
                  <span className={`text-[10px] text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)] ${arcadeClass}`}>
                    +{lastBonus}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* DERECHA: MENÚ */}
        <div className="flex justify-end min-w-[110px] pt-1">
          <button onClick={onOpenMenu} className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center transition-transform active:scale-90">
             <span className="text-white text-lg font-bold">⋮</span>
          </button>
        </div>
      </div>
    </div>
  );
};
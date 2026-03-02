import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter,
  type DragEndEvent,
  DragOverlay
} from '@dnd-kit/core';
import { getRandomPieces, type Piece } from './logic/pieces';

// --- ESTILOS DE ANIMACIÓN ---
const animationStyles = `
  @keyframes fadeOutUp {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
  }
  .animate-fade-out-up {
    animation: fadeOutUp 1.2s ease-out forwards;
  }
  @keyframes pulse-border {
    0%, 100% { border-color: rgba(255,255,255,0.1); }
    50% { border-color: rgba(255,255,255,0.4); }
  }
  .animate-pulse-border {
    animation: pulse-border 2s infinite;
  }
`;

const SOUNDS = {
  place: '/sounds/place.mp3',
  clear: '/sounds/clear.mp3',
  gameOver: '/sounds/gameOver.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

const THEMES = [
  { bg: 'bg-[#4F46E5]', text: 'text-white', accent: 'bg-white !text-[#4F46E5]', secondary: 'bg-white/20' }, 
  { bg: 'bg-[#059669]', text: 'text-white', accent: 'bg-yellow-400 !text-emerald-900', secondary: 'bg-black/10' },
  { bg: 'bg-[#DC2626]', text: 'text-white', accent: 'bg-black !text-white', secondary: 'bg-white/10' },
  { bg: 'bg-[#7C3AED]', text: 'text-white', accent: 'bg-emerald-400 !text-purple-900', secondary: 'bg-white/10' },
  { bg: 'bg-[#EA580C]', text: 'text-white', accent: 'bg-white !text-orange-600', secondary: 'bg-black/10' },
  { bg: 'bg-[#0891B2]', text: 'text-white', accent: 'bg-white !text-cyan-600', secondary: 'bg-white/20' },
];

// --- COMPONENTES ---

const BoardCell = memo(({ r, c, color, isPreview, isInvalid, performanceMode }: any) => {
  const { setNodeRef } = useDroppable({ id: `cell-${r}-${c}`, data: { r, c } });
  
  const cellState = useMemo(() => {
    // Agregamos border-white/20 para que los bloques colocados tengan ese relieve sutil
    if (color) return `${color} border-white/20 ${performanceMode ? '' : 'shadow-[inset_0_0_8px_rgba(255,255,255,0.2)]'}`; 
    if (isPreview) {
        if (isInvalid) return 'bg-red-500/50 border-red-200';
        const previewOpacity = performanceMode ? 'bg-black/20' : 'bg-black/60';
        return `${previewOpacity} border-white border-2 z-10 ${performanceMode ? '' : 'scale-105'}`; 
    }
    return `bg-black/15 border-transparent`;
  }, [color, isPreview, isInvalid, performanceMode]);

  return <div ref={setNodeRef} className={`aspect-square w-full rounded-md border ${cellState} transition-all duration-200`} />;
});

const DraggablePiece = memo(({ id, shape, color, isOverlay = false, performanceMode }: any) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isOverlay ? 0.95 : 0.75})` : 'scale(0.75)',
    opacity: isDragging && !isOverlay ? 0 : 1,
    touchAction: 'none' as const,
    zIndex: isOverlay ? 1000 : 1,
    transition: performanceMode ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s ease'
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing origin-center touch-none">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}>
        {shape.map((row: any[], rIdx: number) => row.map((cell, cIdx) => (
          <div key={`${rIdx}-${cIdx}`} 
            // Borde blanco leve (white/20) añadido aquí para resaltar la pieza
            className={`w-[4.5vw] h-[4.5vw] max-w-[16px] max-h-[16px] rounded-sm ${cell ? `${color} border border-white/25 shadow-sm` : 'bg-transparent'}`} 
          />
        )))}
      </div>
    </div>
  );
});

const PieceDock = ({ children }: { children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id: 'piece-dock' });
  return (
    <div ref={setNodeRef} className="w-full max-w-[320px] h-28 flex justify-around items-center bg-black/10 rounded-[2.5rem] border border-white/10 backdrop-blur-md relative mb-6 shadow-xl animate-pulse-border">
      {children}
    </div>
  );
};

export default function App() {
  // --- ESTADOS PRINCIPALES ---
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<(string | null)[][]>(() => Array(8).fill(null).map(() => Array(8).fill(null)));
  const [availablePieces, setAvailablePieces] = useState<Piece[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('user-highscore')) || 0);
  const [displayScore, setDisplayScore] = useState(0);
  
  // Estados de estadísticas para el menú
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalLines, setTotalLines] = useState(0);
  
  const [lastBonus, setLastBonus] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('performance-mode') === 'true');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // --- LÓGICA DE JUEGO ---
  const changeTheme = useCallback(() => {
    setThemeIndex(prev => (prev + 1) % THEMES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(() => setIsLoading(false), 400); return 100; }
        return p + 5;
      });
    }, 25);
    setAvailablePieces(getNewTransformedPieces());
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('performance-mode', performanceMode.toString());
  }, [performanceMode]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('user-highscore', score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    if (displayScore < score) {
      const step = performanceMode ? score - displayScore : Math.ceil((score - displayScore) / 10);
      const timeout = setTimeout(() => setDisplayScore(p => Math.min(p + step, score)), 20);
      return () => clearTimeout(timeout);
    }
  }, [score, displayScore, performanceMode]);

  const playSound = useCallback((url: string) => {
    if (isMuted) return;
    const audio = new Audio(url);
    audio.volume = 0.15;
    audio.play().catch(() => {});
  }, [isMuted]);

  function getNewTransformedPieces() {
    return getRandomPieces().map(p => {
      let currentShape = p.shape;
      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) {
        currentShape = currentShape[0].map((_, index) => 
          currentShape.map(row => row[index]).reverse()
        );
      }
      return { ...p, id: `p-${Math.random()}`, shape: currentShape, color: p.color };
    });
  }

  const checkGameOver = (currentGrid: (string | null)[][], nextPieces: Piece[]) => {
    return !nextPieces.some(p => {
      for (let r = 0; r <= 8 - p.shape.length; r++) {
        for (let c = 0; c <= 8 - p.shape[0].length; c++) {
          let fits = true;
          for (let i = 0; i < p.shape.length; i++) {
            for (let j = 0; j < p.shape[i].length; j++) {
              if (p.shape[i][j] && currentGrid[r + i][c + j]) { fits = false; break; }
            }
            if (!fits) break;
          }
          if (fits) return true;
        }
      }
      return false;
    });
  };

  const handleReset = useCallback(() => {
    setGrid(Array(8).fill(null).map(() => Array(8).fill(null)));
    setScore(0); setDisplayScore(0); setCombo(0); setLastBonus(null);
    setMaxCombo(0); setTotalLines(0);
    setAvailablePieces(getNewTransformedPieces());
    setIsGameOver(false); setShowMenu(false); setConfirmDelete(false);
    setThemeIndex(Math.floor(Math.random() * THEMES.length));
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    const currentPreview = preview;
    setActiveId(null);
    setPreview(null);

    if (!over || over.id === 'piece-dock' || !currentPreview?.isValid) return;

    playSound(SOUNDS.place);
    const newGrid = grid.map(row => [...row]);
    currentPreview.shape.forEach((row: any[], pr: number) => {
      row.forEach((cell, pc) => {
        if (cell === 1) newGrid[currentPreview.r + pr][currentPreview.c + pc] = currentPreview.color;
      });
    });

    let rClear = [], cClear = [];
    for (let r = 0; r < 8; r++) if (newGrid[r].every(v => v !== null)) rClear.push(r);
    for (let c = 0; c < 8; c++) if (newGrid.every(r => r[c] !== null)) cClear.push(c);

    if (rClear.length > 0 || cClear.length > 0) {
      rClear.forEach(r => newGrid[r].fill(null));
      cClear.forEach(c => newGrid.forEach(r => r[c] = null));
      
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      
      const lines = rClear.length + cClear.length;
      setTotalLines(prev => prev + lines);
      const bonus = (lines * 150) * newCombo;
      
      setLastBonus(bonus);
      playSound(SOUNDS.clear);
      setScore(s => s + bonus);
      changeTheme(); 
      setTimeout(() => setLastBonus(null), 1200);
    } else {
      setCombo(0);
      setScore(s => s + 20); 
    }

    setGrid(newGrid);
    const remaining = availablePieces.filter(p => p.id !== active.id);
    const nextSet = remaining.length === 0 ? getNewTransformedPieces() : remaining;
    setAvailablePieces(nextSet);
    
    if (checkGameOver(newGrid, nextSet)) {
      setIsGameOver(true);
      playSound(SOUNDS.gameOver);
    }
  };

  const currentTheme = THEMES[themeIndex];

  // --- RENDERIZADO DE CARGA ---
  if (isLoading) return (
    <div className="h-[100dvh] bg-[#0a0a0a] flex flex-col items-center justify-center p-8">
      <style>{animationStyles}</style>
      <div className="relative mb-12 text-center">
        <h1 className="text-white text-5xl font-black italic tracking-tighter uppercase opacity-80 animate-pulse">AI BLOCK</h1>
        <div className="text-[9px] font-bold text-white/30 tracking-[0.6em] mt-2 uppercase">Iniciando Sistema</div>
      </div>
      <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-white shadow-[0_0_15px_white] transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
      </div>
    </div>
  );

  return (
    <div className={`h-[100dvh] w-full ${currentTheme.bg} flex flex-col items-center justify-between pb-6 pt-16 px-4 transition-colors duration-1000 overflow-hidden`}>
      <style>{animationStyles}</style>
      
      {/* HUD SUPERIOR */}
      <div className="w-full flex justify-between items-center max-w-[320px] z-20 mt-4">
        <div className="bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <p className="text-[8px] font-black uppercase text-white/50 mb-1">Récord</p>
          <p className="font-mono font-bold text-white text-base leading-none">{highScore}</p>
        </div>
        <button onClick={() => setShowMenu(true)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 border border-white/20 active:scale-90 transition-transform shadow-lg">
          <span className="text-lg text-white font-bold">☰</span>
        </button>
      </div>

      {!gameStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <div className="text-center">
            <h1 className="text-8xl font-black italic tracking-tighter text-white leading-[0.85] drop-shadow-2xl">AI<br/>BLOCK</h1>
          </div>
          <button onClick={() => setGameStarted(true)} className={`px-20 py-6 ${currentTheme.accent} font-black rounded-[2rem] shadow-2xl active:scale-95 transition-all text-xs tracking-[0.5em] uppercase`}>Jugar</button>
          <p className="text-[10px] text-white/40 font-bold tracking-[0.4em] uppercase">V 3.4 - ELAEHTDEV</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} 
          onDragStart={(e) => { setActiveId(e.active.id as string); playSound(SOUNDS.click); }}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => {
            const { over, active } = e;
            if (!over || over.id === 'piece-dock') { setPreview(null); return; }
            const piece = availablePieces.find(p => p.id === active.id);
            if (!piece || !over.data.current) return;
            const { r: dR, c: dC } = over.data.current as any;
            let sR = Math.max(0, Math.min(dR - Math.floor(piece.shape.length / 2), 8 - piece.shape.length));
            let sC = Math.max(0, Math.min(dC - Math.floor(piece.shape[0].length / 2), 8 - piece.shape[0].length));
            if (!preview || preview.r !== sR || preview.c !== sC) {
              let valid = true;
              for (let i = 0; i < piece.shape.length; i++) 
                for (let j = 0; j < piece.shape[i].length; j++) 
                  if (piece.shape[i][j] && grid[sR + i][sC + j]) valid = false;
              setPreview({ r: sR, c: sC, shape: piece.shape, color: piece.color, isValid: valid });
            }
          }}>
          
          <header className="flex items-center justify-center gap-4 py-2 relative w-full max-w-[400px]">
            <h2 className="text-[18vw] sm:text-8xl font-black text-white tracking-tighter font-mono drop-shadow-md leading-none">
              {displayScore}
            </h2>
            
            <div className="absolute left-[70%] top-[-10px] flex flex-col items-start pointer-events-none w-max z-30">
              {lastBonus && (
                <div className="animate-fade-out-up flex flex-col items-center">
                   {combo > 1 && (
                    <span className="bg-yellow-400 text-black text-[10px] sm:text-[12px] px-2 py-0.5 rounded-md font-black shadow-xl mb-1 border border-black/10 scale-110">
                      x{combo} CONSECUTIVO
                    </span>
                  )}
                  <span className="text-white text-3xl sm:text-5xl font-black drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]">
                    +{lastBonus}
                  </span>
                </div>
              )}
            </div>
          </header>

          <div className={`w-[88vw] max-w-[320px] p-2 rounded-[2rem] bg-black/10 border border-white/10 ${performanceMode ? '' : 'shadow-2xl backdrop-blur-sm'}`}>
            <div className="grid grid-cols-8 gap-1">
              {grid.map((row, r) => row.map((cellColor, c) => (
                <BoardCell key={`${r}-${c}`} r={r} c={c} color={cellColor} performanceMode={performanceMode}
                  isPreview={preview && r >= preview.r && r < preview.r + preview.shape.length && c >= preview.c && c < preview.c + preview.shape[0].length && preview.shape[r - preview.r][c - preview.c]} 
                  isInvalid={preview && !preview.isValid} />
              )))}
            </div>
          </div>

          <PieceDock>
            {availablePieces.map(p => <DraggablePiece key={p.id} {...p} performanceMode={performanceMode} />)}
          </PieceDock>

          <DragOverlay dropAnimation={null}>
            {activeId ? <DraggablePiece id={activeId} shape={availablePieces.find(p => p.id === activeId)?.shape} color={availablePieces.find(p => p.id === activeId)?.color} isOverlay performanceMode={performanceMode} /> : null}
          </DragOverlay>

          {isGameOver && (
            <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
              <div className="bg-white rounded-[3rem] p-10 text-center w-full max-w-[310px] shadow-2xl border border-white relative">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.4em] mb-2">Puntaje Final</p>
                <div className="text-8xl font-black mb-8 text-stone-900 tracking-tighter font-mono">{score}</div>
                <div className="grid grid-cols-2 gap-4 mb-8 border-y border-stone-100 py-4">
                  <div className="text-left">
                    <p className="text-[8px] font-bold uppercase opacity-40">Récord</p>
                    <p className="font-mono font-bold text-stone-800 text-base">{highScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold uppercase opacity-40">Líneas</p>
                    <p className="font-black text-emerald-600 text-base">{totalLines}</p>
                  </div>
                </div>
                <button onClick={handleReset} className="w-full py-5 rounded-2xl bg-black text-white font-black text-[10px] tracking-widest active:scale-95 transition-all uppercase shadow-xl">Reintentar</button>
              </div>
            </div>
          )}
        </DndContext>
      )}

      {/* MENÚ LATERAL/MODAL */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-8 backdrop-blur-2xl">
          <div className="w-full max-w-[280px] flex flex-col space-y-3">
            <h3 className="text-4xl font-black italic text-white text-center uppercase mb-6 tracking-tighter">Ajustes</h3>
            
            {/* Bloque de estadísticas solicitado */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <p className="text-[8px] text-white/40 uppercase font-black mb-1">Líneas</p>
                <p className="text-xl font-bold text-white font-mono">{totalLines}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <p className="text-[8px] text-white/40 uppercase font-black mb-1">Max Combo</p>
                <p className="text-xl font-bold text-white font-mono">x{maxCombo}</p>
              </div>
            </div>

            <button onClick={() => setPerformanceMode(!performanceMode)} 
              className={`w-full py-5 rounded-2xl border font-bold flex justify-between px-8 items-center text-[9px] tracking-widest uppercase transition-all
                ${performanceMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/10 text-white'}`}>
              Rendimiento <span>{performanceMode ? 'ALTO' : 'MIN'}</span>
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className="w-full py-5 bg-white/5 rounded-2xl border border-white/10 font-bold flex justify-between px-8 items-center text-[9px] text-white tracking-widest uppercase active:bg-white/10">
              Sonido <span>{isMuted ? 'MUDO' : 'ON'}</span>
            </button>
            <button onClick={handleReset} className="w-full py-5 bg-white/5 rounded-2xl border border-white/10 font-bold text-[9px] text-white tracking-widest uppercase px-8 text-left active:bg-white/10">Reiniciar Partida</button>
            <button onClick={() => { setGameStarted(false); setShowMenu(false); }} className="w-full py-5 bg-white/5 rounded-2xl border border-white/10 font-bold text-[9px] text-white tracking-widest uppercase px-8 text-left active:bg-white/10">Ir al Inicio</button>
            
            <div className="pt-4">
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} className="w-full py-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 font-black text-[9px] tracking-widest uppercase">Resetear Récord</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { localStorage.removeItem('user-highscore'); setHighScore(0); setConfirmDelete(false); }} 
                    className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black text-[8px] uppercase">Borrar</button>
                  <button onClick={() => setConfirmDelete(false)} 
                    className="flex-1 py-4 bg-white/10 text-white rounded-xl font-black text-[8px] uppercase">No</button>
                </div>
              )}
            </div>
            <button onClick={() => setShowMenu(false)} className="w-full py-7 rounded-[2.5rem] bg-white text-black font-black text-xs tracking-[0.4em] shadow-2xl mt-6 uppercase active:scale-95 transition-transform">Volver</button>
          </div>
        </div>
      )}
    </div>
  );
}
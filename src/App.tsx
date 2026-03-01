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
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { getRandomPieces, type Piece } from './logic/pieces';

const SOUNDS = {
  place: '/sounds/place.mp3',
  clear: '/sounds/clear.mp3',
  gameOver: '/sounds/gameOver.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

const THEMES = [
  { name: 'Ámbar', primary: 'text-amber-900', bg: 'bg-amber-600', screen: 'bg-[#fdfaf3]', accent: 'border-amber-200/60', cell: 'bg-black/[0.05]', scoreBg: 'bg-amber-100/80' },
  { name: 'Minimal', primary: 'text-stone-800', bg: 'bg-stone-800', screen: 'bg-[#f4f4f4]', accent: 'border-stone-300', cell: 'bg-black/[0.03]', scoreBg: 'bg-white/90' },
  { name: 'Carmesí', primary: 'text-red-950', bg: 'bg-red-700', screen: 'bg-[#fff1f1]', accent: 'border-red-200', cell: 'bg-red-900/[0.04]', scoreBg: 'bg-red-100/80' },
  { name: 'Papel Rosado', primary: 'text-pink-900', bg: 'bg-pink-500', screen: 'bg-[#fff0f6]', accent: 'border-pink-200', cell: 'bg-pink-900/[0.04]', scoreBg: 'bg-pink-100/80' },
  { name: 'Océano', primary: 'text-blue-900', bg: 'bg-blue-600', screen: 'bg-[#f0f4f8]', accent: 'border-blue-200', cell: 'bg-blue-900/[0.05]', scoreBg: 'bg-blue-100/80' },
  { name: 'Medianoche', primary: 'text-stone-100', bg: 'bg-stone-800', screen: 'bg-[#0a0a0a]', accent: 'border-stone-800', cell: 'bg-white/5', scoreBg: 'bg-white/10' },
  { name: 'Esmeralda', primary: 'text-emerald-950', bg: 'bg-emerald-700', screen: 'bg-[#f0fdf4]', accent: 'border-emerald-200', cell: 'bg-emerald-900/[0.05]', scoreBg: 'bg-emerald-100/80' },
];

// --- COMPONENTES ---

const BoardCell = memo(({ r, c, color, isPreview, isInvalid, themeCell }: any) => {
  const { setNodeRef } = useDroppable({ id: `cell-${r}-${c}`, data: { r, c } });
  
  const cellState = useMemo(() => {
    if (color) return `${color} border-white/10`;
    if (isPreview) return isInvalid ? 'bg-red-500/30 border-red-400' : 'bg-black/15 border-white';
    return `${themeCell} border-transparent`;
  }, [color, isPreview, isInvalid, themeCell]);

  return <div ref={setNodeRef} className={`aspect-square w-full rounded-sm border transition-colors duration-100 ${cellState}`} />;
});

const DraggablePiece = memo(({ id, shape, color, isOverlay = false }: any) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isOverlay ? 1.05 : 0.8})` : 'scale(0.8)',
    opacity: isDragging && !isOverlay ? 0 : 1,
    touchAction: 'none' as const,
    zIndex: isOverlay ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing origin-center touch-none">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}>
        {shape.map((row: any[], rIdx: number) => row.map((cell, cIdx) => (
          <div key={`${rIdx}-${cIdx}`} className={`w-[4.5vw] h-[4.5vw] max-w-[15px] max-h-[15px] rounded-sm ${cell ? `${color} border border-white/10 shadow-sm` : 'bg-transparent'}`} />
        )))}
      </div>
    </div>
  );
});

const PieceDock = ({ children }: { children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id: 'piece-dock' });
  return (
    <div ref={setNodeRef} className="w-full max-w-[300px] h-24 flex justify-around items-center bg-white/20 rounded-2xl border border-white/30 backdrop-blur-sm relative mb-4">
      {children}
    </div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<(string | null)[][]>(() => Array(8).fill(null).map(() => Array(8).fill(null)));
  const [availablePieces, setAvailablePieces] = useState<Piece[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('user-highscore')) || 0);
  const [displayScore, setDisplayScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [floatingPoints, setFloatingPoints] = useState<{id: number, val: number} | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [themeIndex, setThemeIndex] = useState(0);

  const currentTheme = useMemo(() => THEMES[themeIndex], [themeIndex]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(() => setIsLoading(false), 500); return 100; }
        return p + 2;
      });
    }, 40);
    setAvailablePieces(getNewTransformedPieces());
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('user-highscore', score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    if (displayScore < score) {
      const timeout = setTimeout(() => setDisplayScore(p => Math.min(p + 10, score)), 10);
      return () => clearTimeout(timeout);
    }
  }, [score, displayScore]);

  const playSound = useCallback((url: string) => {
    if (isMuted) return;
    const audio = new Audio(url);
    audio.volume = 0.1;
    audio.play().catch(() => {});
  }, [isMuted]);

  function getNewTransformedPieces() {
    const colors = ['bg-blue-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500', 'bg-violet-500', 'bg-orange-500'];
    return getRandomPieces().map(p => ({ 
      ...p, id: `p-${Math.random()}`, 
      color: colors[Math.floor(Math.random() * colors.length)] 
    }));
  }

  const handleReset = useCallback(() => {
    setGrid(Array(8).fill(null).map(() => Array(8).fill(null)));
    setScore(0);
    setDisplayScore(0);
    setAvailablePieces(getNewTransformedPieces());
    setIsGameOver(false);
    setShowMenu(false);
    setThemeIndex(0);
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
      const bonus = (rClear.length + cClear.length) * 150;
      setFloatingPoints({ id: Date.now(), val: bonus });
      setTimeout(() => setFloatingPoints(null), 1000);
      playSound(SOUNDS.clear);
      setScore(s => s + bonus);
      setThemeIndex(Math.floor(Math.random() * THEMES.length));
    } else {
      setScore(s => s + 10);
    }

    setGrid(newGrid);
    const remaining = availablePieces.filter(p => p.id !== active.id);
    const nextSet = remaining.length === 0 ? getNewTransformedPieces() : remaining;
    setAvailablePieces(nextSet);
    
    const canPlaceAny = nextSet.some(p => {
      for (let r = 0; r <= 8 - p.shape.length; r++) {
        for (let c = 0; c <= 8 - p.shape[0].length; c++) {
          let fits = true;
          for (let i = 0; i < p.shape.length; i++) 
            for (let j = 0; j < p.shape[i].length; j++) 
              if (p.shape[i][j] && newGrid[r+i][c+j]) fits = false;
          if (fits) return true;
        }
      }
      return false;
    });
    if (!canPlaceAny) { setIsGameOver(true); playSound(SOUNDS.gameOver); }
  };

  if (isLoading) return (
    <div className="h-[100dvh] bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <h1 className="text-white text-5xl font-black italic mb-16 tracking-tighter animate-pulse uppercase">AI BLOCK</h1>
      <div className="h-24 flex items-center justify-center mb-12">
          <div className="loading-piece bg-white" />
      </div>
      <div className="w-48 bg-white/10 h-1 rounded-full overflow-hidden"><div className="h-full bg-white transition-all duration-300" style={{ width: `${loadingProgress}%` }} /></div>
      <style>{`
        .loading-piece { animation: morphSequence 4s infinite cubic-bezier(0.76, 0, 0.24, 1); border-radius: 4px; }
        @keyframes morphSequence {
          0%, 10% { width: 60px; height: 15px; } 25%, 35% { width: 30px; height: 30px; }
          50%, 60% { width: 15px; height: 30px; } 75%, 85% { width: 15px; height: 15px; } 100% { width: 60px; height: 15px; }
        }
      `}</style>
    </div>
  );

  return (
    <div className={`h-[100dvh] w-full ${currentTheme.screen} flex flex-col items-center justify-between pb-[env(safe-area-inset-bottom,20px)] pt-[env(safe-area-inset-top,20px)] px-4 transition-colors duration-700 overflow-hidden`}>
      
      {/* HUD Superior Original */}
      <div className="w-full flex justify-between items-center max-w-[320px] mt-2">
        <div className="bg-white/40 px-3 py-1 rounded-lg border border-black/5 backdrop-blur-sm shadow-sm">
          <p className="text-[9px] font-bold opacity-40 uppercase leading-none">Récord</p>
          <p className="font-mono font-bold text-stone-800 text-sm leading-none">{highScore}</p>
        </div>
        <button onClick={() => { playSound(SOUNDS.click); setShowMenu(true); }} 
          className={`w-9 h-9 rounded-lg ${currentTheme.bg} text-white font-bold text-lg shadow-md active:scale-90`}>☰</button>
      </div>

      {!gameStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className={`text-6xl font-black italic tracking-tighter ${currentTheme.primary} mb-12`}>AI BLOCK</h1>
          <button onClick={() => setGameStarted(true)} className={`px-16 py-4 text-white font-black rounded-full shadow-xl ${currentTheme.bg} active:scale-95 transition-all mb-8 text-lg tracking-widest`}>JUGAR</button>
          <div className="opacity-30 text-[9px] font-bold tracking-[0.4em]">V2.8 | BY ELAEHT</div>
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
            let valid = true;
            for (let i = 0; i < piece.shape.length; i++) 
              for (let j = 0; j < piece.shape[i].length; j++) 
                if (piece.shape[i][j] && grid[sR + i][sC + j]) valid = false;
            setPreview({ r: sR, c: sC, shape: piece.shape, color: piece.color, isValid: valid });
          }}>
          
          <header className="text-center relative py-4 flex flex-col items-center">
            <div className={`relative ${currentTheme.scoreBg} px-8 py-2 rounded-2xl backdrop-blur-md shadow-sm inline-flex flex-col items-center transition-colors duration-500`}>
              <h2 className={`font-mono font-black ${currentTheme.primary} leading-none text-6xl`}>
                {displayScore}
              </h2>
              <p className={`text-[10px] font-black uppercase ${currentTheme.primary} opacity-40 tracking-[0.3em]`}>Puntos</p>
              
              {/* +150 FLOTANTE AL COSTADO DEL SCORE */}
              {floatingPoints && (
                <div key={floatingPoints.id} className="absolute -right-16 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-500 animate-out fade-out slide-out-to-top-8 duration-1000 fill-mode-forwards z-50">
                  +{floatingPoints.val}
                </div>
              )}
            </div>
          </header>

          <div className="relative">
            <div className={`w-[85vw] max-w-[300px] p-1.5 rounded-xl border bg-black/5 ${currentTheme.accent} shadow-xl`}>
              <div className="grid grid-cols-8 gap-1">
                {grid.map((row, r) => row.map((cellColor, c) => (
                  <BoardCell key={`${r}-${c}`} r={r} c={c} color={cellColor} themeCell={currentTheme.cell} 
                    isPreview={preview && r >= preview.r && r < preview.r + preview.shape.length && c >= preview.c && c < preview.c + preview.shape[0].length && preview.shape[r - preview.r][c - preview.c]} 
                    isInvalid={preview && !preview.isValid} />
                )))}
              </div>
            </div>
          </div>

          <PieceDock>
            {availablePieces.map(p => <DraggablePiece key={p.id} {...p} />)}
          </PieceDock>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '1' } } }),
            duration: 300,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
          }}>
            {activeId ? <DraggablePiece id={activeId} shape={availablePieces.find(p => p.id === activeId)?.shape} color={availablePieces.find(p => p.id === activeId)?.color} isOverlay /> : null}
          </DragOverlay>

          {/* GAME OVER ORIGINAL RE-ESTABLECIDO */}
          {isGameOver && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
              <div className="bg-white rounded-[2rem] p-8 text-center w-full max-w-[280px] shadow-2xl relative">
                <p className="text-stone-400 font-bold text-[10px] uppercase mb-1">Finalizado</p>
                <div className={`text-6xl font-black mb-4 font-mono ${currentTheme.primary}`}>{score}</div>
                <button onClick={handleReset} className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest ${currentTheme.bg} active:scale-95 transition-all text-sm mb-3`}>REINTENTAR</button>
                <button onClick={() => setGameStarted(false)} className="text-stone-400 font-bold text-xs uppercase">Menú Principal</button>
              </div>
            </div>
          )}
        </DndContext>
      )}

      {/* MENÚ ORIGINAL RE-ESTABLECIDO */}
      {showMenu && (
        <div className="fixed inset-0 bg-stone-900/95 z-[200] flex items-center justify-center p-6 text-white backdrop-blur-xl">
          <div className="w-full max-w-[260px] space-y-4">
            <h3 className="text-2xl font-black italic text-center mb-6 uppercase tracking-tighter">Opciones</h3>
            <button onClick={() => setIsMuted(!isMuted)} className="w-full py-4 bg-white/10 rounded-xl font-bold flex justify-between px-6 items-center uppercase text-[10px]">Sonido <span>{isMuted ? 'OFF' : 'ON'}</span></button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="w-full py-4 bg-red-500/10 text-red-400 border border-red-500/10 rounded-xl font-bold text-[10px] uppercase">Borrar Récord</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { localStorage.removeItem('user-highscore'); setHighScore(0); setConfirmDelete(false); }} className="flex-1 py-3 bg-red-500 text-white rounded-lg font-black text-[10px]">SÍ</button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 bg-white/10 text-white rounded-lg font-black text-[10px]">NO</button>
              </div>
            )}
            <button onClick={handleReset} className="w-full py-4 bg-white/10 rounded-xl font-bold text-[10px] uppercase">Reiniciar</button>
            <button onClick={() => { setGameStarted(false); setShowMenu(false); }} className="w-full py-4 bg-white/10 rounded-xl font-bold text-[10px] uppercase">Menú Principal</button>
            <button onClick={() => setShowMenu(false)} className={`w-full py-5 rounded-xl font-black shadow-lg ${currentTheme.bg} uppercase text-xs tracking-widest mt-4`}>Continuar</button>
          </div>
        </div>
      )}
    </div>
  );
}
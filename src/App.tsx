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

// --- COMPONENTES OPTIMIZADOS ---

const BoardCell = memo(({ r, c, color, isPreview, isInvalid }: any) => {
  const { setNodeRef } = useDroppable({ id: `cell-${r}-${c}`, data: { r, c } });
  
  const cellState = useMemo(() => {
    if (color) return `${color} border-white/30 shadow-[inset_0_0_8px_rgba(255,255,255,0.2)]`; 
    if (isPreview) return isInvalid 
      ? 'bg-red-500/50 border-red-200' 
      : 'bg-black/60 border-white border-2 z-10 scale-105'; 
    return `bg-black/15 border-transparent`;
  }, [color, isPreview, isInvalid]);

  return <div ref={setNodeRef} className={`aspect-square w-full rounded-md border ${cellState}`} />;
});

const DraggablePiece = memo(({ id, shape, color, isOverlay = false }: any) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  
  const style = {
    // Eliminamos transiciones CSS durante el arrastre para fluidez total
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isOverlay ? 0.95 : 0.75})` : 'scale(0.75)',
    opacity: isDragging && !isOverlay ? 0 : 1,
    touchAction: 'none' as const,
    zIndex: isOverlay ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing origin-center touch-none">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}>
        {shape.map((row: any[], rIdx: number) => row.map((cell, cIdx) => (
          <div key={`${rIdx}-${cIdx}`} 
            className={`w-[4.5vw] h-[4.5vw] max-w-[16px] max-h-[16px] rounded-sm ${cell ? `${color} border border-white/20` : 'bg-transparent'}`} 
          />
        )))}
      </div>
    </div>
  );
});

const PieceDock = ({ children }: { children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id: 'piece-dock' });
  return (
    <div ref={setNodeRef} className="w-full max-w-[320px] h-28 flex justify-around items-center bg-black/10 rounded-[2rem] border border-white/10 backdrop-blur-md relative mb-6 shadow-xl">
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
  const [combo, setCombo] = useState(0);
  const [lastBonus, setLastBonus] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [themeIndex, setThemeIndex] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const changeTheme = useCallback(() => {
    setThemeIndex(prev => (prev + 1) % THEMES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(() => setIsLoading(false), 400); return 100; }
        return p + 5;
      });
    }, 20);
    setAvailablePieces(getNewTransformedPieces());
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('user-highscore', score.toString());
    }
    if (score > 0 && score % 1000 === 0) changeTheme();
  }, [score, highScore, changeTheme]);

  useEffect(() => {
    if (displayScore < score) {
      const timeout = setTimeout(() => setDisplayScore(p => Math.min(p + 35, score)), 5);
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
    const colors = ['bg-yellow-400', 'bg-cyan-400', 'bg-pink-500', 'bg-green-400', 'bg-orange-500', 'bg-white'];
    return getRandomPieces().map(p => ({ 
      ...p, id: `p-${Math.random()}`, 
      color: colors[Math.floor(Math.random() * colors.length)] 
    }));
  }

  const handleReset = useCallback(() => {
    setGrid(Array(8).fill(null).map(() => Array(8).fill(null)));
    setScore(0);
    setDisplayScore(0);
    setCombo(0);
    setLastBonus(null);
    setAvailablePieces(getNewTransformedPieces());
    setIsGameOver(false);
    setShowMenu(false);
    setThemeIndex(Math.floor(Math.random() * THEMES.length));
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    const currentPreview = preview;
    setActiveId(null);
    setPreview(null);

    if (!over || over.id === 'piece-dock' || !currentPreview?.isValid) {
      setCombo(0);
      setLastBonus(null);
      return;
    }

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
      const bonus = (rClear.length + cClear.length) * 150 * newCombo;
      setLastBonus(bonus);
      playSound(SOUNDS.clear);
      setScore(s => s + bonus);
      changeTheme(); 
    } else {
      setCombo(0);
      setLastBonus(null);
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

  const currentTheme = THEMES[themeIndex];

  if (isLoading) return (
    <div className="h-[100dvh] bg-[#0a0a0a] flex flex-col items-center justify-center p-8">
      <div className="relative mb-12 text-center">
        <h1 className="text-white text-5xl font-black italic tracking-tighter uppercase opacity-80 animate-pulse">AI BLOCK</h1>
        <div className="text-[9px] font-bold text-white/30 tracking-[0.6em] mt-2 uppercase">Iniciando Sistema</div>
      </div>
      <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-white shadow-[0_0_15px_white]" style={{ width: `${loadingProgress}%` }} />
      </div>
    </div>
  );

  return (
    <div className={`h-[100dvh] w-full ${currentTheme.bg} flex flex-col items-center justify-between pb-6 pt-6 px-4 transition-colors duration-1000 overflow-hidden`}>
      
      <div className="w-full flex justify-between items-center max-w-[320px] z-20">
        <div className="bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <p className="text-[8px] font-black uppercase text-white/50 leading-none mb-1">Récord</p>
          <p className="font-mono font-bold text-white text-base leading-none">{highScore}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          {combo > 1 && <span className="bg-yellow-400 text-black text-[9px] px-2 py-0.5 rounded-lg font-black animate-pulse">X{combo} COMBO</span>}
          {lastBonus && <span className="text-white text-xs font-black animate-bounce">+{lastBonus}</span>}
        </div>

        <button onClick={() => setShowMenu(true)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 border border-white/20 active:scale-90 transition-transform shadow-lg">
          <span className="text-lg text-white">☰</span>
        </button>
      </div>

      {!gameStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <div className="text-center">
            <h1 className="text-8xl font-black italic tracking-tighter text-white leading-[0.85] drop-shadow-lg">AI<br/>BLOCK</h1>
            <div className="mt-6 h-1.5 w-16 bg-white mx-auto rounded-full opacity-40"></div>
          </div>
          <button onClick={() => setGameStarted(true)} className={`px-20 py-6 ${currentTheme.accent} font-black rounded-[2rem] shadow-2xl active:scale-95 transition-all text-xs tracking-[0.5em] uppercase`}>Jugar</button>
          <p className="text-[10px] text-white/40 font-bold tracking-[0.4em] uppercase">V 2.9 - ELAEHTDEV</p>
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
          
          <header className="text-center py-2 relative">
            <h2 className="text-8xl font-black text-white tracking-tighter font-mono drop-shadow-md">{displayScore}</h2>
          </header>

          <div className="w-[88vw] max-w-[320px] p-2 rounded-[2rem] bg-black/10 border border-white/10 shadow-2xl backdrop-blur-sm">
            <div className="grid grid-cols-8 gap-1">
              {grid.map((row, r) => row.map((cellColor, c) => (
                <BoardCell key={`${r}-${c}`} r={r} c={c} color={cellColor}
                  isPreview={preview && r >= preview.r && r < preview.r + preview.shape.length && c >= preview.c && c < preview.c + preview.shape[0].length && preview.shape[r - preview.r][c - preview.c]} 
                  isInvalid={preview && !preview.isValid} />
              )))}
            </div>
          </div>

          <PieceDock>
            {availablePieces.map(p => <DraggablePiece key={p.id} {...p} />)}
          </PieceDock>

          {/* Eliminamos dropAnimation para fluidez absoluta */}
          <DragOverlay dropAnimation={null}>
            {activeId ? <DraggablePiece id={activeId} shape={availablePieces.find(p => p.id === activeId)?.shape} color={availablePieces.find(p => p.id === activeId)?.color} isOverlay /> : null}
          </DragOverlay>

          {isGameOver && (
            <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
              <div className="bg-white rounded-[3rem] p-10 text-center w-full max-w-[310px] shadow-2xl border border-white relative overflow-hidden">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.4em] mb-2">Resultado</p>
                <div className="text-8xl font-black mb-8 text-stone-900 tracking-tighter font-mono">{score}</div>
                <div className="grid grid-cols-2 gap-4 mb-8 border-y border-stone-100 py-4">
                  <div className="text-left">
                    <p className="text-[8px] font-bold uppercase opacity-40">Récord</p>
                    <p className="font-mono font-bold text-stone-800 text-base">{highScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold uppercase opacity-40">Estado</p>
                    <p className="font-black text-emerald-600 text-[9px] uppercase">Guardado</p>
                  </div>
                </div>
                <button onClick={handleReset} className="w-full py-5 rounded-2xl bg-black text-white font-black text-[10px] tracking-widest active:scale-95 transition-all uppercase shadow-xl">Reintentar</button>
              </div>
            </div>
          )}
        </DndContext>
      )}

      {showMenu && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-8 backdrop-blur-2xl">
          <div className="w-full max-w-[280px] flex flex-col space-y-4">
            <h3 className="text-4xl font-black italic text-white text-center uppercase mb-6 tracking-tighter">Ajustes</h3>
            <button onClick={() => setIsMuted(!isMuted)} className="w-full py-5 bg-white/5 rounded-2xl border border-white/10 font-bold flex justify-between px-8 items-center text-[9px] text-white tracking-widest uppercase active:bg-white/10">
              Sonido <span>{isMuted ? 'Mudo' : 'Activado'}</span>
            </button>
            <button onClick={handleReset} className="w-full py-5 bg-white/5 rounded-2xl border border-white/10 font-bold text-[9px] text-white tracking-widest uppercase px-8 text-left">Reiniciar</button>
            <button onClick={() => { setGameStarted(false); setShowMenu(false); }} className="w-full py-5 bg-white/5 rounded-2xl border border-white/10 font-bold text-[9px] text-white tracking-widest uppercase px-8 text-left">Salir al Menú</button>
            
            <div className="pt-4 border-t border-white/10 mt-2">
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} className="w-full py-3 text-white/30 font-black text-[8px] tracking-widest uppercase text-center">Borrar Récords</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { localStorage.removeItem('user-highscore'); setHighScore(0); setConfirmDelete(false); }} className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black text-[8px] uppercase">Borrar</button>
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 py-4 bg-white/10 text-white rounded-xl font-black text-[8px] uppercase">No</button>
                </div>
              )}
            </div>
            <button onClick={() => setShowMenu(false)} className="w-full py-7 rounded-[2.5rem] bg-white text-black font-black text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-transform mt-8 uppercase">Continuar</button>
          </div>
        </div>
      )}
    </div>
  );
}
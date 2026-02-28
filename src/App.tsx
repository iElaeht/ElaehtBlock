import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter,
  type DragEndEvent
} from '@dnd-kit/core';
import { getRandomPieces, type Piece } from './logic/pieces';

const SOUNDS = {
  place: '/sounds/place.mp3',
  clear: '/sounds/clear.mp3',
  gameOver: '/sounds/gameOver.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  bonus: '/sounds/bonus.mp3'
};

// --- COMPONENTES ---

const BoardCell = memo(({ r, c, color, isPreview, isInvalid, isClearing }: any) => {
  const { setNodeRef } = useDroppable({ id: `cell-${r}-${c}`, data: { r, c } });
  let bgClass = 'bg-white/[0.05] border-white/5'; 
  
  if (isClearing) {
    bgClass = 'bg-white scale-0 z-10';
  } else if (color) {
    bgClass = `${color} border-black/10 scale-100 shadow-inner`;
  } else if (isPreview) {
    bgClass = isInvalid 
      ? 'bg-red-500/30 border-red-500/40' 
      : 'bg-white/20 border-white/30 scale-95';
  }

  return (
    <div 
      ref={setNodeRef} 
      className={`w-[10.5vw] h-[10.5vw] max-w-[48px] max-h-[48px] sm:w-11 sm:h-11 rounded-md border ${bgClass} transition-all duration-100 ease-linear will-change-transform`} 
    />
  );
});

const DraggablePiece = memo(({ id, shape, color }: Piece) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  
  const style = { 
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.15)` : 'translate3d(0, 0, 0)',
    touchAction: 'none' as const,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 1,
    transition: transform ? 'none' : 'transform 200ms ease-out',
    willChange: isDragging ? 'transform, opacity' : 'transform',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none active:scale-105 transition-transform">
      <div className="grid gap-0.5">
        {shape.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-0.5">
            {row.map((cell, cIdx) => (
              <div 
                key={cIdx} 
                className={`w-[4.8vw] h-[4.8vw] max-w-[24px] max-h-[24px] rounded-sm ${cell ? `${color} border border-black/10 shadow-lg` : 'bg-transparent'}`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

function PieceDockWrapper({ id, children }: { id: string, children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="mt-10 w-full max-w-[420px] bg-black/30 border border-white/5 rounded-[2rem] p-4 flex justify-around items-center min-h-[130px] transition-all">
      {children}
    </div>
  );
}

const LoadingScreen = () => {
  const [currentPieceIndex, setCurrentPieceIndex] = useState(0);
  const loadingPieces = [
    { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400' },
    { shape: [[1, 1], [1, 1]], color: 'bg-blue-400' },
    { shape: [[1, 1]], color: 'bg-indigo-400' },
    { shape: [[1]], color: 'bg-violet-400' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPieceIndex((prev) => (prev + 1) % loadingPieces.length);
    }, 500);
    return () => clearInterval(interval);
  }, [loadingPieces.length]);

  const piece = loadingPieces[currentPieceIndex];

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center space-y-16 select-none overflow-hidden relative font-sans text-center">
      <div className="text-center">
        <h1 className="text-7xl font-black tracking-tighter italic leading-none animate-pulse">
          ELAEHT<br/>
          <span className="text-white/20 not-italic uppercase text-3xl tracking-[0.2em]">AI Block</span>
        </h1>
      </div>
      <div className="flex items-center justify-center h-48 w-full animate-in fade-in duration-300">
        <div className="grid gap-1">
          {piece.shape.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-1">
              {row.map((cell, cIdx) => (
                <div 
                  key={cIdx} 
                  className={`w-[8vw] h-[8vw] max-w-[40px] max-h-[40px] rounded border border-black/10 shadow-lg ${cell ? piece.color : 'bg-transparent'} transition-all duration-300 ease-in-out`} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] uppercase font-black tracking-[0.6em] text-blue-400 animate-pulse mt-10">Cargando Sistema...</p>
    </div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<(string | null)[][]>(() => Array(8).fill(null).map(() => Array(8).fill(null)));
  const [availablePieces, setAvailablePieces] = useState(() => getNewTransformedPieces());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('user-highscore')) || 0);
  const [displayScore, setDisplayScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [clearingCells, setClearingCells] = useState<{r: number, c: number}[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [bgClass, setBgClass] = useState('bg-slate-800');
  
  // lastMilestone inicializado como número para evitar errores TS
  const lastMilestone = useRef<number>(0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3500); 
    return () => clearTimeout(loadingTimeout);
  }, []);

  const playSound = useCallback((soundUrl: string) => {
    if (isMuted) return;
    const audio = new Audio(soundUrl);
    audio.volume = 0.15;
    audio.play().catch(() => {});
  }, [isMuted]);

  useEffect(() => {
    const currentMilestone = Math.floor(score / 1000);
    if (currentMilestone > lastMilestone.current) {
      lastMilestone.current = currentMilestone;
      const deepColors = ['bg-slate-800', 'bg-blue-950', 'bg-zinc-900', 'bg-neutral-900'];
      setBgClass(deepColors[Math.floor(Math.random() * deepColors.length)]);
      playSound(SOUNDS.bonus);
    }
  }, [score, playSound]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('user-highscore', score.toString());
    }
  }, [score, highScore]);

  function getNewTransformedPieces() {
    const rotateMatrix = (m: number[][]) => m[0].map((_, i) => m.map(row => row[i]).reverse());
    return getRandomPieces().map(piece => {
      let newShape = [...piece.shape];
      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) newShape = rotateMatrix(newShape);
      return { ...piece, shape: newShape, id: `${piece.id}-${Math.random()}` };
    });
  }

  const resetGame = () => {
    setGrid(Array(8).fill(null).map(() => Array(8).fill(null)));
    setScore(0);
    setDisplayScore(0);
    setAvailablePieces(getNewTransformedPieces());
    setIsGameOver(false);
    setShowMenu(false);
    setConfirmRestore(false);
    setBgClass('bg-slate-800');
    lastMilestone.current = 0;
  };

  const handleRestoreData = () => {
    localStorage.removeItem('user-highscore');
    setHighScore(0);
    setConfirmRestore(false);
    resetGame();
  };

  const quitGame = () => {
    setGameStarted(false);
    setShowMenu(false);
    resetGame();
  };

  useEffect(() => {
    if (displayScore < score) {
      const timeout = setTimeout(() => {
        const step = Math.max(1, Math.floor((score - displayScore) / 4));
        setDisplayScore(prev => Math.min(prev + step, score));
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [score, displayScore]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    const currentPreview = preview;
    setPreview(null);

    if (!over || over.id === 'piece-dock' || !currentPreview || !currentPreview.isValid) return;

    playSound(SOUNDS.place);
    const newGrid = grid.map(row => [...row]);
    currentPreview.shape.forEach((row: any, pr: number) => {
      row.forEach((cell: any, pc: number) => {
        if (cell === 1) newGrid[currentPreview.r + pr][currentPreview.c + pc] = currentPreview.color;
      });
    });

    let rowsToClear: number[] = [], colsToClear: number[] = [];
    for (let r = 0; r < 8; r++) if (newGrid[r].every(v => v !== null)) rowsToClear.push(r);
    for (let c = 0; c < 8; c++) if (newGrid.every(r => r[c] !== null)) colsToClear.push(c);

    const totalLines = rowsToClear.length + colsToClear.length;

    if (totalLines > 0) {
      playSound(SOUNDS.clear);
      const pointsToAdd = totalLines * 150 * (totalLines > 1 ? 2 : 1);
      setScore(s => s + pointsToAdd);
      const toAnimate: {r: number, c: number}[] = [];
      rowsToClear.forEach(r => { for(let c=0; c<8; c++) toAnimate.push({r, c}) });
      colsToClear.forEach(c => { for(let r=0; r<8; r++) toAnimate.push({r, c}) });
      setClearingCells(toAnimate);
      setTimeout(() => {
        rowsToClear.forEach(r => newGrid[r].fill(null));
        colsToClear.forEach(c => newGrid.forEach(r => r[c] = null));
        setGrid([...newGrid]);
        setClearingCells([]);
        updateAfterMove(newGrid, active.id.toString());
      }, 150);
    } else {
      setGrid(newGrid);
      updateAfterMove(newGrid, active.id.toString());
    }
    setScore(s => s + 10);
  };

  const updateAfterMove = (newGrid: (string | null)[][], activeId: string) => {
    const remaining = availablePieces.filter(p => p.id !== activeId);
    const nextSet = remaining.length === 0 ? getNewTransformedPieces() : remaining;
    setAvailablePieces(nextSet);
    const canStillPlay = nextSet.some(p => {
      for (let r = 0; r <= 8 - p.shape.length; r++) {
        for (let c = 0; c <= 8 - p.shape[0].length; c++) {
          let possible = true;
          for (let i = 0; i < p.shape.length; i++) {
            for (let j = 0; j < p.shape[i].length; j++) {
              if (p.shape[i][j] === 1 && (newGrid[r+i][c+j] !== null)) { possible = false; break; }
            }
            if (!possible) break;
          }
          if (possible) return true;
        }
      }
      return false;
    });
    if (!canStillPlay) {
      setIsGameOver(true);
      playSound(SOUNDS.gameOver);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className={`min-h-screen w-full ${bgClass} flex flex-col items-center justify-center p-4 text-white select-none overflow-hidden relative font-sans transition-colors duration-1000 ease-in-out`}>
      
      <div className="absolute top-6 left-6 z-50">
        <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm shadow-xl">
          <p className="text-[9px] uppercase font-black tracking-[0.2em] text-blue-400 leading-none mb-1">Mejor Record</p>
          <div className="text-xl font-mono font-bold leading-none tracking-tight">{highScore.toLocaleString()}</div>
        </div>
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center space-y-12 animate-in fade-in duration-500 text-center">
          <div className="text-center group">
            <h1 className="text-6xl font-black tracking-tighter italic leading-none group-hover:scale-105 transition-transform duration-500">ELAEHT<br/><span className="text-white/20 not-italic uppercase text-3xl tracking-[0.2em]">AI Block</span></h1>
          </div>
          <button 
            onClick={() => setGameStarted(true)} 
            className="px-16 py-5 bg-white text-black font-black text-xl rounded-2xl active:scale-90 transition-transform shadow-xl"
          >
            PLAY GAME
          </button>
          <footer className="absolute bottom-6 opacity-30 text-center">
             <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-1">Version: V 1.2</p>
             <p className="text-[9px] font-bold uppercase">Dev: Elaehtdev</p>
          </footer>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} 
          onDragOver={(e) => {
            const { over, active } = e;
            if (!over || over.id === 'piece-dock') { if(preview) setPreview(null); return; }
            const piece = availablePieces.find(p => p.id === active.id.toString());
            if (!piece) return;
            const { r: dropR, c: dropC } = over.data.current as any;
            let startR = Math.max(0, Math.min(dropR - Math.floor(piece.shape.length / 2), 8 - piece.shape.length));
            let startC = Math.max(0, Math.min(dropC - Math.floor(piece.shape[0].length / 2), 8 - piece.shape[0].length));
            let isValid = true;
            for (let r = 0; r < piece.shape.length; r++) {
              for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c] === 1 && (grid[startR + r][startC + c] !== null)) { isValid = false; break; }
              }
              if (!isValid) break;
            }
            if (!preview || preview.r !== startR || preview.c !== startC || preview.isValid !== isValid) {
              setPreview({ r: startR, c: startC, shape: piece.shape, color: piece.color, isValid });
            }
          }} 
          onDragEnd={handleDragEnd}
        >
          <header className="mb-6 text-center tracking-tight animate-in slide-in-from-top duration-500">
            <div className="text-7xl font-mono font-black">{displayScore.toLocaleString()}</div>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">Score</p>
          </header>

          <div className="bg-black/20 p-2 rounded-[1.5rem] border border-white/5 shadow-inner">
            <div className="grid grid-cols-8 gap-1 sm:gap-1.5">
              {grid.map((row, r) => row.map((cellColor, c) => {
                const isPreview = preview ? (r >= preview.r && r < preview.r + preview.shape.length && c >= preview.c && c < preview.c + preview.shape[0].length && preview.shape[r - preview.r][c - preview.c] === 1) : false;
                return <BoardCell key={`${r}-${c}`} r={r} c={c} color={cellColor} isPreview={isPreview} isInvalid={preview ? !preview.isValid : false} isClearing={clearingCells.some(cell => cell.r === r && cell.c === c)} />;
              }))}
            </div>
          </div>

          <PieceDockWrapper id="piece-dock">
            {availablePieces.map(p => (
              <div key={p.id} className="flex-1 flex justify-center items-center scale-90 active:scale-100 transition-transform">
                 <DraggablePiece {...p} />
              </div>
            ))}
          </PieceDockWrapper>

          <button onClick={() => setShowMenu(true)} className="absolute top-6 right-6 flex flex-col items-center justify-center p-4 active:opacity-50 transition-opacity">
             <div className="w-7 h-1 bg-white rounded-full mb-1.5" />
             <div className="w-5 h-1 bg-white/60 rounded-full ml-auto" />
          </button>

          {isGameOver && (
             <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[700] p-6 animate-in fade-in zoom-in duration-300">
               <div className="w-full max-w-sm bg-zinc-900 border border-white/10 p-8 rounded-[2rem] text-center shadow-2xl">
                 <h2 className="text-[10px] font-black tracking-[1em] text-red-500 uppercase mb-6">Fin de Partida</h2>
                 <div className="mb-8">
                   <p className="text-7xl font-mono font-black text-white">{score.toLocaleString()}</p>
                   <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Puntos Totales</p>
                 </div>
                 <div className="space-y-3">
                   <button onClick={resetGame} className="w-full py-5 bg-red-600 text-white font-black text-lg rounded-2xl active:scale-95 transition-transform shadow-xl">REINTENTAR</button>
                   <button onClick={quitGame} className="w-full py-3 text-white/30 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Salir al Menú</button>
                 </div>
               </div>
             </div>
          )}

          {showMenu && (
            <div className="fixed inset-0 bg-black/70 z-[600] flex items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="w-full max-w-xs flex flex-col bg-zinc-900 border border-white/5 rounded-[2rem] overflow-hidden">
                    <div className="p-6 text-center border-b border-white/5">
                      <h3 className="font-black uppercase text-[9px] tracking-[0.5em] opacity-40">Pausa</h3>
                    </div>
                    
                    <div className="p-4 flex flex-col gap-2">
                      <button onClick={() => setIsMuted(!isMuted)} className="w-full py-4 px-5 bg-white/5 rounded-xl font-bold flex justify-between items-center active:bg-white/10 transition-colors">
                        <span>SONIDO</span>
                        <span className={isMuted ? 'text-red-500' : 'text-emerald-500'}>{isMuted ? 'OFF' : 'ON'}</span>
                      </button>
                      
                      <button onClick={resetGame} className="w-full py-4 px-5 bg-white/5 rounded-xl font-bold text-left active:bg-white/10">REINICIAR</button>
                      
                      {!confirmRestore ? (
                        <button onClick={() => setConfirmRestore(true)} className="w-full py-4 px-5 bg-red-500/10 text-red-400 rounded-xl font-bold text-left active:bg-red-500/20">BORRAR RECORD</button>
                      ) : (
                        <div className="bg-red-500/10 p-4 rounded-xl flex flex-col gap-3">
                          <p className="text-[9px] font-black text-red-500 text-center uppercase">¿Estás seguro?</p>
                          <div className="flex gap-2">
                            <button onClick={handleRestoreData} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-black text-xs">SI</button>
                            <button onClick={() => setConfirmRestore(false)} className="flex-1 py-2 bg-white/10 text-white rounded-lg font-black text-xs">NO</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-black/20 flex flex-col gap-2 border-t border-white/5">
                      <button onClick={quitGame} className="w-full py-3 text-white/40 font-bold uppercase text-[9px] tracking-widest hover:text-white transition-colors">Salir</button>
                      <button onClick={() => { setShowMenu(false); setConfirmRestore(false); }} className="w-full py-4 bg-white text-black rounded-xl font-black text-sm uppercase active:scale-95 transition-transform">CONTINUAR</button>
                    </div>
                </div>
            </div>
          )}
        </DndContext>
      )}
    </div>
  );
}
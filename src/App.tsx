import { useState, useEffect, useCallback, memo } from 'react';
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
  
  let bgClass = 'bg-slate-700/10 border-slate-600/10';
  
  if (isClearing) {
    bgClass = 'bg-white shadow-[0_0_15px_#fff] scale-0 z-10';
  } else if (color) {
    bgClass = `${color} border-white/20 scale-100 ring-1 ring-white/5 shadow-sm`;
  } else if (isPreview) {
    bgClass = isInvalid 
      ? 'bg-red-500/20 border-red-400/20' 
      : 'bg-white/10 border-white/20 scale-[0.98]';
  }

  return (
    <div 
      ref={setNodeRef} 
      className={`w-[10.5vw] h-[10.5vw] max-w-[48px] max-h-[48px] sm:w-11 sm:h-11 rounded-md border ${bgClass} transition-all duration-100 ease-out will-change-transform`} 
    />
  );
}, (prev, next) => {
  return prev.color === next.color && 
         prev.isPreview === next.isPreview && 
         prev.isInvalid === next.isInvalid && 
         prev.isClearing === next.isClearing;
});

const PieceDock = memo(({ children }: { children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id: 'piece-dock' });
  return (
    <div 
      ref={setNodeRef}
      className="mt-8 w-full max-w-[420px] flex justify-center p-6 bg-white/5 rounded-[2.5rem] min-h-[150px] items-center border border-white/5 shadow-lg backdrop-blur-sm"
    >
      <div className="flex justify-between items-center w-full gap-4 px-2">
        {children}
      </div>
    </div>
  );
});

const DraggablePiece = memo(({ id, shape, color }: Piece) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  
  const style = { 
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.1)` : 'translate3d(0, 0, 0)',
    touchAction: 'none' as const,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 1,
    transition: transform ? 'none' : 'transform 0.2s cubic-bezier(0, 0, 0.2, 1)',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none cursor-grab active:cursor-grabbing">
      <div className="grid gap-0.5">
        {shape.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-0.5">
            {row.map((cell, cIdx) => (
              <div 
                key={cIdx} 
                className={`w-[4.8vw] h-[4.8vw] max-w-[26px] max-h-[26px] rounded-sm ${cell ? `${color} border border-white/10` : 'bg-transparent'}`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<(string | null)[][]>(() => Array(8).fill(null).map(() => Array(8).fill(null)));
  const [availablePieces, setAvailablePieces] = useState(() => getNewTransformedPieces());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('elaeht-highscore')) || 0);
  const [displayScore, setDisplayScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [clearingCells, setClearingCells] = useState<{r: number, c: number}[]>([]);
  const [showPlusScore, setShowPlusScore] = useState<{val: number, id: number, combo?: boolean} | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const playSound = useCallback((soundUrl: string) => {
    if (isMuted) return;
    const audio = new Audio(soundUrl);
    audio.volume = 0.15;
    audio.play().catch(() => {});
  }, [isMuted]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('elaeht-highscore', score.toString());
    }
  }, [score, highScore]);

  const resetGame = () => {
    setGrid(Array(8).fill(null).map(() => Array(8).fill(null)));
    setScore(0);
    setDisplayScore(0);
    setAvailablePieces(getNewTransformedPieces());
    setIsGameOver(false);
    setShowMenu(false);
  };

  const quitGame = () => {
    setGameStarted(false);
    setShowMenu(false);
    resetGame();
  };

  useEffect(() => {
    if (displayScore < score) {
      const timeout = setTimeout(() => {
        const diff = score - displayScore;
        const step = diff > 50 ? 5 : 1;
        setDisplayScore(prev => Math.min(prev + step, score));
      }, 16);
      return () => clearTimeout(timeout);
    }
  }, [score, displayScore]);

  function getNewTransformedPieces() {
    const rotateMatrix = (m: number[][]) => m[0].map((_, i) => m.map(row => row[i]).reverse());
    return getRandomPieces().map(piece => {
      let newShape = [...piece.shape];
      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) newShape = rotateMatrix(newShape);
      return { ...piece, shape: newShape, id: `${piece.id}-${Math.random()}` };
    });
  }

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
      setShowPlusScore({ val: pointsToAdd, id: Date.now(), combo: totalLines > 1 });
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
        setShowPlusScore(null);
        updateAfterMove(newGrid, active.id.toString());
      }, 250);
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

  return (
    <div className="min-h-screen w-full bg-slate-800 flex flex-col items-center justify-center p-4 text-white select-none overflow-hidden relative font-sans">
      
      <div className="absolute top-6 left-6 opacity-30 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest font-black text-blue-300">Record</span>
        <div className="text-xl font-mono font-black">{highScore.toLocaleString()}</div>
      </div>

      {showPlusScore && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 z-[100] animate-bounce text-center pointer-events-none">
          <div className="text-6xl font-black text-yellow-400 drop-shadow-lg">+{showPlusScore.val}</div>
          {showPlusScore.combo && <div className="text-2xl font-bold text-orange-400 italic">COMBO!</div>}
        </div>
      )}

      {!gameStarted ? (
        <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500 text-center">
          <h1 className="text-7xl font-black italic leading-none mb-8 tracking-tighter drop-shadow-2xl">Elaeht<br/><span className="text-blue-400">Block</span></h1>
          <button 
            onClick={() => setGameStarted(true)} 
            className="px-24 py-6 bg-white text-slate-950 rounded-full font-black text-2xl shadow-xl active:scale-95 transition-all hover:bg-blue-50"
          >
            JUGAR
          </button>
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
          
          <header className="mb-6 text-center pointer-events-none">
            <div className="text-7xl font-mono font-black drop-shadow-xl">{displayScore.toLocaleString()}</div>
            <p className="text-blue-400 text-[10px] font-black tracking-[0.4em] uppercase opacity-50">Puntos</p>
          </header>

          <div className="bg-slate-900/60 p-2 rounded-[1.8rem] border border-white/5 shadow-2xl backdrop-blur-sm">
            <div className="grid grid-cols-8 gap-1 sm:gap-1.5">
              {grid.map((row, r) => row.map((cellColor, c) => {
                const isPreview = preview ? (r >= preview.r && r < preview.r + preview.shape.length && c >= preview.c && c < preview.c + preview.shape[0].length && preview.shape[r - preview.r][c - preview.c] === 1) : false;
                return <BoardCell key={`${r}-${c}`} r={r} c={c} color={cellColor} isPreview={isPreview} isInvalid={preview ? !preview.isValid : false} isClearing={clearingCells.some(cell => cell.r === r && cell.c === c)} />;
              }))}
            </div>
          </div>

          <PieceDock>
            {availablePieces.map(p => (
              <div key={p.id} className="flex-1 flex justify-center items-center">
                 <DraggablePiece {...p} />
              </div>
            ))}
          </PieceDock>

          <button onClick={() => setShowMenu(true)} className="absolute top-6 right-6 p-4 bg-white/5 rounded-2xl active:scale-90 z-50 border border-white/5">
              <div className="w-6 h-0.5 bg-white mb-1.5 rounded-full" />
              <div className="w-4 h-0.5 bg-white rounded-full ml-auto" />
          </button>

          {isGameOver && (
             <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[700] p-6 backdrop-blur-xl">
               <div className="text-center bg-slate-900 p-10 rounded-[3.5rem] border border-white/10 shadow-2xl w-full max-w-sm">
                 <h2 className="text-4xl font-black mb-2 italic text-red-500 uppercase">Perdiste</h2>
                 <div className="my-8 space-y-3">
                   <div className="bg-white/5 py-5 rounded-3xl border border-white/5">
                     <p className="text-xs uppercase font-black text-blue-400 tracking-widest mb-1">Puntaje Final</p>
                     <p className="text-6xl font-mono font-black">{score.toLocaleString()}</p>
                   </div>
                 </div>
                 <div className="flex flex-col gap-4">
                   <button onClick={resetGame} className="w-full py-5 bg-blue-600 rounded-3xl font-black text-xl shadow-lg active:scale-95">REINTENTAR</button>
                   <button onClick={quitGame} className="w-full py-4 bg-white/5 rounded-2xl font-bold text-slate-400 uppercase tracking-widest">Menú Principal</button>
                 </div>
               </div>
             </div>
          )}

          {showMenu && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[600] flex items-center justify-center p-6 animate-in fade-in">
                <div className="bg-slate-900 border border-white/10 w-full max-w-xs rounded-[2rem] p-8 flex flex-col gap-4 text-center">
                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Pausa</h3>
                    <button onClick={() => setIsMuted(!isMuted)} className="w-full py-4 bg-white/5 rounded-2xl font-bold">{isMuted ? '🔊 ACTIVAR SONIDO' : '🔇 SILENCIAR'}</button>
                    <button onClick={resetGame} className="w-full py-4 bg-white/5 rounded-2xl font-bold">REINTENTAR</button>
                    <button onClick={quitGame} className="w-full py-4 bg-blue-500/10 text-blue-400 rounded-2xl font-bold uppercase tracking-widest">Volver al Menú</button>
                    <button onClick={() => setShowMenu(false)} className="mt-4 text-slate-500 font-bold uppercase text-xs">Cerrar</button>
                </div>
            </div>
          )}
        </DndContext>
      )}
    </div>
  );
}
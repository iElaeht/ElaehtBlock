import { useState, useEffect, useCallback, useRef } from 'react';
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

// --- CONFIGURACIÓN DE SONIDOS ---
const SOUNDS = {
  place: '/sounds/place.mp3',
  clear: '/sounds/clear.mp3',
  gameOver: '/sounds/gameOver.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  bonus: '/sounds/bonus.mp3'
};

// --- COMPONENTES ---

function BoardCell({ r, c, color, isPreview, isInvalid, isClearing, previewColor }: any) {
  const { setNodeRef } = useDroppable({ id: `cell-${r}-${c}`, data: { r, c } });
  
  let bgClass = 'bg-slate-800/40 border-slate-700/30';
  
  if (isClearing) {
    bgClass = 'bg-white scale-0 rotate-90 shadow-[0_0_40px_#fff] z-10';
  } else if (color) {
    // Piezas fijas en el tablero
    bgClass = `${color} shadow-[0_0_15px_rgba(255,255,255,0.2)] border-white/20 scale-100 ring-1 ring-white/5`;
  } else if (isPreview) {
    // ESTA ES LA SOMBRA DE PREVISUALIZACIÓN QUE AJUSTAMOS:
    bgClass = isInvalid 
      ? 'bg-red-500/20 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-95' 
      // Aquí el cambio: más opacidad de color y brillo blanco (glow) en lugar de sombra oscura
      : `${previewColor} opacity-60 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-95 brightness-125`;
  }

  return (
    <div 
      ref={setNodeRef} 
      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-md transition-all duration-200 border ${bgClass}`} 
    />
  );
}

function DraggablePiece({ id, shape, color }: Piece) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = { 
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    touchAction: 'none' as const,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 999 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      <div className={`grid gap-1 ${isDragging ? 'scale-90' : 'hover:scale-105 transition-transform duration-200'}`}>
        {shape.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1">
            {row.map((cell, cIdx) => (
              <div 
                key={cIdx} 
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-sm ${cell ? `${color} border border-white/20 shadow-sm` : 'bg-transparent'}`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- APP PRINCIPAL ---

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<(string | null)[][]>(() => Array(8).fill(null).map(() => Array(8).fill(null)));
  const [availablePieces, setAvailablePieces] = useState(() => getNewTransformedPieces());
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [bgColor, setBgColor] = useState('bg-slate-950');
  const [isGameOver, setIsGameOver] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [clearingCells, setClearingCells] = useState<{r: number, c: number}[]>([]);
  const [showPlusScore, setShowPlusScore] = useState<{val: number, id: number} | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const lastBonusMilestone = useRef(0);

  const playSound = useCallback((soundUrl: string) => {
    if (isMuted) return;
    const audio = new Audio(soundUrl);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, [isMuted]);

  const startColors = ['bg-zinc-950', 'bg-red-950', 'bg-blue-950', 'bg-green-950', 'bg-orange-950', 'bg-purple-950', 'bg-teal-950', 'bg-rose-950'];

  const resetGame = () => {
    playSound(SOUNDS.click);
    setGrid(Array(8).fill(null).map(() => Array(8).fill(null)));
    setScore(0);
    setDisplayScore(0);
    setAvailablePieces(getNewTransformedPieces());
    setIsGameOver(false);
    lastBonusMilestone.current = 0;
  };

  const exitGame = () => {
    playSound(SOUNDS.click);
    setGameStarted(false);
    resetGame();
  };

  const startGame = () => {
    const randomColor = startColors[Math.floor(Math.random() * startColors.length)];
    setBgColor(randomColor);
    setGameStarted(true);
    playSound(SOUNDS.click);
  };

  useEffect(() => {
    if (displayScore < score) {
      const timeout = setTimeout(() => {
        const step = Math.ceil((score - displayScore) / 5);
        setDisplayScore(prev => Math.min(prev + step, score));
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [score, displayScore]);

  useEffect(() => {
    if (!gameStarted) return;
    const currentMilestone = Math.floor(score / 1000);
    if (currentMilestone > lastBonusMilestone.current) {
      playSound(SOUNDS.bonus);
      lastBonusMilestone.current = currentMilestone;
    }
    const levels = ['bg-indigo-950', 'bg-violet-950', 'bg-emerald-950', 'bg-amber-950', 'bg-fuchsia-950', 'bg-cyan-950'];
    if (score >= 1000) {
      const levelIndex = Math.min(currentMilestone - 1, levels.length - 1);
      setBgColor(levels[levelIndex]);
    }
  }, [score, gameStarted, playSound]);

  function getNewTransformedPieces() {
    const rotateMatrix = (m: number[][]) => m[0].map((_, i) => m.map(row => row[i]).reverse());
    const mirrorMatrix = (m: number[][]) => m.map(row => [...row].reverse());
    return getRandomPieces().map(piece => {
      let newShape = [...piece.shape];
      if (Math.random() > 0.5) newShape = mirrorMatrix(newShape);
      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) newShape = rotateMatrix(newShape);
      return { ...piece, shape: newShape };
    });
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    const currentPreview = preview;
    setPreview(null);

    if (currentPreview?.isValid) {
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

      if (rowsToClear.length > 0 || colsToClear.length > 0) {
        playSound(SOUNDS.clear);
        const pointsToAdd = (rowsToClear.length + colsToClear.length) * 150;
        setShowPlusScore({ val: pointsToAdd, id: Date.now() });
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
        }, 400);
      } else {
        setGrid(newGrid);
        updateAfterMove(newGrid, active.id.toString());
      }
      setScore(s => s + 10);
    }
  };

  const updateAfterMove = (newGrid: (string | null)[][], activeId: string) => {
    const remaining = availablePieces.filter(p => p.id.toString() !== activeId);
    const nextSet = remaining.length === 0 ? getNewTransformedPieces() : remaining;
    setAvailablePieces(nextSet);
    const canStillPlay = nextSet.some(p => {
      for (let r = 0; r <= 8 - p.shape.length; r++) {
        for (let c = 0; c <= 8 - p.shape[0].length; c++) {
          const check = (sr: number, sc: number, sh: number[][], g: (string|null)[][]) => {
            for (let i = 0; i < sh.length; i++) {
              for (let j = 0; j < sh[i].length; j++) {
                if (sh[i][j] === 1 && (sr+i >= 8 || sc+j >= 8 || g[sr+i][sc+j] !== null)) return false;
              }
            }
            return true;
          };
          if (check(r, c, p.shape, newGrid)) return true;
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
    <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center p-4 text-white select-none overflow-hidden relative transition-colors duration-1000`}>
      
      {gameStarted && (
        <div className="absolute top-6 right-6 flex gap-4 z-50">
          <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all border border-white/10">
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button onClick={resetGame} className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all border border-white/10" title="Reiniciar">
            🔄
          </button>
          <button onClick={exitGame} className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-full backdrop-blur-md transition-all border border-red-500/20" title="Salir">
            🚪
          </button>
        </div>
      )}

      {!gameStarted && (
        <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-slate-950 px-6 overflow-hidden">
          <div className="absolute top-1/4 -left-10 w-40 h-40 bg-blue-600/20 blur-[100px]" />
          <div className="absolute bottom-1/4 -right-10 w-40 h-40 bg-cyan-600/20 blur-[100px]" />
          <div className="relative text-center animate-in fade-in zoom-in duration-700">
            <h1 className="text-7xl font-black mb-2 tracking-tighter italic">Elaeht<span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Block</span></h1>
            <p className="text-slate-500 font-medium tracking-widest text-sm mb-12 uppercase">The Ultimate Puzzle Challenge</p>
            <button onClick={startGame} className="group relative px-16 py-5 bg-white text-slate-950 rounded-full font-black text-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
              PLAY
            </button>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={(e) => {
        const { over, active } = e;
        if (!over) { setPreview(null); return; }
        const piece = availablePieces.find(p => p.id.toString() === active.id.toString());
        if (!piece) return;
        const { r: dropR, c: dropC } = over.data.current as any;
        let startR = Math.max(0, Math.min(dropR - Math.floor(piece.shape.length / 2), 8 - piece.shape.length));
        let startC = Math.max(0, Math.min(dropC - Math.floor(piece.shape[0].length / 2), 8 - piece.shape[0].length));
        const isValid = (() => {
          for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
              if (piece.shape[r][c] === 1 && (startR + r >= 8 || startC + c >= 8 || grid[startR + r][startC + c] !== null)) return false;
            }
          }
          return true;
        })();
        setPreview({ r: startR, c: startC, shape: piece.shape, color: piece.color, isValid });
      }} onDragEnd={handleDragEnd}>
        
        {showPlusScore && (
          <div key={showPlusScore.id} className="fixed top-1/3 z-[150] animate-bounce text-6xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
            +{showPlusScore.val}
          </div>
        )}

        <header className="mb-6 text-center">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent tracking-widest">ELAEHT BLOCK</h1>
          <div className="text-5xl font-mono font-extrabold text-white tabular-nums drop-shadow-md">{displayScore.toLocaleString()}</div>
          <div className="text-xs text-slate-400 uppercase tracking-[0.3em] mt-1">Points</div>
        </header>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="grid grid-cols-8 gap-1.5">
            {grid.map((row, r) => row.map((cellColor, c) => {
              const isPreview = preview ? (r >= preview.r && r < preview.r + preview.shape.length && c >= preview.c && c < preview.c + preview.shape[0].length && preview.shape[r - preview.r][c - preview.c] === 1) : false;
              return <BoardCell key={`${r}-${c}`} r={r} c={c} color={cellColor} isPreview={isPreview} previewColor={preview?.color} isInvalid={preview ? !preview.isValid : false} isClearing={clearingCells.some(cell => cell.r === r && cell.c === c)} />;
            }))}
          </div>
        </div>

        <div className="mt-10 flex gap-8 p-10 bg-white/5 rounded-[2.5rem] min-h-[160px] items-center border border-white/5 shadow-inner backdrop-blur-sm">
          {availablePieces.map(p => <DraggablePiece key={p.id.toString()} {...p} />)}
        </div>

        {isGameOver && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[200] p-6 animate-in fade-in duration-500">
            <div className="bg-slate-900 border border-white/10 p-12 rounded-[3rem] text-center shadow-2xl max-w-xs w-full animate-in zoom-in-95 duration-500">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-black text-white mb-2">¡Buen Juego!</h2>
              <p className="text-slate-400 text-lg mb-8">Lograste {score} puntos</p>
              <button onClick={resetGame} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:scale-105 active:scale-95 transition-all mb-4">
                Reintentar
              </button>
              <button onClick={exitGame} className="w-full py-3 bg-transparent text-slate-500 hover:text-white transition-colors font-semibold">
                Volver al Menú
              </button>
            </div>
          </div>
        )}
      </DndContext>
    </div>
  );
}
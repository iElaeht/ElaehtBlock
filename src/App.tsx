import { useState, useEffect, useCallback, memo, useMemo } from "react";
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
} from "@dnd-kit/core";
import { getRandomPieces, type Piece } from "./logic/pieces";

// --- ESTILOS DE ANIMACIÓN Y OPTIMIZACIÓN CSS ---
const animationStyles = `
  @keyframes fadeOutUp {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-40px) scale(0.9); }
  }
  .animate-fade-out-up { animation: fadeOutUp 1.2s ease-out forwards; }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .animate-shake { animation: shake 0.2s ease-in-out; }

  .no-select { 
    -webkit-tap-highlight-color: transparent; 
    user-select: none; 
  }

  .dragging-active {
    cursor: grabbing !important;
    will-change: transform;
    pointer-events: none;
  }
`;

// PALETA DE COLORES MINIMALISTAS PARA MODO RENDIMIENTO (CÁLIDOS MATE)
const PERFORMANCE_COLORS: Record<string, string> = {
  "bg-blue-600": "bg-blue-500",
  "bg-emerald-600": "bg-emerald-500",
  "bg-red-600": "bg-red-500",
  "bg-purple-600": "bg-purple-500",
  "bg-orange-600": "bg-orange-500",
  "bg-cyan-600": "bg-cyan-500",
  "bg-pink-600": "bg-pink-500",
  "bg-indigo-600": "bg-indigo-500",
};

// PALETA DE PIEZAS CORREGIDA: TONOS CÁLIDOS MATE, DESATURADOS Y SEGUROS (CRISTAL ESMERILADO)
const PIECE_COLORS: Record<string, string> = {
  "bg-blue-600": "bg-[#7FB3D5]", // Azul Acero Suave
  "bg-emerald-600": "bg-[#73C6B6]", // Verde Jade Mate
  "bg-red-600": "bg-[#E59866]", // Terracota Suave
  "bg-purple-600": "bg-[#BB8FCE]", // Lavanda Grisáceo
  "bg-orange-600": "bg-[#F8C471]", // Arena Tostada
  "bg-cyan-600": "bg-[#83D0C9]", // Turquesa Mate
  "bg-pink-600": "bg-[#F1948A]", // Coral Suave
  "bg-indigo-600": "bg-[#85C1E9]", // Celeste Grisáceo
};

const SOUNDS = {
  place: "/sounds/place.mp3",
  clear: "/sounds/clear.mp3",
  gameOver: "/sounds/gameOver.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
};

// --- NUEVOS TEMAS: GRADIENTES MINIMALISTAS CÁLIDOS, RICOS Y CÓMODOS (v3.8) ---
const THEMES = [
  // De Terracota a Cobre Suave
  {
    id: "terracotta",
    bg: "bg-gradient-to-br from-[#7B3F00] via-[#854E15] to-[#9A6038]",
    text: "text-white/90",
    accent: "bg-white/90 !text-[#7B3F00]",
    accentText: "text-[#7B3F00]",
  },
  // De Ocre Profundo a Arena Tostada
  {
    id: "ochre",
    bg: "bg-gradient-to-br from-[#8A6632] via-[#A67C4A] to-[#C39A68]",
    text: "text-white/90",
    accent: "bg-white/90 !text-[#8A6632]",
    accentText: "text-[#8A6632]",
  },
  // De Sombra Quemada a Óxido Suave
  {
    id: "rust",
    bg: "bg-gradient-to-br from-[#5D4037] via-[#795548] to-[#9A7363]",
    text: "text-white/90",
    accent: "bg-white/90 !text-[#5D4037]",
    accentText: "text-[#5D4037]",
  },
  // De Oria Profundo a Oro Viejo
  {
    id: "gold",
    bg: "bg-gradient-to-br from-[#6A4F23] via-[#856C3B] to-[#A08853]",
    text: "text-white/90",
    accent: "bg-white/90 !text-[#6A4F23]",
    accentText: "text-[#6A4F23]",
  },
  // De Granate Suave a Rosa Polvoriento
  {
    id: "maroon",
    bg: "bg-gradient-to-br from-[#6D4242] via-[#855D5D] to-[#9E7878]",
    text: "text-white/90",
    accent: "bg-white/90 !text-[#6D4242]",
    accentText: "text-[#6D4242]",
  },
];

// --- COMPONENTES OPTIMIZADOS ---

const BoardCell = memo(
  ({ r, c, color, isPreview, isInvalid, performanceMode }: any) => {
    const { setNodeRef } = useDroppable({
      id: `cell-${r}-${c}`,
      data: { r, c },
    });

    const cellState = useMemo(() => {
      if (color) {
        const activeColor = performanceMode
          ? PERFORMANCE_COLORS[color] || color
          : PIECE_COLORS[color] || color;
        // Resaltado notable con borde blanco transparente (estilo cristal)
        return `${activeColor} border-white/40 ring-1 ring-white/10 ${performanceMode ? "" : "shadow-sm"}`;
      }
      if (isPreview) {
        if (isInvalid) return "bg-red-500/40 border-red-300/50";
        const previewOpacity = performanceMode ? "bg-white/10" : "bg-white/20";
        return `${previewOpacity} border-white/60 border-2 z-10 ${performanceMode ? "" : "scale-105"}`;
      }
      // Fondo de celda suave y adaptable (cristal esmerilado)
      return `bg-white/10 border-white/5`;
    }, [color, isPreview, isInvalid, performanceMode]);

    return (
      <div
        ref={setNodeRef}
        className={`aspect-square w-full rounded-lg border ${cellState}`}
      />
    );
  },
);

const DraggablePiece = memo(
  ({ id, shape, color, isOverlay = false, performanceMode }: any) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({ id });

    const activeColor = useMemo(() => {
      return performanceMode
        ? PERFORMANCE_COLORS[color] || color
        : PIECE_COLORS[color] || color;
    }, [color, performanceMode]);

    const style = {
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y - (isOverlay ? 60 : 0)}px, 0) scale(${isOverlay ? 0.95 : 0.75})`
        : "scale(0.75)",
      opacity: isDragging && !isOverlay ? 0 : 1,
      touchAction: "none" as const,
      zIndex: isOverlay ? 1000 : 1,
      transition:
        performanceMode || isOverlay
          ? "none"
          : "transform 0.2s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s ease",
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`cursor-grab active:cursor-grabbing origin-center touch-none ${isOverlay ? "dragging-active" : ""}`}
      >
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}
        >
          {shape.map((row: any[], rIdx: number) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`w-[4.5vw] h-[4.5vw] max-w-[16px] max-h-[16px] rounded-sm ${cell ? `${activeColor} border border-white/40 shadow-sm ring-1 ring-white/10` : "bg-transparent"}`}
              />
            )),
          )}
        </div>
      </div>
    );
  },
);

const PieceDock = ({ children, performanceMode }: any) => {
  const { setNodeRef } = useDroppable({ id: "piece-dock" });
  return (
    <div
      ref={setNodeRef}
      className={`w-full max-w-[320px] h-28 flex justify-around items-center bg-white/15 rounded-[1.4rem] border border-white/10 relative mb-6 ${performanceMode ? "" : "backdrop-blur-md shadow-xl"}`}
    >
      {children}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<(string | null)[][]>(() =>
    Array(8)
      .fill(null)
      .map(() => Array(8).fill(null)),
  );
  const [availablePieces, setAvailablePieces] = useState<Piece[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("user-highscore")) || 0,
  );
  const [displayScore, setDisplayScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [lastBonus, setLastBonus] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [themeIndex, setThemeIndex] = useState(() =>
    Math.floor(Math.random() * THEMES.length),
  );
  const [performanceMode, setPerformanceMode] = useState(
    () => localStorage.getItem("performance-mode") === "true",
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
  );

  const playSound = useCallback(
    (url: string) => {
      if (isMuted) return;
      const audio = new Audio(url);
      audio.volume = 0.1;
      audio.play().catch(() => {});
    },
    [isMuted],
  );

  const changeTheme = useCallback(() => {
    setThemeIndex(Math.floor(Math.random() * THEMES.length));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 400);
          return 100;
        }
        return p + 5;
      });
    }, 20);
    setAvailablePieces(getNewTransformedPieces());
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("performance-mode", performanceMode.toString());
  }, [performanceMode]);

  useEffect(() => {
    if (score > highScore && score > 0) {
      setHighScore(score);
      localStorage.setItem("user-highscore", score.toString());
    }
  }, [score, highScore]);

  const forceDeleteRecord = useCallback(() => {
    playSound(SOUNDS.click);
    localStorage.removeItem("user-highscore");
    setHighScore(0);
    setConfirmDelete(false);
  }, [playSound]);

  useEffect(() => {
    if (displayScore < score) {
      if (performanceMode) setDisplayScore(score);
      else {
        const timeout = setTimeout(
          () => setDisplayScore((p) => Math.min(p + 35, score)),
          5,
        );
        return () => clearTimeout(timeout);
      }
    } else if (displayScore > score) setDisplayScore(score);
  }, [score, displayScore, performanceMode]);

  function getNewTransformedPieces() {
    return getRandomPieces().map((p) => {
      let currentShape = p.shape;
      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) {
        currentShape = currentShape[0].map((_, index) =>
          currentShape.map((row) => row[index]).reverse(),
        );
      }
      return {
        ...p,
        id: `p-${Math.random()}`,
        shape: currentShape,
        color: p.color,
      };
    });
  }

  const handleReset = useCallback(() => {
    playSound(SOUNDS.click);
    setGrid(
      Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    );
    setScore(0);
    setDisplayScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLinesCleared(0);
    setLastBonus(null);
    setAvailablePieces(getNewTransformedPieces());
    setIsGameOver(false);
    setShowMenu(false);
    setConfirmDelete(false);
    changeTheme(); // Cambiar gradiente cálido al reiniciar
  }, [playSound, changeTheme]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    const currentPreview = preview;
    setActiveId(null);
    setPreview(null);

    if (!over || over.id === "piece-dock" || !currentPreview?.isValid) return;

    playSound(SOUNDS.place);
    const newGrid = grid.map((row) => [...row]);
    currentPreview.shape.forEach((row: any[], pr: number) => {
      row.forEach((cell, pc) => {
        if (cell === 1)
          newGrid[currentPreview.r + pr][currentPreview.c + pc] =
            currentPreview.color;
      });
    });

    let rClear = [],
      cClear = [];
    for (let r = 0; r < 8; r++)
      if (newGrid[r].every((v) => v !== null)) rClear.push(r);
    for (let c = 0; c < 8; c++)
      if (newGrid.every((r) => r[c] !== null)) cClear.push(c);

    if (rClear.length > 0 || cClear.length > 0) {
      rClear.forEach((r) => newGrid[r].fill(null));
      cClear.forEach((c) => newGrid.forEach((r) => (r[c] = null)));
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setLinesCleared((prev) => prev + rClear.length + cClear.length);
      const bonus = (rClear.length + cClear.length) * 150 * newCombo;
      setLastBonus(bonus);
      playSound(SOUNDS.clear);
      setScore((s) => s + bonus);
      changeTheme();
      setTimeout(() => setLastBonus(null), 1200);
    } else {
      setCombo(0);
      setScore((s) => s + 20);
    }

    setGrid(newGrid);
    const remaining = availablePieces.filter((p) => p.id !== active.id);
    const nextSet =
      remaining.length === 0 ? getNewTransformedPieces() : remaining;
    setAvailablePieces(nextSet);

    const canPlaceAny = nextSet.some((p) => {
      for (let r = 0; r <= 8 - p.shape.length; r++) {
        for (let c = 0; c <= 8 - p.shape[0].length; c++) {
          let fits = true;
          for (let i = 0; i < p.shape.length; i++)
            for (let j = 0; j < p.shape[i].length; j++)
              if (p.shape[i][j] && newGrid[r + i][c + j]) fits = false;
          if (fits) return true;
        }
      }
      return false;
    });
    if (!canPlaceAny) {
      setIsGameOver(true);
      playSound(SOUNDS.gameOver);
    }
  };

  const currentTheme = THEMES[themeIndex];

  if (isLoading)
    return (
      <div className="h-[100dvh] bg-[#3E2723] flex flex-col items-center justify-center p-8 no-select">
        <style>{animationStyles}</style>
        <h1 className="text-white text-4xl font-black italic tracking-tighter uppercase opacity-80 animate-pulse">
          AI BLOCK
        </h1>
        <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden mt-12">
          <div
            className="h-full bg-white shadow-[0_0_15px_white]"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      </div>
    );

  return (
    <div
      className={`h-[100dvh] w-full ${currentTheme.bg} flex flex-col items-center justify-between pb-6 pt-16 px-4 transition-colors duration-1000 overflow-hidden no-select`}
    >
      <style>{animationStyles}</style>

      <div className="w-full flex justify-between items-center max-w-[320px] z-20 mt-4 px-2">
        <div
          className={`bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 ${performanceMode ? "" : "backdrop-blur-md"}`}
        >
          <p className="text-[8px] font-black uppercase text-white/50 mb-1 leading-none">
            Récord
          </p>
          <p className="font-mono font-bold text-white text-base leading-none">
            {highScore}
          </p>
        </div>
        <button
          onClick={() => {
            playSound(SOUNDS.click);
            setShowMenu(true);
            setConfirmDelete(false);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/20 active:scale-90 shadow-lg`}
        >
          <span className={`text-lg text-white/90`}>≡</span>
        </button>
      </div>

      {!gameStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-33">
          <h1
            className={`text-6xl font-black italic tracking-tighter ${currentTheme.text} leading-[0.85] drop-shadow-lg`}
          >
            AI BLOCK
          </h1>
          <button
            onClick={() => {
              playSound(SOUNDS.click);
              setGameStarted(true);
            }}
            className={`px-20 py-6 ${currentTheme.accent} font-black rounded-[2rem] shadow-2xl active:scale-95 transition-all text-xs tracking-[0.5em] uppercase`}
          >
            Jugar
          </button>
          <p
            className={`text-[11px] ${currentTheme.text} opacity-50 font-bold tracking-[0.4em] uppercase`}
          >
            V 3.8 || ELAEHTDEV
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => {
            setActiveId(e.active.id as string);
            playSound(SOUNDS.click);
          }}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => {
            const { over, active } = e;
            if (!over || over.id === "piece-dock") {
              if (preview) setPreview(null);
              return;
            }
            const piece = availablePieces.find((p) => p.id === active.id);
            if (!piece || !over.data.current) return;
            const { r: dR, c: dC } = over.data.current as any;
            let sR = Math.max(
              0,
              Math.min(
                dR - Math.floor(piece.shape.length / 2),
                8 - piece.shape.length,
              ),
            );
            let sC = Math.max(
              0,
              Math.min(
                dC - Math.floor(piece.shape[0].length / 2),
                8 - piece.shape[0].length,
              ),
            );
            if (!preview || preview.r !== sR || preview.c !== sC) {
              let valid = true;
              for (let i = 0; i < piece.shape.length; i++)
                for (let j = 0; j < piece.shape[i].length; j++)
                  if (piece.shape[i][j] && grid[sR + i][sC + j]) valid = false;
              setPreview({
                r: sR,
                c: sC,
                shape: piece.shape,
                color: piece.color,
                isValid: valid,
              });
            }
          }}
        >
          <header className="flex items-center justify-center gap-4 py-2 relative w-full max-w-[400px]">
            <h2
              className={`text-[18vw] sm:text-6xl font-black ${currentTheme.text} tracking-tighter font-mono drop-shadow-md leading-none`}
            >
              {displayScore}
            </h2>
            <div className="absolute left-[70%] top-0 flex flex-col gap-1 pointer-events-none w-max">
              {lastBonus && combo > 1 && (
                <div className="bg-yellow-400 text-black text-[12px] px-3 py-1 rounded-lg font-black animate-fade-out-up shadow-xl border-2 border-black/10 flex items-center gap-1">
                  X{combo}
                </div>
              )}
              {lastBonus && (
                <div
                  className={`text-white text-xl sm:text-3xl font-black animate-fade-out-up drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]`}
                >
                  +{lastBonus}
                </div>
              )}
            </div>
          </header>

          <div
            className={`w-[88vw] max-w-[320px] p-3 rounded-[1.3rem] bg-white/15 border border-white/10 ${performanceMode ? "" : "shadow-2xl backdrop-blur-sm"}`}
          >
            <div className="grid grid-cols-8 gap-1">
              {grid.map((row, r) =>
                row.map((cellColor, c) => (
                  <BoardCell
                    key={`${r}-${c}`}
                    r={r}
                    c={c}
                    color={cellColor}
                    performanceMode={performanceMode}
                    isPreview={
                      preview &&
                      r >= preview.r &&
                      r < preview.r + preview.shape.length &&
                      c >= preview.c &&
                      c < preview.c + preview.shape[0].length &&
                      preview.shape[r - preview.r][c - preview.c]
                    }
                    isInvalid={preview && !preview.isValid}
                  />
                )),
              )}
            </div>
          </div>

          <PieceDock performanceMode={performanceMode}>
            {availablePieces.map((p) => (
              <DraggablePiece
                key={p.id}
                {...p}
                performanceMode={performanceMode}
              />
            ))}
          </PieceDock>

          <DragOverlay dropAnimation={null}>
            {activeId ? (
              <DraggablePiece
                id={activeId}
                shape={availablePieces.find((p) => p.id === activeId)?.shape}
                color={availablePieces.find((p) => p.id === activeId)?.color}
                isOverlay
                performanceMode={performanceMode}
              />
            ) : null}
          </DragOverlay>

          {isGameOver && (
            <div
              className={`fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md`}
            >
              <div
                className={`bg-white rounded-[3rem] p-10 text-center w-full max-w-[310px] shadow-2xl border border-stone-200 relative overflow-hidden`}
              >
                <p className="text-[11px] font-black uppercase opacity-30 tracking-[0.4em] mb-2">
                  Resultado
                </p>
                <div className="text-6xl font-black mb-8 text-stone-900 tracking-tighter font-mono">
                  {score}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8 border-y border-stone-100 py-4">
                  <div className="text-left">
                    <p className="text-[9px] font-bold uppercase opacity-40">
                      Récord
                    </p>
                    <p className="font-mono font-bold text-stone-800 text-base">
                      {highScore}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase opacity-40">
                      Estado
                    </p>
                    <p className="font-black text-emerald-600 text-[9px] uppercase">
                      Guardado
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="w-full py-5 rounded-2xl bg-stone-900 text-white font-black text-[10px] tracking-widest active:scale-95 transition-all uppercase shadow-xl"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
        </DndContext>
      )}

      {showMenu && (
        <div
          className={`fixed inset-0 z-[200] flex items-center justify-center p-8 transition-all ${performanceMode ? "bg-black/60" : "bg-black/80 backdrop-blur-2xl"}`}
        >
          <div className="w-full max-w-[280px] flex flex-col">
            <div className="mb-6 text-center">
              <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                AJUSTES
              </h3>
              <div className="flex justify-center gap-4 mt-4 border-y border-white/10 py-4">
                <div className="text-center">
                  <p className="text-[7px] font-black text-white/40 uppercase mb-1">
                    Líneas
                  </p>
                  <p className="text-xl font-mono font-bold text-white leading-none">
                    {linesCleared}
                  </p>
                </div>
                <div className="w-[1px] bg-white/10"></div>
                <div className="text-center">
                  <p className="text-[7px] font-black text-white/40 uppercase mb-1">
                    Combo Máx
                  </p>
                  <p className="text-xl font-mono font-bold text-yellow-400 leading-none">
                    X{maxCombo}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  playSound(SOUNDS.click);
                  setPerformanceMode(!performanceMode);
                }}
                className={`w-full py-4 rounded-xl border font-bold flex justify-between px-6 items-center text-[8px] tracking-widest uppercase transition-all
                  ${performanceMode ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
              >
                Rendimiento <span>{performanceMode ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (isMuted) {
                    const a = new Audio(SOUNDS.click);
                    a.volume = 0.1;
                    a.play();
                  }
                }}
                className="w-full py-4 bg-white/5 rounded-xl border border-white/10 font-bold flex justify-between px-6 items-center text-[8px] text-white tracking-widest uppercase hover:bg-white/10"
              >
                Sonido <span>{isMuted ? "OFF" : "ON"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleReset}
                  className="py-4 bg-white/5 rounded-xl border border-white/10 font-bold text-[8px] text-white tracking-widest uppercase hover:bg-white/10"
                >
                  Reiniciar
                </button>
                <button
                  onClick={() => {
                    playSound(SOUNDS.click);
                    setGameStarted(false);
                    setShowMenu(false);
                  }}
                  className="py-4 bg-white/5 rounded-xl border border-white/10 font-bold text-[8px] text-white tracking-widest uppercase hover:bg-white/10"
                >
                  Salir
                </button>
              </div>

              <div className="pt-4">
                {!confirmDelete ? (
                  <button
                    onClick={() => {
                      playSound(SOUNDS.click);
                      setConfirmDelete(true);
                    }}
                    className="w-full py-3 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 font-black text-[8px] tracking-widest uppercase"
                  >
                    Borrar Récord
                  </button>
                ) : (
                  <div className="flex gap-2 animate-shake">
                    <button
                      onClick={forceDeleteRecord}
                      className="flex-1 py-3 bg-red-600 text-white rounded-lg font-black text-[8px] uppercase"
                    >
                      Si, Borrar
                    </button>
                    <button
                      onClick={() => {
                        playSound(SOUNDS.click);
                        setConfirmDelete(false);
                      }}
                      className="flex-1 py-3 bg-white/10 text-white rounded-lg font-black text-[8px] uppercase"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                playSound(SOUNDS.click);
                setShowMenu(false);
              }}
              className={`w-full py-5 rounded-2xl bg-white ${currentTheme.accentText} font-black text-[10px] tracking-[0.4em] shadow-xl mt-6 uppercase active:scale-95 transition-transform`}
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

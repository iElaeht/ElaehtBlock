/* src/App.tsx */
import { useState, useCallback, useMemo, useRef } from "react";
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  closestCenter, 
  DragOverlay,
  type DragEndEvent, 
  type DragOverEvent,
  type Modifier
} from "@dnd-kit/core";
import { AnimatePresence } from "framer-motion";
import { snapCenterToCursor } from "@dnd-kit/modifiers";

// Lógica y Constantes
import { SOUNDS } from "./logic/constants";

// Componentes
import { Board } from "./components/Board";
import { PieceDock } from "./components/PieceDock";
import { DraggablePiece } from "./components/DraggablePiece";
import { GameHeader } from "./components/GameHeader";
import { GameOverModal } from "./components/GameOverModal";
import { SettingsMenu } from "./components/SettingsMenu";
import { LoadingScreen } from "./components/LoadingScreen";
import { StartMenu } from "./components/StartMenu";
import { GameLayout } from "./components/Layout/GameLayout";
import { GameBackground } from "./components/GameBackground";

// Hooks
import { useGameLogic } from "./hooks/useGameLogic";
import { useAudio } from "./hooks/useAudio";
import { useTheme } from "./hooks/useTheme";
import { useCoins } from "./hooks/useCoins";

// Tipos
import { type PreviewData } from "./types";

export default function App() {
  const { theme, performanceMode, changeTheme, togglePerformance } = useTheme();
  const { playSound, isMuted, toggleMute } = useAudio();
  const { coins, addCoins, spendCoins } = useCoins(); 
  const game = useGameLogic(playSound, changeTheme, addCoins, spendCoins, performanceMode);

  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);

  const lastCellRef = useRef<{r: number, c: number} | null>(null);

  // SENSORES: Optimizado para evitar lag en el primer toque
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // Un poco más de margen para evitar drags accidentales al hacer scroll
    })
  );

  // MODIFICADOR: Centrado inteligente para estilo Neón
  // Elevamos la pieza solo 20px para que el dedo no tape el "holograma"
  const smartCenterModifier: Modifier = useCallback(({ transform }) => {
    return {
      ...transform,
      x: transform.x,
      y: transform.y - 20, 
    };
  }, []);

  // LÓGICA DE PREVIEW: Corregida para centrar la pieza en el cursor
  const handleDragOver = useCallback((e: DragOverEvent) => {
    const { over, active } = e;
    
    if (!over || over.id === "piece-dock") {
      if (lastCellRef.current) {
        lastCellRef.current = null;
        setPreview(null);
      }
      return;
    }

    const { r: dR, c: dC } = over.data.current as { r: number; c: number };

    // Solo recalcular si cambiamos de celda real (Optimización de CPU)
    if (lastCellRef.current?.r === dR && lastCellRef.current?.c === dC) return;
    lastCellRef.current = { r: dR, c: dC };

    const piece = game.availablePieces.find((p) => p.id === active.id);
    if (!piece) return;

    // Centramos el preview restando la mitad de la forma de la pieza
    const offsetR = Math.floor(piece.shape.length / 2);
    const offsetC = Math.floor(piece.shape[0].length / 2);

    // Limitamos la posición para que no se salga del grid 8x8
    const sR = Math.max(0, Math.min(dR - offsetR, 8 - piece.shape.length));
    const sC = Math.max(0, Math.min(dC - offsetC, 8 - piece.shape[0].length));

    // Validación de colisión ultra-rápida
    const isValid = !piece.shape.some((row, i) =>
      row.some((cell, j) => {
        if (!cell) return false;
        const gridRow = game.grid[sR + i];
        return gridRow && gridRow[sC + j] !== null;
      })
    );

    setPreview({ 
      r: sR, 
      c: sC, 
      shape: piece.shape, 
      color: piece.color, 
      isValid 
    });
  }, [game.availablePieces, game.grid]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active } = event;
    if (preview?.isValid) {
      game.placePiece(preview, active.id as string);
      playSound(SOUNDS.place); // Sonido de feedback al colocar
    }
    setActiveId(null);
    setPreview(null);
    lastCellRef.current = null;
  }, [preview, game, playSound]);

  const activePiece = useMemo(() => 
    game.availablePieces.find(p => p.id === activeId), 
  [game.availablePieces, activeId]);

  if (isLoading) return <LoadingScreen onFinished={() => setIsLoading(false)} />;

  return (
    <GameLayout>
      <GameBackground themeBg={theme.bg} themeId={theme.id} />
      
      <div className="relative w-full h-full no-select overflow-hidden z-10 bg-transparent transform-gpu">
        <AnimatePresence mode="wait">
          {!gameStarted ? (
            <StartMenu 
              key="start-menu"
              coins={coins}
              playSound={playSound}
              onPlay={() => { playSound(SOUNDS.click); setGameStarted(true); }}
              onOpenSettings={() => { playSound(SOUNDS.click); setShowMenu(true); }}
              isOpen={showMenu}
            />
          ) : (
            <DndContext 
              key="game-context"
              sensors={sensors} 
              collisionDetection={closestCenter}
              onDragStart={(e) => {
                setActiveId(e.active.id as string);
                playSound(SOUNDS.click);
              }}
              onDragOver={handleDragOver} 
              onDragEnd={handleDragEnd}
            >
              <div className="h-full w-full flex flex-col justify-between py-2 sm:py-6 relative">
                <GameHeader 
                  score={game.score}
                  displayScore={game.displayScore}
                  highScore={game.highScore}
                  coins={coins} 
                  lastBonus={game.lastBonus} 
                  combo={game.combo} 
                  theme={theme}
                  showMenu={showMenu}
                  onOpenMenu={() => { playSound(SOUNDS.click); setShowMenu(true); }}
                />

                <div className="flex-1 flex items-center justify-center">
                  <Board 
                    grid={game.grid} 
                    preview={preview} 
                    performanceMode={performanceMode} 
                    currentThemeId={theme.id}
                  />
                </div>

                <div className="w-full pb-4">
                  <PieceDock performanceMode={performanceMode}>
                    {game.availablePieces.map((p) => (
                      <DraggablePiece key={p.id} {...p} performanceMode={performanceMode} />
                    ))}
                  </PieceDock>
                </div>
              </div>

              {/* OVERLAY: Escala 1:1 con el dedo para precisión táctil */}
              <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor, smartCenterModifier]}>
                {activePiece && (
                  <div className="pointer-events-none touch-none scale-[0.85] origin-center will-change-transform">
                    <DraggablePiece 
                      id={activePiece.id} 
                      isOverlay 
                      performanceMode={performanceMode}
                      shape={activePiece.shape}
                      color={activePiece.color}
                    />
                  </div>
                )}
              </DragOverlay>

              <AnimatePresence>
                {game.isGameOver && (
                  <GameOverModal 
                    score={game.score} 
                    highScore={game.highScore} 
                    earnedCoins={game.earnedInSession}
                    totalCoins={coins}
                    onReset={() => { playSound(SOUNDS.click); game.resetGame(false); }} 
                    onRetry={() => { playSound(SOUNDS.click); game.resetGame(true); }} 
                    onBackToMenu={() => { 
                      playSound(SOUNDS.click); 
                      setGameStarted(false); 
                      game.resetGame(false); 
                    }}
                    canAffordRetry={coins >= 350}
                  />
                )}
              </AnimatePresence>
            </DndContext>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMenu && (
            <SettingsMenu 
              performanceMode={performanceMode}
              isMuted={isMuted}
              onTogglePerformance={togglePerformance}
              onToggleMute={toggleMute}
              onResetGame={() => { 
                playSound(SOUNDS.click); 
                game.resetGame(false); 
                setShowMenu(false); 
              }}
              onExit={() => { 
                playSound(SOUNDS.click); 
                setGameStarted(false); 
                setShowMenu(false); 
              }}
              onClose={() => { 
                playSound(SOUNDS.click); 
                setShowMenu(false); 
              }}
              onClearRecord={() => {
                localStorage.removeItem("ai-block-highscore");
                window.location.reload();
              }}
              linesCleared={game.linesCleared}
              maxCombo={game.maxCombo}
              coins={coins}
            />
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
}
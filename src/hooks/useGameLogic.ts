import { useState, useCallback, useEffect } from "react";
import { getRandomPieces } from "../logic/pieces";
import { type Piece, type PreviewData } from "../types";

// Importamos las constantes de sonido centrales para mantener consistencia
import { SOUNDS } from "../logic/constants";

export const useGameLogic = (
  playSound: (url: string) => void,
  changeTheme: (lines: number) => void, 
  addCoins: (amount: number) => void,
  spendCoins: (amount: number) => boolean
) => {
  // --- 1. GENERACIÓN DE PIEZAS ---
  const getNewTransformedPieces = useCallback(() => {
    const rawPieces = getRandomPieces();
    const timestamp = Date.now();
    
    return rawPieces.map((p, idx) => {
      let currentShape = p.shape;
      // No rotar si es un cuadrado perfecto lleno
      const isSquare = currentShape.length === currentShape[0].length && 
                       currentShape.flat().every(cell => cell === 1);

      if (!isSquare && Math.random() > 0.3) { 
        const rotations = Math.floor(Math.random() * 4);
        for (let i = 0; i < rotations; i++) {
          currentShape = currentShape[0].map((_, index) =>
            currentShape.map((row) => row[index]).reverse()
          );
        }
      }
      return { ...p, id: `pc-${timestamp}-${idx}`, shape: currentShape };
    });
  }, []);

  // --- 2. ESTADOS ---
  const [grid, setGrid] = useState<(string | null)[][]>(() =>
    Array(8).fill(null).map(() => Array(8).fill(null))
  );
  const [availablePieces, setAvailablePieces] = useState<Piece[]>(() => getNewTransformedPieces());
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem("ai-block-highscore")) || 0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [lastBonus, setLastBonus] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [earnedInSession, setEarnedInSession] = useState(0);

  // --- 3. EFECTOS ---
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      if (displayScore < score) {
        const diff = score - displayScore;
        const step = diff > 100 ? Math.ceil(diff / 8) : 1;
        setDisplayScore(prev => prev + step);
        animationFrame = requestAnimationFrame(animate);
      } else if (displayScore > score) {
        setDisplayScore(score);
      }
    };
    if (displayScore !== score) animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [score, displayScore]);

  useEffect(() => {
    localStorage.setItem("ai-block-highscore", highScore.toString());
  }, [highScore]);

  // --- 4. VALIDACIÓN DE POSICIÓN ---
  const canPlacePiece = useCallback((piece: Piece, currentGrid: (string | null)[][]) => {
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;

    for (let r = 0; r <= 8 - rows; r++) {
      for (let c = 0; c <= 8 - cols; c++) {
        let fits = true;
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (piece.shape[i][j] === 1 && currentGrid[r + i][c + j] !== null) {
              fits = false; break;
            }
          }
          if (!fits) break;
        }
        if (fits) return true;
      }
    }
    return false;
  }, []);

  // --- 5. LÓGICA DE COLOCACIÓN (Sincronizada con App.tsx) ---
  const placePiece = useCallback((preview: PreviewData, activeId: string) => {
    const { shape, r: startR, c: startC, color } = preview;

    // Validación de límites estricta 8x8
    if (startR < 0 || startC < 0 || startR + shape.length > 8 || startC + shape[0].length > 8) return;

    const newGrid = grid.map(row => [...row]);
    
    // Colocación
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          newGrid[startR + i][startC + j] = color;
        }
      }
    }

    // Detección de líneas
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let i = 0; i < 8; i++) {
      if (newGrid[i].every(cell => cell !== null)) rowsToClear.push(i);
      let colFull = true;
      for (let j = 0; j < 8; j++) {
        if (newGrid[j][i] === null) { colFull = false; break; }
      }
      if (colFull) colsToClear.push(i);
    }

    const lines = rowsToClear.length + colsToClear.length;
    let nextScore = score;

    if (lines > 0) {
      rowsToClear.forEach(r => newGrid[r].fill(null));
      colsToClear.forEach(c => {
        for (let i = 0; i < 8; i++) newGrid[i][c] = null;
      });

      const newCombo = combo + 1;
      const bonus = lines * 150 * newCombo;
      const totalCoins = (lines * 10) + (newCombo * 2);
      
      nextScore = score + bonus;
      setScore(nextScore);
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setLinesCleared(prev => prev + lines);
      addCoins(totalCoins);
      setEarnedInSession(prev => prev + totalCoins);
      setLastBonus(bonus);
      
      playSound(newCombo > 1 ? SOUNDS.bonus : SOUNDS.clear);
      changeTheme(linesCleared + lines); 
      setTimeout(() => setLastBonus(null), 1200);
    } else {
      nextScore = score + 20;
      setScore(nextScore);
      setCombo(0);
      playSound(SOUNDS.place);
    }

    if (nextScore > highScore) setHighScore(nextScore);
    setGrid(newGrid);

    // Gestión de piezas disponibles
    const remaining = availablePieces.filter(p => p.id !== activeId);
    const nextSet = remaining.length === 0 ? getNewTransformedPieces() : remaining;
    setAvailablePieces(nextSet);

    // Comprobar GameOver
    if (!nextSet.some(p => canPlacePiece(p, newGrid))) {
      setIsGameOver(true);
      playSound(SOUNDS.gameOver);
    }
  }, [grid, availablePieces, combo, maxCombo, linesCleared, score, highScore, addCoins, playSound, changeTheme, getNewTransformedPieces, canPlacePiece]);

  const resetGame = useCallback((isRetry: boolean = false) => {
    if (isRetry) {
      if (!spendCoins(350)) return; 
    } else {
      setScore(0);
      setDisplayScore(0);
      setEarnedInSession(0);
      setLinesCleared(0);
      setCombo(0);
      changeTheme(0);
    }
    setGrid(Array(8).fill(null).map(() => Array(8).fill(null)));
    setIsGameOver(false);
    setAvailablePieces(getNewTransformedPieces());
    playSound(SOUNDS.click);
  }, [getNewTransformedPieces, spendCoins, playSound, changeTheme]);

  return { 
    grid, availablePieces, score, displayScore, highScore, 
    combo, maxCombo, linesCleared, lastBonus, isGameOver, 
    earnedInSession, placePiece, resetGame 
  };
};
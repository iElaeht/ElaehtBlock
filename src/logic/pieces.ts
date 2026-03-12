import type { UniqueIdentifier } from '@dnd-kit/core';

export interface Piece {
  id: UniqueIdentifier;
  shape: number[][];
  color: string;
}

// Usamos as const para que los colores y formas sean literales estrictos
const PIECE_TYPES = [
  { shape: [[1]], color: 'bg-emerald-400' },
  { shape: [[1, 1]], color: 'bg-yellow-400' },
  { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' },
  { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: 'bg-pink-600' },
  { shape: [[1, 1, 1]], color: 'bg-cyan-400' },
  { shape: [[1, 1, 1, 1]], color: 'bg-blue-500' },
  { shape: [[1, 1, 1, 1, 1]], color: 'bg-blue-600' },
  { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-indigo-600' },
  { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-indigo-500' },
  { shape: [[1, 1, 1], [1, 0, 0]], color: 'bg-orange-600' },
  { shape: [[1, 0], [1, 1]], color: 'bg-orange-400' },
  { shape: [[1, 1, 1], [0, 1, 0]], color: 'bg-purple-500' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
  { shape: [[1, 0], [0, 1]], color: 'bg-stone-400' },
  { shape: [[1, 1], [1, 1], [1, 1]], color: 'bg-slate-500' },
  { shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: 'bg-amber-700' },
] as const;

export const getRandomPieces = (): Piece[] => {
  return [...PIECE_TYPES]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map(type => ({
      // Usamos crypto.randomUUID() si está disponible, sino el fallback que ya tenías
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : `piece-${Math.random().toString(36).substring(2, 11)}`,
      shape: [...type.shape.map(row => [...row])], // Clonación profunda para evitar bugs de referencia
      color: type.color
    }));
};
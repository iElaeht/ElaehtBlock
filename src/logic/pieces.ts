import type { UniqueIdentifier } from '@dnd-kit/core';

export interface Piece {
  id: UniqueIdentifier; // En lugar de string
  shape: number[][];
  color: string;
}

const PIECE_TYPES = [
  // --- PIEZAS CLÁSICAS ---
  { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400' },
  { shape: [[1, 1]], color: 'bg-yellow-400' },
  { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400' },
  { shape: [[1, 1, 1]], color: 'bg-cyan-400' },
  { shape: [[1, 1, 1], [0, 1, 0]], color: 'bg-purple-500' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' },
  { shape: [[1]], color: 'bg-emerald-400' },
  { 
    shape: [
      [1, 1, 1], 
      [1, 1, 1], 
      [1, 1, 1]
    ], 
    color: 'bg-pink-600'
  },
  { 
    shape: [
      [1, 0],
      [1, 0],
      [1, 1]
    ], 
    color: 'bg-indigo-600'
  },
  { 
    shape: [
      [1, 0],
      [0, 1]
    ], 
    color: 'bg-indigo-600'
  },
  { 
    shape: [
      [1, 1],
      [1, 1],
      [1, 1],
    ], 
    color: 'bg-indigo-600'
  },
  { 
    shape: [
      [1, 0],
      [1, 1]
    ], 
    color: 'bg-indigo-600'
  },
  { 
    shape: [[1, 1, 1, 1, 1]], 
    color: 'bg-blue-400'
  },
  { 
    shape: [
      [1, 1, 1],
      [1, 0, 0],
    ], 
    color: 'bg-orange-600'
  }

];

export const getRandomPieces = (): Piece[] => {
  return Array(3).fill(null).map(() => {
    const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    return {
      id: `piece-${Math.random().toString(36).substring(2, 11)}`,
      shape: type.shape,
      color: type.color
    };
  });
};
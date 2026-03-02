import type { UniqueIdentifier } from '@dnd-kit/core';

export interface Piece {
  id: UniqueIdentifier;
  shape: number[][];
  color: string;
}

const PIECE_TYPES = [
  // --- BÁSICAS ---
  { shape: [[1]], color: 'bg-emerald-400' }, // Punto
  { shape: [[1, 1]], color: 'bg-yellow-400' }, // Mini Barra H
  { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' }, // Cuadrado 2x2
  { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: 'bg-pink-600' }, // Cuadrado 3x3

  // --- LÍNEAS ---
  { shape: [[1, 1, 1]], color: 'bg-cyan-400' }, // Barra 3
  { shape: [[1, 1, 1, 1]], color: 'bg-blue-500' }, // Barra 4
  { shape: [[1, 1, 1, 1, 1]], color: 'bg-blue-600' }, // Barra 5

  // --- PIEZAS EN L / J ---
  { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-indigo-600' }, // L normal
  { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-indigo-500' }, // L invertida (J)
  { shape: [[1, 1, 1], [1, 0, 0]], color: 'bg-orange-600' }, // L corta
  { shape: [[1, 0], [1, 1]], color: 'bg-orange-400' }, // Mini L (esquina)

  // --- PIEZAS T / Z / S ---
  { shape: [[1, 1, 1], [0, 1, 0]], color: 'bg-purple-500' }, // T
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' }, // Z
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' }, // S
  
  // --- ESPECIALES ASIMÉTRICAS ---
  { shape: [[1, 0], [0, 1]], color: 'bg-stone-400' }, // Diagonal 2
  { shape: [[1, 1], [1, 1], [1, 1]], color: 'bg-slate-500' }, // Rectángulo 3x2
  { shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: 'bg-amber-700' }, // L Grande
];

export const getRandomPieces = (): Piece[] => {
  // Mezclamos el array para mayor aleatoriedad
  const shuffled = [...PIECE_TYPES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map(type => ({
    id: `piece-${Math.random().toString(36).substring(2, 11)}`,
    shape: type.shape,
    color: type.color
  }));
};
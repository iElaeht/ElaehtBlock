// Define la estructura de una pieza de juego
export interface Piece {
  id: string;
  shape: number[][];
  color: string;
}

// Define los datos necesarios para mostrar la sombra (preview) en el tablero
export interface PreviewData {
  r: number;
  c: number;
  shape: number[][];
  color: string;
  isValid: boolean;
}

// Estructura de los Temas del juego
export interface GameTheme {
  id: string;
  bg: string;
  text: string;
  accent: string;
  accentText: string;
}

// Tipos para las propiedades de los componentes (opcional, pero recomendado)
export interface BoardProps {
  grid: (string | null)[][];
  preview: PreviewData | null;
  performanceMode: boolean;
}
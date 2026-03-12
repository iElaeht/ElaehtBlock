// src/logic/constants.ts

export const ANIMATION_STYLES = `
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

export const PERFORMANCE_COLORS: Record<string, string> = {
  "bg-blue-600": "bg-blue-500",
  "bg-emerald-600": "bg-emerald-500",
  "bg-red-600": "bg-red-500",
  "bg-purple-600": "bg-purple-500",
  "bg-orange-600": "bg-orange-500",
  "bg-cyan-600": "bg-cyan-500",
  "bg-pink-600": "bg-pink-500",
  "bg-indigo-600": "bg-indigo-500",
};

export const PIECE_COLORS: Record<string, string> = {
  // Un azul índigo suave, muy profesional
  blue: "bg-[#4A90E2] shadow-[0_4px_10px_rgba(74,144,226,0.25)]", 
  // Violeta "Amethyst" claro
  purple: "bg-[#9B51E0] shadow-[0_4px_10px_rgba(155,81,224,0.25)]", 
  // Verde esmeralda suave (muy visible sobre fondos oscuros)
  green: "bg-[#27AE60] shadow-[0_4px_10px_rgba(39,174,96,0.25)]", 
  // Coral energético (contraste alto con el azul)
  red: "bg-[#EB5757] shadow-[0_4px_10px_rgba(235,87,87,0.25)]", 
  // Amarillo "Miel" (más cálido, menos chillón)
  yellow: "bg-[#F2C94C] shadow-[0_4px_10px_rgba(242,201,76,0.25)]", 
  // Naranja arcilla moderna
  orange: "bg-[#F2994A] shadow-[0_4px_10px_rgba(242,153,74,0.25)]", 
  // Turquesa Tiffany (contraste máximo con el rojo)
  cyan: "bg-[#2D9CDB] shadow-[0_4px_10px_rgba(45,156,219,0.25)]", 
  // Orquídea / Magenta suave
  pink: "bg-[#BB6BD9] shadow-[0_4px_10px_rgba(187,107,217,0.25)]",
};

export const SOUNDS = {
  place: "/sounds/place.mp3",
  clear: "/sounds/clear.mp3",
  gameOver: "/sounds/gameOver.mp3",
  bonus: "/sounds/bonus.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
};
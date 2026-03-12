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

  /* TEXTURA CARBON FIBER RELAJADA (Opacidad baja para no cansar la vista) */
  .bg-carbon {
    background-color: #0a0a0a;
    background-image: 
      linear-gradient(45deg, rgba(0,0,0,0.5) 25%, transparent 25%), 
      linear-gradient(-45deg, rgba(0,0,0,0.5) 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.5) 75%), 
      linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.5) 75%);
    background-size: 4px 4px;
    background-position: 0 0, 0 2px, 2px 2px, 2px 0;
  }

  /* Brillo Soft-Glow (Sincronizado con PIECE_COLORS) */
  .shadow-neon-blue { box-shadow: 0 0 15px rgba(59,130,246,0.3); }
  .shadow-neon-purple { box-shadow: 0 0 15px rgba(168,85,247,0.3); }
  .shadow-neon-green { box-shadow: 0 0 15px rgba(16,185,129,0.3); }
  .shadow-neon-red { box-shadow: 0 0 15px rgba(239,68,68,0.3); }
  .shadow-neon-yellow { box-shadow: 0 0 15px rgba(245,158,11,0.3); }
  .shadow-neon-orange { box-shadow: 0 0 15px rgba(249,115,22,0.3); }
  .shadow-neon-cyan { box-shadow: 0 0 15px rgba(6,182,212,0.3); }
  .shadow-neon-pink { box-shadow: 0 0 15px rgba(236,72,153,0.3); }

  @keyframes scanline {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 0.1; }
    100% { transform: translateY(200%); opacity: 0; }
  }
  .animate-scanline { animation: scanline 2.5s linear infinite; }
`;

export const PERFORMANCE_COLORS: Record<string, string> = {
  blue: "bg-[#007AFF]",
  purple: "bg-[#BF5AF2]",
  green: "bg-[#32D74B]",
  red: "bg-[#FF453A]",
  yellow: "bg-[#FFD60A]",
  orange: "bg-[#FF9F0A]",
  cyan: "bg-[#64D2FF]",
  pink: "bg-[#FF375F]",
};

export const PIECE_COLORS: Record<string, string> = {
  blue: "border-[#3B82F6]/50 bg-[#1D4ED8]/15 shadow-[0_0_20px_rgba(59,130,246,0.2),inset_0_0_12px_rgba(59,130,246,0.2)]",
  purple: "border-[#A855F7]/50 bg-[#7E22CE]/15 shadow-[0_0_20px_rgba(168,85,247,0.2),inset_0_0_12px_rgba(168,85,247,0.2)]",
  green: "border-[#10B981]/50 bg-[#047857]/15 shadow-[0_0_20px_rgba(16,185,129,0.2),inset_0_0_12px_rgba(16,185,129,0.2)]",
  red: "border-[#EF4444]/50 bg-[#B91C1C]/15 shadow-[0_0_20px_rgba(239,68,68,0.2),inset_0_0_12px_rgba(239,68,68,0.2)]",
  yellow: "border-[#F59E0B]/50 bg-[#B45309]/15 shadow-[0_0_20px_rgba(245,158,11,0.2),inset_0_0_12px_rgba(245,158,11,0.2)]",
  orange: "border-[#F97316]/50 bg-[#C2410C]/15 shadow-[0_0_20px_rgba(249,115,22,0.2),inset_0_0_12px_rgba(249,115,22,0.2)]",
  cyan: "border-[#06B6D4]/50 bg-[#0E7490]/15 shadow-[0_0_20px_rgba(6,182,212,0.2),inset_0_0_12px_rgba(6,182,212,0.2)]",
  pink: "border-[#EC4899]/50 bg-[#BE185D]/15 shadow-[0_0_20px_rgba(236,72,153,0.2),inset_0_0_12px_rgba(236,72,153,0.2)]",
};

export const SOUNDS = {
  place: "/sounds/place.mp3",
  clear: "/sounds/clear.mp3",
  gameOver: "/sounds/gameOver.mp3",
  bonus: "/sounds/bonus.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
};
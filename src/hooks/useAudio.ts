import { useState, useCallback } from "react";

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem("game-muted") === "true");

  const playSound = useCallback((url: string) => {
    if (isMuted) return;

    const audio = new Audio(url);
    audio.volume = 0.4;
    
    // TRUCO: Reiniciar el tiempo por si el archivo ya estaba cargado en memoria
    audio.currentTime = 0; 
    
    // Forzamos la carga inmediata
    audio.play().catch((err) => {
      console.warn("Audio bloqueado por el navegador hasta que interactúes con la pantalla.", err);
    });
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem("game-muted", String(newValue));
      return newValue;
    });
  }, []);

  return { playSound, isMuted, setIsMuted, toggleMute };
};
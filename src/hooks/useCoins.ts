import { useState, useCallback } from "react";

export const useCoins = () => {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("ai-block-coins");
    return saved ? parseInt(saved, 10) : 0;
  });

  const addCoins = useCallback((amount: number) => {
    setCoins(prev => {
      const nuevo = prev + amount;
      localStorage.setItem("ai-block-coins", nuevo.toString());
      return nuevo;
    });
  }, []);

  const spendCoins = useCallback((amount: number) => {
    // Verificamos si tiene las 100 monedas
    if (coins >= amount) {
      setCoins(prev => {
        const nuevo = prev - amount;
        localStorage.setItem("ai-block-coins", nuevo.toString());
        return nuevo;
      });
      return true; // Éxito: Se consume y se permite reintentar
    }
    return false; // Fallo: No tiene suficiente
  }, [coins]);

  return { coins, addCoins, spendCoins };
};
/* src/components/Layout/GameLayout.tsx */
import type { ReactNode } from "react";

interface GameLayoutProps {
  children: ReactNode;
}

export const GameLayout = ({ children }: GameLayoutProps) => {
  return (
    <div className="
      relative min-h-[100dvh] w-full 
      overflow-hidden 
      flex flex-col
      bg-transparent  /* <--- ASEGÚRATE DE ESTO */
      pt-[env(safe-area-inset-top)] 
      pb-[env(safe-area-inset-bottom)]
    ">
      <div className="flex-1 w-full flex flex-col bg-transparent">
        {children}
      </div>
    </div>
  );
};
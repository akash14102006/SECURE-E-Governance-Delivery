import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div
      className={`
        rounded-2xl backdrop-blur-[24px] 
        bg-white/45 border border-white/60
        shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
        ${hover ? 'transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_48px_0_rgba(31,38,135,0.2)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

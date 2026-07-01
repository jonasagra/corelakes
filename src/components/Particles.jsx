'use client';

import { useMemo } from 'react';

export default function Particles() {
  const dots = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ id: i, left: `${(i * 7) % 100}%`, top: `${(i * 13) % 100}%`, delay: `${(i % 5) * 0.8}s` })), []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {dots.map((dot) => (
        <span key={dot.id} className="absolute block w-2 h-2 rounded-full bg-mc-green-bright/60 animate-float" style={{ left: dot.left, top: dot.top, animationDelay: dot.delay }} />
      ))}
    </div>
  );
}

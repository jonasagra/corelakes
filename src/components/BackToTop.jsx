'use client';

// Botão "voltar ao topo" (estilo minecraft.net): verde, seta pixelada,
// aparece no canto inferior direito depois de rolar a página.
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const PixelArrow = () => (
  <svg viewBox="0 0 14 14" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* ponta */}
    <rect x="6" y="1" width="2" height="2" fill="#fff" />
    <rect x="4" y="3" width="2" height="2" fill="#fff" />
    <rect x="8" y="3" width="2" height="2" fill="#fff" />
    <rect x="2" y="5" width="2" height="2" fill="#fff" />
    <rect x="10" y="5" width="2" height="2" fill="#fff" />
    {/* haste */}
    <rect x="6" y="3" width="2" height="10" fill="#fff" />
  </svg>
);

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // some no painel (o editor em tela cheia tem os próprios controles)
  if (!visible || pathname?.startsWith('/admin')) return null;

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="mc-bevel-green fixed bottom-6 right-5 z-[190] w-12 h-12 flex items-center justify-center cursor-pointer"
    >
      <PixelArrow />
    </button>
  );
}

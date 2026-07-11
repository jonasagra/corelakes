'use client';

// Só as duas partes que PRECISAM rodar no navegador: saber se quem tá
// vendo é o admin (pra mostrar "Editar post") e carregar o widgets.js
// do Twitter/X quando o post tem um tweet incorporado. O resto do post
// (título, imagem, corpo) é renderizado no servidor pelo page.jsx.
import { useEffect } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';

export function AdminEditLink({ slug }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return null;

  return (
    <Link
      href={`/admin?edit=${slug}`}
      className="flex items-center gap-[6px] text-mc-green-bright hover:text-white transition-colors no-underline"
    >
      <img src="https://minecraft.wiki/images/Brush_JE1_BE1.png?fd417" alt="" aria-hidden="true" className="oreUI-icon !w-4 !h-4" />
      Editar post
    </Link>
  );
}

export function TweetWidgetLoader({ hasTweet }) {
  useEffect(() => {
    if (!hasTweet) return;
    const render = () => window.twttr?.widgets?.load();
    if (window.twttr?.widgets) { render(); return; }
    const s = document.createElement('script');
    s.src = 'https://platform.twitter.com/widgets.js';
    s.async = true;
    s.onload = render;
    document.body.appendChild(s);
  }, [hasTweet]);

  return null;
}

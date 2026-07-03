'use client';

// ── Carrossel de posts em destaque (estilo minecraft.net) ──────
// Imagem full-bleed (sem bordas, de ponta a ponta), gradiente fundindo
// com o fundo do site, badge da categoria, título grande e resumo.
// Com mais de um destaque: setas, bolinhas, auto-slide (7s) e swipe.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const Arrow = ({ dir, onClick }) => (
  <button
    type="button"
    aria-label={dir === 'prev' ? 'Destaque anterior' : 'Próximo destaque'}
    onClick={onClick}
    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 border border-white/20 text-white text-[1.3rem] leading-none hover:bg-mc-green hover:border-black transition-colors"
  >
    {dir === 'prev' ? '‹' : '›'}
  </button>
);

export default function FeaturedCarousel({ posts }) {
  const [index, setIndex] = useState(0);
  const touchX = useRef(null);
  const count = posts.length;

  const go = (i) => setIndex(((i % count) + count) % count);

  // auto-slide; reinicia a contagem sempre que o slide muda (manual ou não)
  useEffect(() => {
    if (count < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearTimeout(t);
  }, [index, count]);

  if (count === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 'min(74svh, 620px)' }}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      {/* trilho */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.slug}`}
            className="relative block w-full h-full shrink-0 no-underline group"
          >
            <img
              src={post.image_url}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            {/* escurece e funde no fundo do site (igual o cabeçalho da home) */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(11,11,12,0.12) 42%, rgba(11,11,12,0.88) 82%, #0b0b0c 100%)' }}
            />
            <div className="absolute inset-x-0 bottom-0">
              <div className="max-w-[1100px] mx-auto px-5 pb-12 md:pb-14 pr-[130px] md:pr-[160px]">
                {post.category_name && (
                  <span
                    className="inline-block mb-3 px-[10px] py-[5px] text-[0.7rem] font-bold uppercase tracking-[1px] text-white"
                    style={{ background: post.category_color || '#3c8527' }}
                  >
                    {post.category_name}
                  </span>
                )}
                <h2 className="font-display font-bold text-white leading-[1.08] text-[clamp(1.5rem,4.8vw,3rem)] mb-3 group-hover:text-mc-green-link transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="hidden sm:block text-white/75 text-[1rem] leading-[1.55] max-w-[620px] mb-3">
                    {post.excerpt}
                  </p>
                )}
                <p className="text-white/50 text-[0.8rem]">
                  {post.date} · Corelakes
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* controles (só com 2+ destaques) */}
      {count > 1 && (
        <div className="absolute bottom-12 md:bottom-14 right-5 flex items-center gap-3">
          <div className="flex items-center gap-[6px] mr-1">
            {posts.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir para o destaque ${i + 1}`}
                onClick={() => go(i)}
                className={`h-[6px] rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 bg-mc-green-bright' : 'w-[6px] bg-white/35 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          <Arrow dir="prev" onClick={() => go(index - 1)} />
          <Arrow dir="next" onClick={() => go(index + 1)} />
        </div>
      )}
    </section>
  );
}

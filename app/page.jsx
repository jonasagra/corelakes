'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import usePosts from '@/hooks/usePosts';

const WALL = '/assets/wallpaper.webp';
const SKIN_H = 'clamp(220px, 42vw, 380px)';

export default function Home() {
  const { posts, fetchPosts } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Destaques (estilo minecraft.net): 1 cartão grande + até 2 laterais.
  const featured = posts.filter((p) => p.featured && p.image_url);
  const big = featured[0] || null;
  const sides = featured.slice(1, 3);
  const shownIds = new Set([big, ...sides].filter(Boolean).map((p) => p.id));
  const recentes = posts.filter((p) => !shownIds.has(p.id)).slice(0, 5);

  return (
    <>
      <h1 className="sr-only">Corelakes | Criador de Conteúdo de Minecraft</h1>

      {/* ── CABEÇALHO full-bleed: wallpaper + skin ── */}
      <header className="relative">
        <div className="relative w-full"
             style={{ backgroundImage: `url(${WALL})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          {/* escurece o wallpaper e funde no fundo do site */}
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(11,11,12,0.55) 65%, #0b0b0c 100%)' }} />
          {/* skin (metade fica atrás do container abaixo) */}
          <div className="relative flex justify-center pt-[92px] px-5">
            <img src="/skin_art.webp" alt="Skin do Corelakes"
                 className="w-auto object-contain"
                 style={{ height: SKIN_H, filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.6))' }} />
          </div>
        </div>

        {/* ── "Sobre mim": largura CHEIA, sólido, sobrepondo METADE da skin ── */}
        <div className="relative z-[3] w-full bg-[#161617] border-t border-b border-black"
             style={{ marginTop: `calc(${SKIN_H} * -0.5)` }}>
          <div className="max-w-[760px] mx-auto px-6 py-9 sm:px-5 sm:py-7">
            <p className="font-mc text-[0.72rem] uppercase tracking-[2px] text-mc-green-link text-center mb-4">
              Engenharia de Software · Criador de Conteúdo
            </p>
            <h2 className="font-mc-ten uppercase text-[1.6rem] text-white text-center mb-5 sm:text-[1.3rem]">Sobre mim</h2>
            <p className="text-white/85 text-[0.98rem] leading-[1.75]">
              Olá, seja bem-vindo ao meu blog! Sou o <strong className="text-white">Corelakes</strong> e crio
              conteúdo sobre Minecraft há anos. Comecei com a <em>Minecraft Interessante</em>, uma página no
              Facebook que reuniu 20 mil fãs antes de ser encerrada em 2021. Hoje sigo criando no YouTube, no
              Instagram e no X.
            </p>
            <p className="text-white/85 text-[0.98rem] leading-[1.75] mt-4">
              Pelo caminho, já estive no meio de muita coisa: Cheguei a{' '}
              <a
                href="https://web.archive.org/web/20251203155933/https://www.tecnogaming.com.br/games/conheca-marcio-oliveira-o-desenvolvedor-brasileiro-do-minecraft/4435"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mc-green-bright hover:text-white transition-colors"
              >
                entrevistar o desenvolvedor brasileiro de Minecraft
              </a>{' '}
              e mantive contato próximo com pessoas da comunidade ligada à produtora do jogo até 2020 quando gerenciei a minha
              antiga página. Hoje,
              sou administrador e burocrata da Minecraft Wiki representando o Brasil, um dos maiores sites da comunidade.
            </p>
          </div>
        </div>
      </header>

      {/* ── conteúdo normal (fundo do site) ── */}
      <main className="relative z-[1] max-w-[860px] mx-auto px-5 pt-9 pb-16">
        {/* ── EM DESTAQUE (estilo minecraft.net/article) ── */}
        {big && (
          <section className="mt-16">
            <p className="mc-label mc-seclabel text-[0.8rem] text-white/55 text-center mb-7 mx-auto max-w-[420px]">
              Em destaque
            </p>
            <div className={`grid gap-5 ${sides.length ? 'md:grid-cols-3' : ''}`}>

              {/* cartão grande: imagem + painel com título, resumo e botão */}
              <article className={`mc-panel overflow-hidden flex flex-col ${sides.length ? 'md:col-span-2' : ''}`}>
                <Link href={`/post/${big.slug}`} className="block overflow-hidden">
                  <img src={big.image_url} alt={big.title}
                       className="w-full aspect-[16/8] object-cover transition-transform duration-500 hover:scale-[1.03]" />
                </Link>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  {big.category_name && (
                    <p className="text-[0.7rem] font-bold uppercase tracking-[1px]"
                       style={{ color: big.category_color || '#6cc349' }}>
                      {big.category_name}
                    </p>
                  )}
                  <h3 className="font-mc-pixel text-[1.25rem] text-white leading-snug">
                    {big.title}
                  </h3>
                  {big.excerpt && (
                    <p className="text-white/60 text-[0.92rem] leading-[1.6]"
                       style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {big.excerpt}
                    </p>
                  )}
                  <div className="mt-auto pt-2">
                    <Link href={`/post/${big.slug}`} className="mc-btn mc-btn-solid">
                      Ver o post completo <span aria-hidden="true">›</span>
                    </Link>
                  </div>
                </div>
              </article>

              {/* destaques secundários: imagem + título + link verde */}
              {sides.map((p) => (
                <article key={p.id} className="mc-panel overflow-hidden flex flex-col">
                  <Link href={`/post/${p.slug}`} className="block overflow-hidden">
                    <img src={p.image_url} alt={p.title}
                         className="w-full aspect-video object-cover transition-transform duration-500 hover:scale-[1.03]" />
                  </Link>
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    {p.category_name && (
                      <p className="text-[0.68rem] font-bold uppercase tracking-[1px]"
                         style={{ color: p.category_color || '#6cc349' }}>
                        {p.category_name}
                      </p>
                    )}
                    <h3 className="font-mc-pixel text-[0.95rem] text-white leading-snug">{p.title}</h3>
                    <Link href={`/post/${p.slug}`}
                          className="mt-auto pt-1 text-mc-green-bright text-[0.85rem] font-semibold no-underline hover:text-white transition-colors">
                      Ler o post <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {recentes.length > 0 && (
          <section className="mt-16">
            <p className="mc-label mc-seclabel text-[0.8rem] text-white/55 text-center mb-7 mx-auto max-w-[420px]">
              Últimos posts
            </p>
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {recentes.map((p) => (
                <Link key={p.id} href={`/post/${p.slug}`}
                      className="mc-panel block overflow-hidden no-underline transition-transform duration-200 hover:-translate-y-1">
                  {p.image_url && (
                    <div className="h-[140px] overflow-hidden border-b border-black">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-mc-pixel text-[0.92rem] text-white mb-2 leading-snug hover:text-mc-green-bright transition-colors">
                      {p.title}
                    </h3>
                    <span className="text-white/45 text-[0.75rem]">{p.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

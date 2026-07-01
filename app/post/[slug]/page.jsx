'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import usePosts from '@/hooks/usePosts';
import useAuth from '@/hooks/useAuth';

export default function Post() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const { getPostBySlug } = usePosts();
  const { isAdmin } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await getPostBySlug(slug);
      if (cancelled) return;
      if (p) { setPost(p); }
      else setError(true);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, getPostBySlug]);

  if (loading) return (
    <main className="relative z-[1] max-w-[800px] mx-auto px-5 pt-[110px] pb-16">
      <p className="text-white/60 text-center py-[60px]">Carregando post…</p>
    </main>
  );

  if (error || !post) return (
    <main className="relative z-[1] max-w-[800px] mx-auto px-5 pt-[110px] pb-16">
      <div className="text-center py-[60px]">
        <h1 className="font-mc-five text-[2rem] text-white mb-4" style={{ textShadow: '3px 3px 0 #3f3f3f' }}>
          Post não encontrado
        </h1>
        <p className="text-white/70 mb-7">O post que você procura não existe ou foi removido.</p>
        <Link href="/blog" className="mc-btn">← Voltar ao blog</Link>
      </div>
    </main>
  );

  return (
    <main className="relative z-[1] pb-16">
      <article>
        {/* header + corpo: faixa CINZA começando logo abaixo da navbar (pt-[110px]
            traz o espaço pra DENTRO do cinza, sem o fundo pixelado aparecer) */}
        <div className="w-full bg-[#161617] mb-8 pt-[110px]">
          <div className="max-w-[800px] mx-auto px-6 py-8 sm:px-5 sm:py-6">
            <header className="mb-7">
              {post.image_url && (
                <img src={post.image_url} alt={post.title}
                  className="w-full max-h-[400px] object-cover mb-6" />
              )}
              <h1 className="font-mc-five text-[2rem] text-white mb-4 leading-[1.3] sm:text-[1.5rem]"
                style={{ textShadow: '3px 3px 0 #3f3f3f' }}>
                {post.title}
              </h1>
              <div className="flex flex-wrap gap-5 text-white/55 text-[0.85rem] pb-5 border-b border-[#2a2a2b]">
                <span className="flex items-center gap-[6px]">
                  <img src="https://minecraft.wiki/images/archive/20181112133323%21Calendar_sheet.png?ec376&format=original" alt="" aria-hidden="true" className="oreUI-icon !w-4 !h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-[6px]">
                  <img src="https://minecraft.wiki/images/Book_and_Quill_JE2_BE2.png?2128f&format=original" alt="" aria-hidden="true" className="oreUI-icon !w-4 !h-4" />
                  Corelakes
                </span>
                {isAdmin && (
                  <Link href={`/admin?edit=${post.slug}`}
                    className="flex items-center gap-[6px] text-mc-green-bright hover:text-white transition-colors no-underline">
                    <img src="https://minecraft.wiki/images/Brush_JE1_BE1.png?fd417" alt="" aria-hidden="true" className="oreUI-icon !w-4 !h-4" />
                    Editar post
                  </Link>
                )}
              </div>
            </header>

            <div className="post-body text-base"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || '') }} />
          </div>
        </div>

        <nav className="max-w-[800px] mx-auto px-5">
          <Link href="/blog" className="mc-btn">← Voltar ao blog</Link>
        </nav>
      </article>
    </main>
  );
}

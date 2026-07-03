'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import usePosts from '@/hooks/usePosts';
import useAuth from '@/hooks/useAuth';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import { showToast } from '@/components/Toast';
import { confirmDialog } from '@/components/ConfirmModal';

// "há 3 dias", "há 5 horas" — como o minecraft.net faz ("3 days ago")
function timeAgo(dateStr) {
  const s = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (Number.isNaN(s) || s < 0) return '';
  if (s < 3600) { const m = Math.max(1, Math.floor(s / 60)); return `há ${m} min`; }
  if (s < 86400) { const h = Math.floor(s / 3600); return `há ${h} hora${h > 1 ? 's' : ''}`; }
  const d = Math.floor(s / 86400);
  if (d < 30) return `há ${d} dia${d > 1 ? 's' : ''}`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `há ${mo} ${mo > 1 ? 'meses' : 'mês'}`;
  const y = Math.max(1, Math.floor(d / 365));
  return `há ${y} ano${y > 1 ? 's' : ''}`;
}

export default function Blog() {
  const { posts, loading, fetchPosts, deletePost } = usePosts();
  const { isAdmin } = useAuth();

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id) => {
    const ok = await confirmDialog({ title: 'Excluir post?', message: 'Essa ação não pode ser desfeita.', confirmText: 'Excluir', danger: true });
    if (!ok) return;
    try {
      await deletePost(id);
      showToast('Post excluído com sucesso!', 'success');
      fetchPosts();
    } catch (e) {
      showToast('Erro ao excluir: ' + e.message, 'error');
    }
  };

  if (loading) return (
    <main className="relative z-[1] max-w-[900px] mx-auto px-5 pt-[120px] pb-16">
      <p className="text-white/50 text-center py-[60px]">Carregando posts…</p>
    </main>
  );

  // Destaques (marcados no editor) vão pro carrossel; o resto pro grid.
  const featured = posts.filter((p) => p.featured && p.image_url);
  const featuredIds = new Set(featured.map((p) => p.id));
  const rest = posts.filter((p) => !featuredIds.has(p.id));

  return (
    <main className="relative z-[1] pb-16">

      {/* ── título do blog (fonte decorativa, como pedido) ── */}
      <section className="max-w-[900px] mx-auto px-5 pt-[110px] text-center mb-9">
        <h1 className="font-mc-five text-[2.2rem] text-white mb-2 sm:text-[1.7rem]"
            style={{ textShadow: '3px 3px 0 #3f3f3f' }}>
          Página do Coreblog
        </h1>
        <p className="text-white/60 text-[0.95rem]">Com postagens sobre os projetos que participo, opiniões, notícias recentes, e experiências pela internet</p>
      </section>

      {/* ── carrossel de destaques: full-bleed, abaixo do título ── */}
      <FeaturedCarousel posts={featured} />

      {/* ── grid de posts (estilo minecraft.net/article) ── */}
      <div className={`max-w-[1000px] mx-auto px-5 ${featured.length ? 'pt-12' : 'pt-2'}`}>
        {rest.length === 0 && featured.length === 0 ? (
          <p className="text-white/50 text-center py-[60px]">Nenhum post publicado ainda.</p>
        ) : (
          <section className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
            {rest.map((post) => (
              <article key={post.id}
                       className="mc-panel relative flex flex-col p-4 transition-transform duration-200 hover:-translate-y-1">
                {isAdmin && (
                  <div className="absolute top-[22px] right-[22px] flex gap-[6px] z-[10]">
                    <Link href={`/admin?edit=${post.slug}`} aria-label="Editar"
                          className="flex items-center justify-center w-9 h-9 border border-black bg-[#2a2a2b]/90 hover:bg-mc-green transition-colors">
                      <img src="https://minecraft.wiki/images/Brush_JE1_BE1.png?fd417" alt="" aria-hidden="true" className="w-5 h-5" />
                    </Link>
                    <button onClick={() => handleDelete(post.id)} aria-label="Excluir"
                            className="flex items-center justify-center w-9 h-9 border border-black bg-[#2a2a2b]/90 hover:bg-mc-red transition-colors cursor-pointer">
                      <img src="https://minecraft.wiki/images/Lava_Bucket_JE2_BE2.png?55ee0&format=original" alt="" aria-hidden="true" className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {post.image_url && (
                  <Link href={`/post/${post.slug}`} className="block overflow-hidden mb-4">
                    <img src={post.image_url} alt={post.title}
                         className="w-full aspect-video object-cover transition-transform duration-300 hover:scale-105" />
                  </Link>
                )}

                {post.category_name && (
                  <p className="text-[0.7rem] font-bold uppercase tracking-[1px] mb-1"
                     style={{ color: post.category_color || '#6cc349' }}>
                    {post.category_name}
                  </p>
                )}

                <Link href={`/post/${post.slug}`} className="no-underline">
                  <h2 className="text-[1.12rem] font-bold text-white leading-snug mb-2 hover:text-mc-green-bright transition-colors">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-white/55 text-[0.85rem] leading-[1.55] mb-4"
                   style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.excerpt || (post.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '…')}
                </p>

                <p className="mt-auto text-white/35 text-[0.78rem]">{timeAgo(post.created_at)}</p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

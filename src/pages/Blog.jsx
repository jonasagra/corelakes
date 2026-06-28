import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import { showToast } from '../components/Toast';
import { confirmDialog } from '../components/ConfirmModal';

export default function Blog({ isAdmin }) {
  const { posts, loading, fetchPosts, deletePost } = usePosts();

  useEffect(() => { document.title = 'Blog — Corelakes'; fetchPosts(); }, [fetchPosts]);

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

  return (
    <main className="relative z-[1] max-w-[900px] mx-auto px-5 pt-[110px] pb-16">
      <section className="text-center mb-10">
        <h1 className="font-mc-five text-[2.2rem] text-white mb-2 sm:text-[1.7rem]"
            style={{ textShadow: '3px 3px 0 #3f3f3f' }}>
          Meu diário pessoal
        </h1>
        <p className="text-white/60 text-[0.95rem]">Pensamentos, experiências e dia a dia</p>
      </section>

      {posts.length === 0 ? (
        <p className="text-white/50 text-center py-[60px]">Nenhum post publicado ainda.</p>
      ) : (
        <section className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {posts.map((post) => (
            <article key={post.id}
                     className="mc-panel relative overflow-hidden transition-transform duration-200 hover:-translate-y-1">
              {isAdmin && (
                <div className="absolute top-[10px] right-[10px] flex gap-[6px] z-[10]">
                  <Link to={`/admin?edit=${post.slug}`} aria-label="Editar"
                        className="flex items-center justify-center w-9 h-9 border border-black bg-[#2a2a2b] hover:bg-mc-green transition-colors">
                    <img src="https://minecraft.wiki/images/Brush_JE1_BE1.png?fd417" alt="" aria-hidden="true" className="w-5 h-5" />
                  </Link>
                  <button onClick={() => handleDelete(post.id)} aria-label="Excluir"
                          className="flex items-center justify-center w-9 h-9 border border-black bg-[#2a2a2b] hover:bg-mc-red transition-colors cursor-pointer">
                    <img src="https://minecraft.wiki/images/Lava_Bucket_JE2_BE2.png?55ee0&format=original" alt="" aria-hidden="true" className="w-5 h-5" />
                  </button>
                </div>
              )}

              {post.image_url && (
                <Link to={`/post/${post.slug}`} className="block h-[180px] overflow-hidden border-b border-black">
                  <img src={post.image_url} alt={post.title}
                       className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                </Link>
              )}

              <div className="p-5">
                <Link to={`/post/${post.slug}`} className="no-underline">
                  <h2 className="font-mc text-[1.05rem] text-white mb-2 leading-snug hover:text-mc-green-bright transition-colors">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-white/70 text-[0.85rem] leading-[1.5] mb-4">
                  {post.excerpt || (post.content?.replace(/<[^>]*>/g, '').slice(0, 140) + '…')}
                </p>
                <div className="flex items-center gap-2 text-white/45 text-[0.75rem]">
                  <img src="https://minecraft.wiki/images/archive/20181112133323%21Calendar_sheet.png?ec376&format=original" alt="" aria-hidden="true" className="oreUI-icon !w-4 !h-4" />
                  {post.date}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

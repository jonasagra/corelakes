import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import { showToast } from '../components/Toast';

export default function Blog({ isAdmin }) {
  const { posts, loading, fetchPosts, deletePost } = usePosts();

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await deletePost(id);
      showToast('Post excluído com sucesso!', 'success');
      fetchPosts(); // refresh
    } catch (e) {
      showToast('Erro ao excluir: ' + e.message, 'error');
    }
  };

  /* ── states ── */
  if (loading) return (
    <main className="relative z-[1] max-w-[800px] mx-auto px-5 pt-[120px] pb-[140px]">
      <p className="font-mc text-base text-white/50 text-center py-[60px]">Carregando posts…</p>
    </main>
  );

  return (
    <main className="relative z-[1] max-w-[800px] mx-auto px-5 pt-[120px] pb-[140px]">
      {/* header */}
      <section className="text-center mb-10">
        <h1 className="font-mc-five text-[2.5rem] text-white mb-[10px] sm:text-[1.8rem]"
            style={{ textShadow:'3px 3px 0 #3f3f3f' }}>
          Meu diário pessoal
        </h1>
        <p className="font-mc text-base text-white/70">Pensamentos, experiências e dia a dia</p>
      </section>

      {/* posts grid */}
      {posts.length === 0 ? (
        <p className="font-mc text-base text-white/50 text-center py-[60px]">Nenhum post publicado ainda.</p>
      ) : (
        <section className="grid gap-[25px] sm:grid-cols-1"
                 style={{ gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {posts.map(post => (
            <article key={post.id}
                     className="relative overflow-hidden border-[4px] border-mc-dark transition-all duration-200 hover:-translate-y-1"
                     style={{ background:'#48494a', boxShadow:'inset 0 -4px 0 #313233, inset 0 4px 0 #5a5b5c, 0 6px 20px rgba(0,0,0,0.4)' }}>

              {/* admin buttons */}
              {isAdmin && (
                <div className="absolute top-[10px] right-[10px] flex gap-[6px] z-[10]">
                  <Link to={`/admin?edit=${post.slug}`}
                        className="flex items-center justify-center px-[10px] py-[6px] text-white border-[2px] border-mc-dark cursor-pointer transition-all duration-[150ms] hover:-translate-y-0.5 hover:bg-mc-green"
                        style={{ background:'#48494a', boxShadow:'inset 0 -2px 0 #313233, inset 0 2px 0 #5a5b5c' }}>
                    ✏️
                  </Link>
                  <button onClick={() => handleDelete(post.id)}
                          className="flex items-center justify-center px-[10px] py-[6px] text-white border-[2px] border-mc-dark cursor-pointer transition-all duration-[150ms] hover:-translate-y-0.5 hover:bg-mc-red"
                          style={{ background:'#48494a', boxShadow:'inset 0 -2px 0 #313233, inset 0 2px 0 #5a5b5c' }}>
                    🗑️
                  </button>
                </div>
              )}

              {/* image */}
              {post.image_url && (
                <div className="w-full h-[200px] overflow-hidden border-b-[3px] border-mc-dark">
                  <Link to={`/post/${post.slug}`}>
                    <img src={post.image_url} alt={post.title}
                         className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  </Link>
                </div>
              )}

              {/* content */}
              <div className="p-5">
                <Link to={`/post/${post.slug}`} className="no-underline text-inherit">
                  <h2 className="font-mc-five text-[1.1rem] text-white mb-3 leading-[1.3]"
                      style={{ textShadow:'2px 2px 0 #3f3f3f' }}>
                    {post.title}
                  </h2>
                </Link>
                <p className="font-mc text-[0.85rem] text-white/70 leading-[1.6] mb-4">
                  {post.excerpt || (post.content?.replace(/<[^>]*>/g, '').slice(0, 150) + '…')}
                </p>
                <div className="flex justify-between items-center font-mc text-[0.75rem] text-white/50">
                  <span>📅 {post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

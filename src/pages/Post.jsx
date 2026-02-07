import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';  // we won't actually use helmet; handle <title> manually
import usePosts from '../hooks/usePosts';

export default function Post() {
  const { slug }              = useParams();
  const { getPostBySlug }     = usePosts();
  const [post,    setPost]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await getPostBySlug(slug);
      if (cancelled) return;
      if (p) { setPost(p); document.title = `${p.title} - Corelakes`; }
      else   setError(true);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, getPostBySlug]);

  /* ── loading ── */
  if (loading) return (
    <main className="relative z-[1] max-w-[800px] mx-auto px-5 pt-[100px] pb-[140px]">
      <p className="font-mc text-base text-white/70 text-center py-[60px]">Carregando post…</p>
    </main>
  );

  /* ── 404 ── */
  if (error || !post) return (
    <main className="relative z-[1] max-w-[800px] mx-auto px-5 pt-[100px] pb-[140px]">
      <div className="text-center py-[60px]">
        <h1 className="font-mc-five text-[2rem] text-white mb-[15px]" style={{ textShadow:'3px 3px 0 #3f3f3f' }}>
          😕 Post não encontrado
        </h1>
        <p className="font-mc text-base text-white/70 mb-[25px]">
          O post que você está procurando não existe ou foi removido.
        </p>
        <Link to="/blog"
              className="inline-flex items-center gap-[10px] px-5 py-3 font-mc text-[0.9rem] text-white no-underline border-[3px] border-mc-dark transition-all duration-[150ms] hover:bg-mc-bg-light hover:-translate-y-0.5"
              style={{ background:'#48494a', boxShadow:'inset 0 -3px 0 #313233, inset 0 3px 0 #5a5b5c' }}>
          ← Voltar ao Blog
        </Link>
      </div>
    </main>
  );

  /* ── render post ── */
  return (
    <main className="relative z-[1] max-w-[800px] mx-auto px-5 pt-[100px] pb-[140px]">
      <article>
        <header className="mb-[30px]">
          {post.image_url && (
            <img src={post.image_url} alt={post.title}
                 className="w-full max-h-[400px] object-cover border-[4px] border-mc-dark mb-[25px]" />
          )}
          <h1 className="font-mc-five text-[2rem] text-white mb-[15px] leading-[1.3] sm:text-[1.5rem]"
              style={{ textShadow:'3px 3px 0 #3f3f3f' }}>
            {post.title}
          </h1>
          <div className="flex gap-5 font-mc text-[0.9rem] text-white/60 pb-5 border-b-[3px] border-mc-dark sm:flex-col sm:gap-[10px]">
            <span className="flex items-center gap-[6px]">
              <img src="https://minecraft.wiki/images/archive/20181112133323%21Calendar_sheet.png?ec376&format=original" alt="Data" className="oreUI-icon" />
              {post.date}
            </span>
            <span className="flex items-center gap-[6px]">
              <img src="https://minecraft.wiki/images/Book_and_Quill_JE2_BE2.png?2128f&format=original" alt="Autor" className="oreUI-icon" />
              Jonas Agra
            </span>
          </div>
        </header>

        {/* content box */}
        <div className="border-[4px] border-mc-dark p-[30px] mb-[30px] sm:p-5"
             style={{ background:'#48494a', boxShadow:'inset 0 -4px 0 #313233, inset 0 4px 0 #5a5b5c' }}>
          <div className="post-body text-base"
               dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* back nav */}
        <nav>
          <Link to="/blog"
                className="inline-flex items-center gap-[10px] px-5 py-3 font-mc text-[0.9rem] text-white no-underline border-[3px] border-mc-dark transition-all duration-[150ms] hover:bg-mc-bg-light hover:-translate-y-0.5"
                style={{ background:'#48494a', boxShadow:'inset 0 -3px 0 #313233, inset 0 3px 0 #5a5b5c' }}>
            ← Voltar ao Blog
          </Link>
        </nav>
      </article>
    </main>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';

/* moldura quadrada idêntica para as duas fotos (mesma largura e altura
   em qualquer tela, via clamp) */
const FRAME = { width: 'clamp(120px, 38vw, 168px)', height: 'clamp(120px, 38vw, 168px)' };

export default function Home() {
  const { posts, fetchPosts } = usePosts();

  useEffect(() => {
    document.title = 'Corelakes — Jonas Agra';
    fetchPosts();
  }, [fetchPosts]);

  const recentes = posts.slice(0, 3);

  return (
    <main className="relative z-[1] max-w-[820px] mx-auto px-5 pt-[100px] pb-16">
      {/* ── perfil ── */}
      <section className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          {[
            { src: '/assets/personal.webp', alt: 'Jonas Agra', pos: 'center bottom' },
            { src: '/assets/avatar.webp',   alt: 'Corelakes Avatar', pos: 'center top' },
          ].map((p) => (
            <div key={p.alt} className="p-[6px] border-[3px] border-black" style={{ background: '#202021' }}>
              <img src={p.src} alt={p.alt} className="block object-cover"
                   style={{ ...FRAME, objectPosition: p.pos }} />
            </div>
          ))}
        </div>

        <img src="/logo.png" alt="Corelakes" className="w-[min(360px,82vw)] h-auto mb-3" />

        <p className="mc-label text-[0.8rem] text-mc-green-link mb-7">
          Engenharia de Software · QA · Criador de Conteúdo
        </p>

        <div className="mc-card max-w-[680px] w-full text-left mb-7">
          <h2 className="font-mc text-[1.05rem] uppercase tracking-[1px] text-white mb-3">Sobre mim</h2>
          <p className="text-white/85 text-[0.98rem] leading-[1.7]">
            Eu sou Jonas Agra, conhecido como Corelakes. Estudante de Engenharia de Software, testador,
            designer e criador de conteúdo. Paraibano, represento e administro a Minecraft Wiki em
            português e já lancei algumas músicas no Spotify. Sou bastante conhecido na comunidade
            brasileira de Minecraft, principalmente pelos vídeos e por ser um dos maiores
            contribuidores da Minecraft Wiki.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-2">
          <Link to="/blog" className="mc-btn mc-btn-solid">Ler o blog</Link>
          <a href="#redes" className="mc-btn">Minhas redes</a>
        </div>
      </section>

      {/* ── últimos posts ── */}
      {recentes.length > 0 && (
        <section className="mt-16">
          <p className="mc-label mc-seclabel text-[0.8rem] text-white/55 text-center mb-7 mx-auto max-w-[420px]">
            Últimos posts
          </p>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {recentes.map((p) => (
              <Link key={p.id} to={`/post/${p.slug}`}
                    className="mc-panel block overflow-hidden no-underline transition-transform duration-200 hover:-translate-y-1">
                {p.image_url && (
                  <div className="h-[140px] overflow-hidden border-b border-black">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-mc text-[0.98rem] text-white mb-2 leading-snug hover:text-mc-green-bright transition-colors">
                    {p.title}
                  </h3>
                  <span className="text-white/45 text-[0.75rem]">{p.date}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-7">
            <Link to="/blog" className="mc-btn">Ver todos os posts</Link>
          </div>
        </section>
      )}
    </main>
  );
}

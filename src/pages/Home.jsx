import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';

const WALL = '/assets/wallpaper.webp';
const SKIN_H = 'clamp(220px, 42vw, 380px)';

export default function Home() {
  const { posts, fetchPosts } = usePosts();

  useEffect(() => {
    document.title = 'Corelakes | Blog & Minecraft';
    fetchPosts();
  }, [fetchPosts]);

  const recentes = posts.slice(0, 5);

  return (
    <>
      <h1 className="sr-only">Corelakes | Blog & Minecraft</h1>

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
            <h2 className="font-mc-ten text-[1.6rem] text-white text-center mb-5 sm:text-[1.3rem]">Sobre mim</h2>
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
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/blog" className="mc-btn min-w-[190px]">Ver o blog</Link>
          <a href="#redes" className="mc-btn min-w-[190px]">Minhas redes</a>
        </div>

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
          </section>
        )}
      </main>
    </>
  );
}

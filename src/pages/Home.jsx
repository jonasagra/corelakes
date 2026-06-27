import { useEffect } from 'react';
import { Link } from 'react-router-dom';

/* moldura quadrada idêntica para as duas fotos (mesma largura e altura
   em qualquer tela, via clamp) */
const FRAME = { width: 'clamp(120px, 38vw, 168px)', height: 'clamp(120px, 38vw, 168px)' };

export default function Home() {
  useEffect(() => { document.title = 'Corelakes — Jonas Agra'; }, []);

  return (
    <main className="relative z-[1] max-w-[820px] mx-auto px-5 pt-[100px] pb-16">
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
          Engenharia de Software · Criador de Conteúdo
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
    </main>
  );
}

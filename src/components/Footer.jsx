import { Link } from 'react-router-dom';
import { SOCIALS } from '../data/socials';

export default function Footer() {
  return (
    <footer className="relative z-[10] mt-20 bg-mc-black border-t border-[#1d1d1d]">
      {/* siga + redes (alvo do botão "Minhas redes" da Home) */}
      <div id="redes" className="pt-10 pb-2 px-5 scroll-mt-[80px]">
        <p className="mc-label text-[0.95rem] text-white/80 text-center mb-5">Siga Corelakes</p>
        <div className="flex flex-wrap justify-center gap-[14px] max-w-[640px] mx-auto">
          {SOCIALS.map(({ href, img, alt }) => (
            <a key={alt} href={href} title={alt} aria-label={alt}
               target="_blank" rel="noreferrer noopener" className="mc-soc">
              <img src={img} alt="" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5">
        <div className="grid gap-8 py-9 border-t border-[#1d1d1d] sm:grid-cols-1"
             style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <img src="/logo.png" alt="Corelakes" className="h-8 w-auto mb-3" />
            <p className="text-white/55 text-[0.85rem] leading-relaxed max-w-[280px]">
              Uma marca pessoal de Jonas Agra.</p>
            <p className="text-white/40 text-[0.8rem] mt-3">João Pessoa · Paraíba</p>
          </div>

          <div>
            <h5 className="font-mc text-[1rem] uppercase tracking-[1px] text-white mb-3">Navegar</h5>
            <Link to="/"     className="block text-mc-green-link text-[0.85rem] py-1 no-underline hover:text-white">Início</Link>
            <Link to="/blog" className="block text-mc-green-link text-[0.85rem] py-1 no-underline hover:text-white">Blog</Link>
          </div>

          <div>
            <h5 className="font-mc text-[1rem] uppercase tracking-[1px] text-white mb-3">Contato</h5>
            <a href="https://jonasagra.com.br" target="_blank" rel="noreferrer noopener"
               className="block text-mc-green-link text-[0.85rem] py-1 no-underline hover:text-white">jonasagra.com.br</a>
            <a href="mailto:jonas.agra@icloud.com"
               className="block text-mc-green-link text-[0.85rem] py-1 no-underline hover:text-white">corelakes@gmail.com</a>
            <a href="https://br.minecraft.wiki/Usuário:Corelakes" target="_blank" rel="noreferrer noopener"
               className="block text-mc-green-link text-[0.85rem] py-1 no-underline hover:text-white">Minecraft Wiki</a>
          </div>
        </div>
      </div>

      <div className="bg-[#070708] py-4 px-5 text-center">
        <p className="font-mc text-[0.7rem] text-white/55 tracking-[0.5px]">© 2026 - Corelakes</p>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { SOCIALS } from '@/data/socials';

const linkCls = 'block font-mc text-[0.95rem] text-mc-green-link py-1 no-underline hover:text-white';

export default function Footer() {
  return (
    <footer className="relative z-[10] mt-20 bg-mc-black border-t border-[#1d1d1d]">
      <div id="redes" className="pt-10 pb-2 px-5 scroll-mt-[80px]">
        <p className="mc-label text-[0.95rem] text-white/80 text-center mb-5">Siga Corelakes</p>
        <div className="flex flex-wrap justify-center gap-[14px] max-w-[640px] mx-auto">
          {SOCIALS.map(({ href, img, alt }) => (
            <a key={alt} href={href} title={alt} aria-label={alt} target="_blank" rel="noreferrer noopener" className="mc-soc">
              <img src={img} alt="" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      <div className="max-w-[1100px] mx-auto px-5">
        <div className="grid gap-8 py-9 border-t border-[#1d1d1d] sm:grid-cols-1" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <img src="/logo.png" alt="Corelakes" className="h-8 w-auto mb-3" />
            <p className="font-mc text-[0.95rem] text-white/55 leading-relaxed max-w-[280px]">A marca pessoal de Jonas Agra.</p>
            <p className="font-mc text-[0.9rem] text-white/40 mt-3">João Pessoa · Paraíba</p>
          </div>
          <div>
            <h2 className="font-mc-ten text-[1.05rem] text-white mb-3">Navegar</h2>
            <Link href="/" className={linkCls}>Início</Link>
            <Link href="/blog" className={linkCls}>Blog</Link>
          </div>
          <div>
            <h2 className="font-mc-ten text-[1.05rem] text-white mb-3">Contato</h2>
            <a href="https://jonasagra.com.br" target="_blank" rel="noreferrer noopener" className={linkCls}>jonasagra.com.br</a>
            <a href="mailto:corelakes@gmail.com" className={linkCls}>corelakes@gmail.com</a>
            <a href="https://br.minecraft.wiki/Usuário:Corelakes" target="_blank" rel="noreferrer noopener" className={linkCls}>Minecraft Wiki</a>
          </div>
        </div>
      </div>
      <div className="bg-[#070708] py-4 px-5 text-center">
        <p className="font-mc text-[0.8rem] text-white/55 tracking-[0.5px]">© 2026 - Corelakes</p>
      </div>
    </footer>
  );
}

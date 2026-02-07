const SOCIALS = [
  { href:'https://namemc.com/corelakes',                          img:'/icons/socials_media/mcw-namemc-icon.webp',    alt:'NameMC' },
  { href:'https://x.com/corelakes',                               img:'/icons/socials_media/mcw-x-icon.webp',        alt:'Twitter/X' },
  { href:'https://facebook.com/jonasagra23br',                    img:'/icons/socials_media/mcw-facebook-icon.webp', alt:'Facebook' },
  { href:'https://linkedin.com/in/jonasagra',                     img:'/icons/socials_media/mcw-linkedin-icon.webp', alt:'LinkedIn' },
  { href:'https://youtube.com/@corelakes',                        img:'/icons/socials_media/mcw-youtube-icon.webp',  alt:'YouTube' },
  { href:'https://twitch.com/corelakes',                          img:'/icons/socials_media/mcw-twitch-icon.webp',   alt:'Twitch' },
  { href:'https://github.com/jonasagra',                          img:'/icons/socials_media/mcw-github-icon.webp',   alt:'GitHub' },
  { href:'https://bsky.app/profile/corelakes.bsky.social',        img:'/icons/socials_media/mcw-bluesky-icon.webp',  alt:'Bluesky' },
  { href:'https://discord.com/users/352909203091881988',          img:'/icons/socials_media/mcw-discord-icon.webp',  alt:'Discord' },
  { href:'https://br.minecraft.wiki/Usuário:Corelakes',           img:'/icons/socials_media/mcw-logo.webp',          alt:'Minecraft Wiki' },
  { href:'https://instagram.com/jnasagr',                         img:'/icons/socials_media/mcw-instagram-icon.webp',alt:'Instagram' },
];

export default function Home() {
  return (
    <>
      {/* grass gradient overlay */}
      <div className="fixed bottom-0 left-0 w-full h-[180px] pointer-events-none z-0"
           style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(60,133,39,0.1) 100%)' }} />

      <main className="relative z-[1] max-w-[800px] mx-auto px-5 pt-[100px] pb-[140px]">
        {/* ── profile section ── */}
        <section className="flex flex-col items-center text-center -mb-3">

          {/* photos row */}
          <div className="flex items-end justify-center gap-[15px] mb-[1px] sm:gap-[10px]">
            {/* Personal photo – larger frame */}
            <div className="relative p-1 mb-[10px] border-[4px] border-mc-dark"
                 style={{ background:'#48494a', boxShadow:'inset 0 -4px 0 #313233, inset 0 4px 0 #5a5b5c' }}>
              <div className="p-[6px] border-[3px] border-mc-dark overflow-hidden" style={{ background:'#313233' }}>
                <img src="/assets/personal.webp" alt="Jonas Agra"
                     className="w-[180px] h-[180px] object-cover sm:w-[130px] sm:h-[130px]"
                     style={{ objectPosition:'center bottom' }} />
              </div>
            </div>

            {/* Avatar photo */}
            <div className="relative p-[6px] mb-[10px] border-[4px] border-mc-dark"
                 style={{ background:'#48494a', boxShadow:'inset 0 -4px 0 #313233, inset 0 4px 0 #5a5b5c' }}>
              <div className="p-1 border-[2px] border-mc-dark overflow-hidden" style={{ background:'#313233' }}>
                <img src="/assets/avatar.webp" alt="Corelakes Avatar"
                     className="w-[180px] h-[180px] block object-cover sm:w-[60px] sm:h-[60px]"
                     style={{ objectPosition:'center -8px' }} />
              </div>
            </div>
          </div>

          {/* Logo */}
          <header>
            <img src="/assets/logo.webp" alt="Corelakes Logo"
                 className="w-[400px] h-auto mb-5 sm:w-[300px]" />
          </header>

          <p className="oreUI-text text-base leading-[1.6] max-w-[600px] mb-[30px] px-6 py-4 border-[4px] border-mc-dark sm:text-[0.9rem] sm:px-[18px] sm:py-[14px]"
             style={{ background:'#3c8527', boxShadow:'inset 0 -4px 0 #2d6a1e, inset 0 4px 0 #4ca632' }}>
            Eu sou Jonas Agra, conhecido como Corelakes. Sou estudante de Engenharia de Software, testador, designer e criador de conteúdo.
            Sou paraibano, administro a Minecraft Wiki em português e já lancei algumas músicas no Spotify.<br/><br/>Também sou bastante conhecido na comunidade brasileira de Minecraft, principalmente pelos vídeos e por ser um dos maiores contribuidores da Minecraft Wiki.
          </p>

          {/* Separator */}
          <div className="w-full max-w-[500px] h-1 mb-10 mt-[10px]"
               style={{ background:'#313233', borderTop:'1px solid #48494a', borderBottom:'1px solid #1e1e1f' }} />
        </section>

        {/* ── social section ── */}
        <section className="text-center">
          <h2 className="font-mc-five text-[1.3rem] text-white mb-5"
              style={{ textShadow:'2px 2px 0 #3f3f3f' }}>
            Redes Sociais
          </h2>

          <div className="mx-auto mb-5 px-[30px] py-6 border-[4px] border-mc-dark sm:px-[18px] sm:py-4"
               style={{ background:'#48494a', boxShadow:'inset 0 -4px 0 #313233, inset 0 4px 0 #5a5b5c', maxWidth:'600px', width:'90%' }}>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-[6px]">
              {SOCIALS.map(({ href, img, alt }) => (
                <a key={alt} href={href} title={alt}
                   className="flex items-center justify-center p-[6px] no-underline transition-transform duration-[150ms] hover:scale-[1.15]">
                  <img src={img} alt={alt} className="w-16 h-16 md:w-14 md:h-14 sm:w-12 sm:h-12" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

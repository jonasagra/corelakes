import { useLocation } from 'react-router-dom';

export default function Footer() {
  const loc = useLocation();
  // Show full contact info only on home page, minimal elsewhere
  const isHome = loc.pathname === '/';

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[100] py-5 px-5"
            style={{ background: 'rgba(40,40,40,0.7)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderTop: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -10px 40px rgba(0,0,0,0.3)' }}>
      <div className="max-w-[800px] mx-auto flex flex-col items-center gap-[10px]">

        {isHome && (
          <>
            {/* contact row */}
            <div className="flex flex-wrap justify-center gap-5 sm:flex-col sm:gap-[10px]">
              <a href="mailto:jonas.agra@icloud.com"
                 className="flex items-center gap-2 text-white/70 font-mc text-[0.85rem] no-underline hover:text-white transition-colors duration-300">
                <img src="/icons/email-icon.webp" alt="Email" className="w-4 h-4" />
                jonas.agra@icloud.com
              </a>
              <span className="text-white/40 font-thin hidden sm:hidden">|</span>
              <a href="https://wa.me/5583981306043"
                 className="flex items-center gap-2 text-white/70 font-mc text-[0.85rem] no-underline hover:text-white transition-colors duration-300">
                <img src="/icons/socials_media/mcw-whatsapp-icon.webp" alt="WhatsApp" className="w-5 h-5" />
                (83) 98130-6043
              </a>
            </div>

            {/* location */}
            <div className="flex justify-center items-center gap-2">
              <img src="/icons/compass-icon.gif" alt="Location" className="w-4 h-4" />
              <span className="text-white/70 font-mc text-[0.85rem]">João Pessoa - Paraíba</span>
            </div>
          </>
        )}

        <p className="font-['Minecraft-Bold'] font-bold text-[0.6rem] text-white/80 tracking-[0.5px]">
          © 2026 Jonas Agra - Corelakes
        </p>
      </div>
    </footer>
  );
}

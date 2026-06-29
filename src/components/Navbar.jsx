import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

/* Hambúrguer-cubo Minecraft — paleta OFICIAL do minecraft.net */
const HamburgerSVG = () => (
  <svg viewBox="0 0 40 46" className="w-9 h-[42px]" xmlns="http://www.w3.org/2000/svg">
    <path fill="#2a641c" d="M20,0L0,11v22l20,11l20-11V11L20,0z" />
    <path fill="#2b2827" d="M20,44L0,33V11L20,0l20,11v22L20,44z M2,31.8l18,9.9l18-9.9V12.2L20,2.3L2,12.2V31.8z" />
    <path fill="#ffffff" d="M14,17h12v2H14V17z M14,21h12v2H14V21z M14,25h12v2H14V25z" />
    <polygon fill="#52a535" points="2,15 20,5.3 38,15 38,12.2 20,2.3 2,12.2" />
    <polygon fill="#2a641c" points="2,31.8 20,41.7 38,31.8 38,29 20,38.7 2,29" />
    <polygon fill="#000000" points="0,34.8 20,46 40,34.8 40,33 20,44 0,33" />
  </svg>
);

const LINKS = [
  { to: '/',     icon: '/icons/home.webp',    label: 'Início' },
  { to: '/blog', icon: '/icons/journal.webp', label: 'Blog' },
];

export default function Navbar({ isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  const navItems = isAdmin
    ? [...LINKS, { to: '/admin', icon: '/icons/admin.webp', label: 'Dashboard' }]
    : LINKS;

  const linkBase =
    'relative flex items-center gap-2 px-4 h-[68px] font-mc text-[0.95rem] uppercase tracking-[1px] no-underline transition-colors duration-200';

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] bg-[#1d1d1d] border-b-2 border-black shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-[68px]">

        <NavLink to="/" className="flex items-center shrink-0" onClick={close}>
          <img src="/logo.png" alt="Corelakes" className="h-8 w-auto" />
        </NavLink>

        <div className="hidden md:flex items-center">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                linkBase + ' ' + (isActive ? 'text-white' : 'text-white/80 hover:text-white hover:bg-white/5')
              }
            >
              {({ isActive }) => (
                <>
                  <img src={icon} alt="" aria-hidden="true" className="w-5 h-5" />
                  <span>{label}</span>
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-mc-green-bright" />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <button
          className="md:hidden bg-transparent border-none cursor-pointer p-1 z-[202]"
          aria-label="Abrir o menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          <HamburgerSVG />
        </button>
      </div>

      <div
        className="fixed top-0 left-0 w-full h-screen bg-mc-nav z-[201] overflow-y-auto pt-[68px] transition-transform duration-300 md:hidden"
        style={{ transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <NavLink to="/" className="flex items-center px-5 py-5 border-b border-white/10" onClick={close}>
          <img src="/logo.png" alt="Corelakes" className="h-8 w-auto" />
        </NavLink>

        <div className="flex flex-col">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={close}
              className={({ isActive }) =>
                'flex items-center justify-between px-6 py-5 font-mc text-[1.05rem] uppercase tracking-[1px] no-underline border-b border-white/10 transition-colors duration-200 ' +
                (isActive ? 'text-white bg-white/5 border-l-4 border-l-mc-green-bright' : 'text-white/85 hover:bg-white/5')
              }
            >
              <span className="flex items-center gap-4">
                <img src={icon} alt="" aria-hidden="true" className="w-6 h-6" />
                {label}
              </span>
              <span className="text-white/40 text-[1.2rem]">&rsaquo;</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

/* Minecraft-cube SVG hamburger icon – paths/colours match the original */
const HamburgerSVG = () => (
  <svg viewBox="0 0 40 46" className="w-10 h-[46px]" xmlns="http://www.w3.org/2000/svg">
    <path fill="#3c8527" d="M20,0L0,11v22l20,11l20-11V11L20,0z"/>
    <path fill="#0e7815" d="M20,44L0,33V11L20,0l20,11v22L20,44z M2,31.8l18,9.9l18-9.9V12.2L20,2.3L2,12.2V31.8z"/>
    <path fill="#ffffff" d="M14,17h12v2H14V17z M14,21h12v2H14V21z M14,25h12v2H14V25z"/>
    <polygon fill="#138e0e" points="2,15 20,5.3 38,15 38,12.2 20,2.3 2,12.2"/>
    <polygon fill="#138e0e" points="2,31.8 20,41.7 38,31.8 38,29 20,38.7 2,29"/>
    <polygon fill="#138e0e" points="0,34.8 20,46 40,34.8 40,33 20,44 0,33"/>
  </svg>
);

const LINKS = [
  { to: '/',      
    icon: '/icons/home.webp',           
    label: 'Início' },
  { to: '/blog',  
    icon: '/icons/journal.webp',        
    label: 'Blog' },
];

export default function Navbar({ isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  location.pathname;
  
  const isBlog = location.pathname === '/blog';
  const isPost = location.pathname === "/post";
  const isDashboard = location.pathname === "/admin";

  const contentHeader = isBlog || isPost || isDashboard;
  const showLogotipo = contentHeader;


  // body scroll-lock
  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  // build nav items; append admin link only when authenticated
  const navItems = isAdmin
    ? [...LINKS, { to: '/admin', icon: '/icons/redstone-sysop.webp', label: 'Dashboard' }]
    : LINKS;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] bg-mc-nav border-b-2 border-black shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* ── top bar ── */}
      <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-center h-16">
      
      {/* Aparecer apenas no blog e posts */}
      { showLogotipo && (
         <div className="flex items-center px-5 py-4">
         <NavLink to="/" className="flex items-center px-3">
         <img src="/assets/logo.webp" alt="Corelakes logo" className="h-9 w-auto"/>  
        </NavLink>
        </div>
        ) 
        }

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                'relative flex items-center gap-2 px-4 h-16 text-white font-mc text-[0.9rem] no-underline transition-colors duration-200 ' +
                (isActive ? 'bg-mc-green' : 'hover:bg-white/10')
              }
            >
              {({ isActive }) => (
                <>
                  <img src={icon} alt={label} className="w-6 h-6" />
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-mc-green-light" />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden bg-transparent border-none cursor-pointer p-2 z-[202]"
          aria-label="Abrir o menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          <HamburgerSVG />
        </button>
      </div>


      {/* ── mobile slide panel ── */}
      <div
        className="fixed top-0 left-0 w-full h-screen bg-mc-nav z-[201] overflow-y-auto pt-16 transition-transform duration-300 md:hidden"
        style={{ transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {/* logo inside panel */}
        <NavLink to="/" className="flex items-center px-5 py-4" onClick={close}>
          <img src="/assets/logo.webp" alt="Corelakes logo" className="h-9 w-auto" />
        </NavLink>

        <div className="flex flex-col py-5">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={close}
              className={({ isActive }) =>
                'flex items-center justify-between px-7 py-5 text-white font-mc text-[1.1rem] no-underline border-b border-white/10 transition-colors duration-200 ' +
                (isActive ? 'bg-mc-green' : 'hover:bg-white/10')
              }
            >
              <span className="flex items-center gap-4">
                <img src={icon} alt={label} className="w-6 h-6" />
                {label}
              </span>
              <span className="text-white/50 font-mc text-[1.2rem]">&gt;</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

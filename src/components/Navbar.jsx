'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

// Hexágono do menu: vira X quando aberto (mesmo ícone, dois estados)
const MenuIcon = ({ open }) => (
  <svg viewBox="0 0 40 46" className="w-9 h-[42px]" xmlns="http://www.w3.org/2000/svg">
    <path fill="#2a641c" d="M20,0L0,11v22l20,11l20-11V11L20,0z" />
    <path fill="#2b2827" d="M20,44L0,33V11L20,0l20,11v22L20,44z M2,31.8l18,9.9l18-9.9V12.2L20,2.3L2,12.2V31.8z" />
    {open ? (
      <path d="M15.5 17.5 L24.5 26.5 M24.5 17.5 L15.5 26.5"
            stroke="#ffffff" strokeWidth="2.4" strokeLinecap="square" fill="none" />
    ) : (
      <path fill="#ffffff" d="M14,17h12v2H14V17z M14,21h12v2H14V21z M14,25h12v2H14V25z" />
    )}
    <polygon fill="#52a535" points="2,15 20,5.3 38,15 38,12.2 20,2.3 2,12.2" />
    <polygon fill="#2a641c" points="2,31.8 20,41.7 38,31.8 38,29 20,38.7 2,29" />
    <polygon fill="#000000" points="0,34.8 20,46 40,34.8 40,33 20,44 0,33" />
  </svg>
);

const LINKS = [
  { to: '/', icon: '/icons/home.webp', label: 'Início' },
  { to: '/blog', icon: '/icons/journal.webp', label: 'Blog' },
];

// Sub-opções da dashboard (mobile). "Visão geral" não entra na lista:
// tocar no cabeçalho DASHBOARD já leva pra ela — sem redundância.
const DOOR_ICON = 'https://minecraft.wiki/images/Oak_Door_JE8.png?f3318&format=original';

const ADMIN_LINKS = [
  { to: '/admin?view=create',     icon: '/icons/new-post-icon.png',      label: 'Criar postagem' },
  { to: '/admin?view=posts',      icon: '/icons/edit-post.png',          label: 'Editar postagens' },
  { to: '/admin?view=drafts',     icon: '/icons/drafts-icon.png',        label: 'Rascunhos' },
  { to: '/admin?view=categories', icon: '/icons/edit-category-icon.png', label: 'Configurar categorias' },
  { to: '/admin?view=metrics',    icon: '/icons/metrics-icon.gif',       label: 'Métricas gerais' },
  { to: '/admin?view=security',   icon: '/icons/security-icon.png',      label: 'Segurança e privacidade' },
];

export default function Navbar({ isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const close = () => setMenuOpen(false);
  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));
  const desktopItems = isAdmin ? [...LINKS, { to: '/admin', icon: '/icons/admin.webp', label: 'Dashboard' }] : LINKS;

  const handleLogout = async () => {
    close();
    await logout();
    window.location.href = '/admin'; // recarrega e cai na tela de login
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] bg-mc-nav border-b-2 border-black shadow-[0_4px_20px_rgba(0,0,0,0.5)]">

      {/* barra superior: fica VISÍVEL mesmo com o menu aberto */}
      <div className="relative z-[202] bg-mc-nav max-w-[1200px] mx-auto px-5 flex items-center justify-between h-[68px]">
        <Link href="/" className="flex items-center shrink-0" onClick={close}>
          <img src="/logo.png" alt="Corelakes" className="h-8 w-auto" />
        </Link>

        {/* links desktop: abas de altura cheia com barra verde no ativo */}
        <div className="hidden md:flex items-center">
          {desktopItems.map(({ to, icon, label }) => {
            const active = isActive(to);
            return (
              <Link key={to} href={to} onClick={close}
                    className={'relative flex items-center gap-2 px-4 h-[68px] font-mc-pixel text-[0.95rem] uppercase tracking-[1px] no-underline transition-colors duration-200 ' + (active ? 'text-white' : 'text-white/80 hover:text-white hover:bg-white/5')}>
                <img src={icon} alt="" aria-hidden="true" className="w-5 h-5" />
                <span>{label}</span>
                {active && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-mc-green-bright" />}
              </Link>
            );
          })}
        </div>

        {/* hambúrguer / X (mobile) */}
        <button
          className="md:hidden bg-transparent border-none cursor-pointer p-1"
          aria-label={menuOpen ? 'Fechar o menu' : 'Abrir o menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {/* ── menu mobile: desliza abaixo da barra, sem logo duplicado ── */}
      <div
        className={`md:hidden fixed inset-x-0 top-[68px] bottom-0 z-[201] bg-[#0a0a0b] border-t-2 border-black overflow-y-auto overscroll-contain transition-all duration-300 ${
          menuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* linhas planas com fios finos e chevron (como o menu do minecraft.net) */}
        <div className="flex flex-col pb-16">

          {LINKS.map(({ to, icon, label }) => {
            const active = isActive(to);
            return (
              <Link key={to} href={to} onClick={close}
                    className={'flex items-center justify-between px-5 py-[15px] font-mc-pixel text-[0.92rem] uppercase tracking-[1px] no-underline border-b border-white/10 transition-colors ' + (active ? 'text-white border-l-4 border-l-mc-green-bright bg-white/[0.03]' : 'text-white/85 active:bg-white/5')}>
                <span className="flex items-center gap-4">
                  <img src={icon} alt="" aria-hidden="true" className="w-5 h-5" />
                  {label}
                </span>
                <span className="text-white/35 text-[1.1rem] leading-none" aria-hidden="true">›</span>
              </Link>
            );
          })}

          {/* DASHBOARD: o cabeçalho decorado É o item (leva à Visão geral) */}
          {isAdmin && (
            <>
              <Link href="/admin?view=overview" onClick={close}
                    className={'flex items-center justify-between px-5 py-[15px] font-mc-pixel text-[0.92rem] uppercase tracking-[1px] no-underline border-b border-white/10 transition-colors ' + (isActive('/admin') ? 'text-white border-l-4 border-l-mc-green-bright bg-white/[0.03]' : 'text-white/85 active:bg-white/5')}>
                <span className="flex items-center gap-4">
                  <img src="/icons/admin.webp" alt="" aria-hidden="true" className="w-5 h-5" />
                  Dashboard
                </span>
                <span className="text-white/35 text-[1.1rem] leading-none" aria-hidden="true">›</span>
              </Link>

              {/* sub-opções: mesmas linhas, recuadas e menores */}
              {ADMIN_LINKS.map(({ to, icon, label }) => (
                <Link key={to} href={to} onClick={close}
                      className="flex items-center gap-3 pl-10 pr-5 py-[12px] font-mc-pixel text-[0.78rem] text-white/60 no-underline border-b border-white/5 active:text-white transition-colors">
                  <img src={icon} alt="" aria-hidden="true" className="w-[18px] h-[18px] object-contain" />
                  {label}
                </Link>
              ))}
              <button type="button" onClick={handleLogout}
                      className="flex items-center gap-3 pl-10 pr-5 py-[12px] text-left font-mc-pixel text-[0.78rem] text-[#ff8a8a] bg-transparent border-0 border-b border-white/5 cursor-pointer active:text-white transition-colors">
                <img src={DOOR_ICON} alt="" aria-hidden="true" className="w-[18px] h-[18px] object-contain" />
                Sair da conta
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

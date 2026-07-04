'use client';

import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Particles from '@/components/Particles';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import BackToTop from '@/components/BackToTop';

export default function RootShell({ children }) {
  const { isAdmin } = useAuth();
  const pathname = usePathname();

  // O painel admin (e o editor em tela cheia) não têm footer — é o "CMS".
  const hideFooter = pathname?.startsWith('/admin');

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <Particles />
      <Toast />
      <ConfirmModal />
      {children}
      {/* fora do <main> (que tem z-index próprio): fica na FRENTE do footer */}
      <BackToTop />
      {!hideFooter && <Footer />}
    </>
  );
}

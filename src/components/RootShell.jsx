'use client';

import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Particles from '@/components/Particles';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

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
      {!hideFooter && <Footer />}
    </>
  );
}

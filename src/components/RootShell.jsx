'use client';

import useAuth from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Particles from '@/components/Particles';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function RootShell({ children }) {
  const { isAdmin } = useAuth();

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <Particles />
      <Toast />
      <ConfirmModal />
      {children}
      <Footer />
    </>
  );
}

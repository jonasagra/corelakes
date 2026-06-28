import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Navbar    from './components/Navbar';
import Footer   from './components/Footer';
import Particles from './components/Particles';
import Toast     from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import Home      from './pages/Home';
import Blog      from './pages/Blog';
import Post      from './pages/Post';
const Admin = lazy(() => import('./pages/admin/Admin'));

export default function App() {
  const { isAdmin } = useAuth();

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <Particles />
      <Toast />
      <ConfirmModal />

      <Suspense fallback={<div className="pt-[110px] text-center text-white/50">Carregando…</div>}>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/blog"        element={<Blog isAdmin={isAdmin} />} />
          <Route path="/post/:slug"  element={<Post />} />
          <Route path="/admin"       element={<Admin />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  );
}

import { Routes, Route } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Navbar    from './components/Navbar';
import Footer   from './components/Footer';
import Particles from './components/Particles';
import Toast     from './components/Toast';
import Home      from './pages/Home';
import Blog      from './pages/Blog';
import Post      from './pages/Post';
import Admin     from './pages/Admin';

export default function App() {
  const { isAdmin } = useAuth();

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <Particles />
      <Toast />

      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/blog"        element={<Blog isAdmin={isAdmin} />} />
        <Route path="/post/:slug"  element={<Post />} />
        <Route path="/admin"       element={<Admin />} />
      </Routes>

      <Footer />
    </>
  );
}

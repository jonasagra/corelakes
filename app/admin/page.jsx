'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import usePosts from '@/hooks/usePosts';
import { showToast } from '@/components/Toast';
import { confirmDialog } from '@/components/ConfirmModal';
import { ApiUploader } from '@/utils/imageProcessor';
import { OreButton, OreInput } from './components/AdminControls';
import PostEditor from './components/PostEditor';
import InfoPostsTab from './components/InfoPostsTab';
import SecurityTab from './components/SecurityTab';

function LoginSection({ onLoggedIn }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needCode, setNeedCode] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { showToast('Preencha e-mail e senha!', 'error'); return; }
    if (needCode && !code.trim()) { showToast('Digite o código do app!', 'error'); return; }
    setBusy(true);
    try {
      const r = await login(email.trim(), password.trim(), code.trim() || undefined);
      if (r?.twofa) { setNeedCode(true); showToast('Digite o código do seu app autenticador.', 'success'); return; }
      showToast('Login realizado com sucesso!', 'success');
      onLoggedIn();
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mc-panel p-[30px] mb-5">
      <h1 className="font-mc-five text-[1.5rem] text-white mb-[10px] flex items-center justify-center gap-3" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
        <img src="/icons/MCL_Lock_Icon.png" alt="" aria-hidden="true" className="w-7 h-7" />
        DASHBOARD
      </h1>
      <p className="font-mc text-[0.9rem] text-white/70 text-center mb-[25px]">
        {needCode ? 'Verificação em duas etapas' : 'Faça login para acessar o painel'}
      </p>
      <div className="flex flex-col gap-[10px]">
        {!needCode && (
          <>
            <OreInput label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <OreInput label="Senha" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </>
        )}
        {needCode && (
          <OreInput label="Código de verificação (6 dígitos)" type="text" inputMode="numeric" autoComplete="one-time-code"
                   placeholder="000000" value={code} maxLength={6}
                   onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                   onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        )}
        <OreButton variant="primary" disabled={busy} onClick={handleLogin}>
          {busy ? 'Entrando...' : (needCode ? 'Verificar' : 'Entrar')}
        </OreButton>
      </div>
    </section>
  );
}

function Dashboard({ onLogout }) {
  const { user, refresh } = useAuth();
  const { posts, fetchPosts, createPost, updatePost, deletePost } = usePosts();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFetchedRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchPosts();
    }
  }, [fetchPosts]);

  useEffect(() => {
    const slug = searchParams.get('edit');
    if (slug && posts.length) {
      const p = posts.find(x => x.slug === slug);
      if (p) fillEditor(p);
    }
  }, [searchParams, posts]);

  const fillEditor = (p) => {
    setEditId(p.id);
    setTitle(p.title);
    setExcerpt(p.excerpt || '');
    setImageUrl(p.image_url || '');
    setContent(p.content);
    setActiveTab('create');
  };

  const clearEditor = () => {
    setEditId(null);
    setTitle('');
    setExcerpt('');
    setImageUrl('');
    setContent('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('Processando...');
    try {
      const uploader = new ApiUploader();
      const url = await uploader.upload(file);
      setImageUrl(url);
      showToast('Imagem enviada!', 'success');
    } catch (err) {
      showToast('Erro no upload: ' + err.message, 'error');
    } finally {
      setUploading('');
    }
  };

  const publish = async () => {
    if (!title.trim()) { showToast('Adicione um título!', 'error'); return; }
    if (!content.trim()) { showToast('Escreva algum conteúdo!', 'error'); return; }
    setPublishing(true);
    try {
      if (editId) {
        await updatePost(editId, { title: title.trim(), content, excerpt: excerpt.trim(), imageUrl });
        showToast('Post atualizado!', 'success');
      } else {
        await createPost({ title: title.trim(), content, excerpt: excerpt.trim(), imageUrl });
        showToast('Post criado com sucesso!', 'success');
      }
      clearEditor();
      setActiveTab('posts');
      hasFetchedRef.current = false;
      await fetchPosts();
      router.push('/admin');
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  // sai do editor em tela cheia (limpa estado e volta pra lista)
  const exitEditor = () => {
    clearEditor();
    setActiveTab('posts');
    router.push('/admin'); // remove o ?edit= da URL
  };

  const handleDelete = async (id) => {
    const ok = await confirmDialog({ title: 'Excluir post?', message: 'Essa ação não pode ser desfeita.', confirmText: 'Excluir', danger: true });
    if (!ok) return;
    try {
      await deletePost(id);
      showToast('Post excluído!', 'success');
      hasFetchedRef.current = false;
      await fetchPosts();
    } catch (e) {
      showToast('Erro ao excluir: ' + e.message, 'error');
    }
  };

  const lastDate = posts.length
    ? new Date(posts[0].created_at).toLocaleDateString('pt-BR')
    : '—';

  return (
    <>
      <header className="flex justify-between items-center mb-[30px]">
        <h1 className="font-mc-five text-[2rem] text-white" style={{ textShadow: '3px 3px 0 #3f3f3f' }}>
          <span className="inline-flex items-center gap-2">
            <img src="/icons/admin.webp" alt="Dashboard" className="oreUI-icon" />
            Dashboard
          </span>
        </h1>
        <OreButton variant="danger" onClick={onLogout}>
          <span className="inline-flex items-center gap-2">
            <img src="https://minecraft.wiki/images/Oak_Door_JE8.png?f3318&format=original" alt="Sair" className="oreUI-icon" />
            <span className="hidden sm:inline">Sair</span>
          </span>
        </OreButton>
      </header>

      <div className="mc-panel p-2 mb-[30px]">
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ['posts', 'Informações de posts'],
            ['create', editId ? 'Editando post' : 'Criar post'],
            ['security', 'Segurança'],
          ].map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`font-mc text-[0.78rem] px-3 py-3 border border-black transition-colors ${
                activeTab === tab
                  ? 'bg-mc-green text-white'
                  : 'bg-[#1b1b1c] text-white/70 hover:text-white hover:border-mc-green-bright'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'posts' && (
        <InfoPostsTab posts={posts} lastDate={lastDate} onEdit={fillEditor} onDelete={handleDelete} />
      )}

      {activeTab === 'create' && (
        <PostEditor
          key={editId ?? 'new'} /* remonta o editor ao trocar de post */
          editId={editId}
          title={title}
          setTitle={setTitle}
          excerpt={excerpt}
          setExcerpt={setExcerpt}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          content={content}
          setContent={setContent}
          uploading={uploading}
          publishing={publishing}
          onImageUpload={handleImageUpload}
          onPublish={publish}
          onExit={exitEditor}
        />
      )}

      {activeTab === 'security' && (
        <SecurityTab enabled={!!user?.twofaEnabled} onChanged={refresh} />
      )}
    </>
  );
}

// IMPORTANTE: definido FORA do componente. Se ficasse dentro de Admin, viraria
// um componente novo a cada render, e o React desmontaria/remontaria tudo que
// está dentro (Dashboard + editor Quill) — causando reset de aba e o editor
// "sumindo". Mantê-lo aqui fora preserva a árvore entre renders.
const Wrap = ({ children }) => (
  <main className="relative z-[1] max-w-[1000px] mx-auto px-5 pt-[100px] pb-[140px]">
    {children}
  </main>
);

export default function AdminPage() {
  const { user, loading, checkSession, logout } = useAuth();
  const [view, setView] = useState('loading');

  useEffect(() => {
    (async () => {
      await checkSession();
    })();
  }, [checkSession]);

  useEffect(() => {
    if (loading) { setView('loading'); return; }
    setView(user ? 'dashboard' : 'login');
  }, [loading, user]);

  const handleLogout = async () => {
    await logout();
    showToast('Você saiu da dashboard.', 'success');
    setView('login');
  };

  if (view === 'loading') return (
    <Wrap><p className="font-mc text-base text-white/50 text-center py-[60px]">Carregando...</p></Wrap>
  );

  if (view === 'login') return (
    <Wrap>
      <LoginSection onLoggedIn={() => setView('dashboard')} />
    </Wrap>
  );

  return (
    <Wrap><Dashboard onLogout={handleLogout} /></Wrap>
  );
}

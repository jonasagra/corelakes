'use client';

// ── Dashboard (CMS) ─────────────────────────────────────────────
// Estrutura estilo WordPress: menu lateral com grupos e sub-opções.
//   Postagens: criar, editar (lista + filtros), rascunhos, categorias, métricas
//   Segurança e privacidade: 2FA e sessões
// O editor (PostEditor) abre em tela cheia por cima do painel.
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import usePosts from '@/hooks/usePosts';
import useCategories from '@/hooks/useCategories';
import { showToast } from '@/components/Toast';
import { confirmDialog } from '@/components/ConfirmModal';
import { ApiUploader } from '@/utils/imageProcessor';
import { OreButton, OreInput } from './components/AdminControls';
import PostEditor from './components/PostEditor';
import OverviewTab from './components/OverviewTab';
import PostsTable from './components/PostsTable';
import CategoriesTab from './components/CategoriesTab';
import MetricsTab from './components/MetricsTab';
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
    <section className="mc-panel p-[30px] mb-5 max-w-[520px] mx-auto">
      <h1 className="font-mc-five text-[1.5rem] text-white mb-[10px] flex items-center justify-center gap-3" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
        <img src="/icons/MCL_Lock_Icon.png" alt="" aria-hidden="true" className="w-7 h-7" />
        DASHBOARD
      </h1>
      <p className="text-[0.9rem] text-white/70 text-center mb-[25px]">
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

/* ── Menu lateral (estilo WordPress) ───────────────────────────── */
const DOOR_ICON = 'https://minecraft.wiki/images/Oak_Door_JE8.png?f3318&format=original';

const MENU = [
  {
    group: 'Painel',
    items: [
      { id: 'overview', icon: '/icons/compass.gif', label: 'Visão geral' },
    ],
  },
  {
    group: 'Informações de postagens',
    items: [
      { id: 'create',     icon: '/icons/new-post-icon.png',      label: 'Criar postagem' },
      { id: 'posts',      icon: '/icons/edit-post.png',          label: 'Editar postagens' },
      { id: 'drafts',     icon: '/icons/drafts-icon.png',        label: 'Rascunhos' },
      { id: 'categories', icon: '/icons/edit-category-icon.png', label: 'Configurar categorias' },
      { id: 'metrics',    icon: '/icons/metrics-icon.gif',       label: 'Métricas gerais' },
    ],
  },
  {
    group: 'Segurança e privacidade',
    items: [
      { id: 'security', icon: '/icons/security-icon.png', label: '2FA e sessões' },
    ],
  },
];

// Menu lateral: só em telas ≥ md. No mobile, as mesmas opções vivem no
// menu hambúrguer da navbar (links /admin?view=...).
function Sidebar({ view, onNavigate, draftCount, onLogout }) {
  return (
    <aside className="hidden md:block md:w-[240px] shrink-0">
      {/* placas com entalhe 3D sobre fundo preto (ref. minecraft.net) */}
      <nav className="bg-[#0a0a0b] border border-black p-[3px] md:sticky md:top-[86px]">
        <div className="flex flex-col gap-[3px]">
          {MENU.map(({ group, items }) => (
            <div key={group} className="flex flex-col gap-[3px]">
              <p className="text-[0.66rem] uppercase tracking-[1.5px] text-white/35 px-2 pt-3 pb-1 font-semibold">
                {group}
              </p>
              {items.map(({ id, icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onNavigate(id)}
                  className={`flex items-center gap-[10px] whitespace-nowrap text-left font-mc-pixel text-[0.78rem] px-3 py-[10px] ${
                    view === id ? 'mc-bevel-green text-white' : 'mc-bevel text-white/70 hover:text-white'
                  }`}
                >
                  <img src={icon} alt="" aria-hidden="true" className="w-[18px] h-[18px] object-contain shrink-0" />
                  <span className="flex-1">{label}</span>
                  {id === 'drafts' && draftCount > 0 && (
                    <span className="px-[6px] py-[1px] text-[0.68rem] bg-mc-gold text-black font-bold">{draftCount}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={onLogout}
            className="mc-bevel flex items-center gap-[10px] text-left font-mc-pixel text-[0.78rem] px-3 py-[10px] text-[#ff8a8a] hover:text-white mt-3"
          >
            <img src={DOOR_ICON} alt="" aria-hidden="true" className="w-[18px] h-[18px] object-contain shrink-0" />
            Sair da conta
          </button>
        </div>
      </nav>
    </aside>
  );
}

function Dashboard({ onLogout }) {
  const { user, refresh } = useAuth();
  const { posts, fetchPosts, createPost, updatePost, deletePost } = usePosts();
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFetchedRef = useRef(false);

  const [view, setView] = useState('overview');
  const [editorOpen, setEditorOpen] = useState(false);

  // campos do post em edição
  const [editId, setEditId] = useState(null);
  const [postStatus, setPostStatus] = useState('published');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState('');
  const [publishing, setPublishing] = useState(false);

  const refetchAll = useCallback(() => {
    fetchPosts({ all: true });
    fetchCategories();
  }, [fetchPosts, fetchCategories]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refetchAll();
    }
  }, [refetchAll]);

  // /admin?view=... → navegação vinda do menu hambúrguer (mobile)
  useEffect(() => {
    const v = searchParams.get('view');
    if (!v) return;
    if (v === 'create') {
      clearEditor();
      setEditorOpen(true);
    } else if (['overview', 'posts', 'drafts', 'categories', 'metrics', 'security'].includes(v)) {
      setEditorOpen(false);
      setView(v);
    }
    router.replace('/admin'); // limpa o parâmetro (permite clicar de novo)
  }, [searchParams, router]);

  // /admin?edit=slug → abre direto no editor (só se ele ainda não está aberto,
  // para o refetch em segundo plano não sobrescrever o que está sendo editado)
  useEffect(() => {
    if (editorOpen) return;
    const slug = searchParams.get('edit');
    if (slug && posts.length) {
      const p = posts.find(x => x.slug === slug);
      if (p) fillEditor(p);
    }
  }, [searchParams, posts, editorOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const fillEditor = (p) => {
    setEditId(p.id);
    setPostStatus(p.status || 'published');
    setTitle(p.title);
    setExcerpt(p.excerpt || '');
    setImageUrl(p.image_url || '');
    setContent(p.content);
    setCategoryId(p.category_id ? Number(p.category_id) : null);
    setFeatured(!!p.featured);
    setEditorOpen(true);
  };

  const clearEditor = () => {
    setEditId(null);
    setPostStatus('published');
    setTitle('');
    setExcerpt('');
    setImageUrl('');
    setContent('');
    setCategoryId(null);
    setFeatured(false);
  };

  const openNew = () => { clearEditor(); setEditorOpen(true); };

  const exitEditor = () => {
    clearEditor();
    setEditorOpen(false);
    setView('posts');
    router.push('/admin'); // remove o ?edit= da URL
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

  // salva o post com o status desejado ('draft' mantém no rascunho)
  const save = async (statusWanted) => {
    if (!title.trim()) { showToast('Adicione um título!', 'error'); return; }
    if (statusWanted === 'published' && !content.trim()) { showToast('Escreva algum conteúdo!', 'error'); return; }
    setPublishing(true);
    try {
      const payload = { title: title.trim(), content, excerpt: excerpt.trim(), imageUrl, status: statusWanted, featured, categoryId };
      if (editId) {
        await updatePost(editId, payload);
      } else {
        const created = await createPost(payload);
        setEditId(created.id); // próximo "salvar" atualiza em vez de duplicar
      }

      if (statusWanted === 'draft') {
        setPostStatus('draft');
        showToast('Rascunho salvo!', 'success');
        fetchPosts({ all: true }); // atualiza a lista em segundo plano
      } else {
        showToast(editId ? 'Post atualizado!' : 'Post publicado!', 'success');
        clearEditor();
        setEditorOpen(false);
        setView('posts');
        await fetchPosts({ all: true });
        router.push('/admin');
      }
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirmDialog({ title: 'Excluir post?', message: 'Essa ação não pode ser desfeita.', confirmText: 'Excluir', danger: true });
    if (!ok) return;
    try {
      await deletePost(id);
      showToast('Post excluído!', 'success');
      fetchPosts({ all: true });
    } catch (e) {
      showToast('Erro ao excluir: ' + e.message, 'error');
    }
  };

  // callbacks de categorias (atualizam listas depois de cada mudança)
  const catCreate = async (data) => { await createCategory(data); refetchAll(); };
  const catUpdate = async (id, data) => { await updateCategory(id, data); refetchAll(); };
  const catDelete = async (id) => { await deleteCategory(id); refetchAll(); };

  const publishedPosts = posts.filter((p) => p.status !== 'draft');
  const draftPosts = posts.filter((p) => p.status === 'draft');

  const navigate = (id) => {
    if (id === 'create') { openNew(); return; }
    setView(id);
  };

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-mc-five text-[1.6rem] text-white flex items-center gap-2" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
          <img src="/icons/admin.webp" alt="" aria-hidden="true" className="oreUI-icon" />
          Dashboard
        </h1>
        <p className="text-[0.8rem] text-white/40">{user?.email}</p>
      </header>

      <div className="flex flex-col md:flex-row gap-5 items-start">
        <Sidebar view={view} onNavigate={navigate} draftCount={draftPosts.length} onLogout={onLogout} />

        <div className="flex-1 min-w-0 w-full">
          {view === 'overview' && (
            <OverviewTab
              posts={posts}
              categories={categories}
              onEdit={fillEditor}
              onNew={openNew}
              onNavigate={setView}
            />
          )}

          {view === 'posts' && (
            <PostsTable
              title="Editar postagens"
              posts={publishedPosts}
              categories={categories}
              onEdit={fillEditor}
              onDelete={handleDelete}
              emptyText="Nenhum post publicado ainda."
            />
          )}

          {view === 'drafts' && (
            <PostsTable
              title="Rascunhos"
              posts={draftPosts}
              categories={categories}
              onEdit={fillEditor}
              onDelete={handleDelete}
              emptyText="Nenhum rascunho. Use 'Salvar rascunho' no editor para guardar um post sem publicar."
            />
          )}

          {view === 'categories' && (
            <CategoriesTab
              categories={categories}
              onCreate={catCreate}
              onUpdate={catUpdate}
              onDelete={catDelete}
            />
          )}

          {view === 'metrics' && <MetricsTab posts={posts} categories={categories} />}

          {view === 'security' && (
            <SecurityTab enabled={!!user?.twofaEnabled} onChanged={refresh} />
          )}
        </div>
      </div>

      {editorOpen && (
        <PostEditor
          key={editId ?? 'new'}
          editId={editId}
          status={postStatus}
          title={title} setTitle={setTitle}
          excerpt={excerpt} setExcerpt={setExcerpt}
          imageUrl={imageUrl} setImageUrl={setImageUrl}
          content={content} setContent={setContent}
          categories={categories}
          categoryId={categoryId} setCategoryId={setCategoryId}
          featured={featured} setFeatured={setFeatured}
          uploading={uploading}
          publishing={publishing}
          onImageUpload={handleImageUpload}
          onPublish={() => save('published')}
          onSaveDraft={() => save('draft')}
          onExit={exitEditor}
        />
      )}
    </>
  );
}

// IMPORTANTE: definido FORA do componente. Se ficasse dentro de Admin, viraria
// um componente novo a cada render, e o React desmontaria/remontaria tudo que
// está dentro (Dashboard + editor) — causando reset de estado.
const Wrap = ({ children }) => (
  <main className="relative z-[1] max-w-[1180px] mx-auto px-5 pt-[100px] pb-[140px]">
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
    <Wrap><p className="text-base text-white/50 text-center py-[60px]">Carregando...</p></Wrap>
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

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useAuth from '../hooks/useAuth';
import usePosts from '../hooks/usePosts';
import { showToast } from '../components/Toast';
import { saveSupabaseConfig, clearSupabaseConfig, generateSlug, getSupabaseClient } from '../utils/supabase';
import { SupabaseUploader } from '../utils/imageProcessor';

/* ── Quill toolbar config ── */
const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
];

/* ──────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────── */

/** Minecraft-styled input */
const McInput = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="font-mc text-[0.85rem] text-mc-green-light">{label}</label>}
    <input
      className="w-full px-[15px] py-3 font-mc text-base text-white border-[3px] border-mc-dark placeholder-white/40 focus:outline-none focus:border-mc-green"
      style={{ background: '#313233', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
      {...props}
    />
  </div>
);

/** Minecraft-styled button */
const McBtn = ({ variant = 'default', disabled, children, ...props }) => {
  const styles = {
    default:  { background: '#48494a', boxShadow: 'inset 0 -3px 0 #313233, inset 0 3px 0 #5a5b5c' },
    primary:  { background: '#3c8527', boxShadow: 'inset 0 -3px 0 #2d6a1e, inset 0 3px 0 #4ca632' },
    danger:   { background: '#8b2020', boxShadow: 'inset 0 -3px 0 #6a1818, inset 0 3px 0 #a52a2a' },
  };
  return (
    <button
      disabled={disabled}
      className="px-[25px] py-3 font-mc text-base text-white border-[3px] border-mc-dark cursor-pointer transition-all duration-[150ms] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      style={styles[variant]}
      {...props}
    >
      {children}
    </button>
  );
};

/* ──────────────────────────────────────────────────────
 * Sections rendered conditionally
 * ────────────────────────────────────────────────────── */

/** 1. Config section – first-time Supabase setup */
function ConfigSection({ onSaved }) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  const save = () => {
    if (!url.trim() || !key.trim()) { showToast('Preencha a URL e a Key!', 'error'); return; }
    saveSupabaseConfig(url.trim(), key.trim());
    showToast('Configuração salva!', 'success');
    onSaved();
  };

  return (
    <section className="border-[4px] border-mc-dark p-[30px] mb-5"
             style={{ background: '#48494a', boxShadow: 'inset 0 -4px 0 #313233, inset 0 4px 0 #5a5b5c, 0 6px 20px rgba(0,0,0,0.4)' }}>
      <h1 className="font-mc-five text-[1.5rem] text-white text-center mb-[10px]" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
        ⚙️ Configuração do Supabase
      </h1>
      <p className="font-mc text-[0.9rem] text-white/70 text-center mb-[25px]">
        Configure suas credenciais do Supabase uma única vez.
      </p>
      <div className="flex flex-col gap-[10px]">
        <McInput label="URL do Projeto" placeholder="https://xxxxx.supabase.co" value={url} onChange={e => setUrl(e.target.value)} />
        <McInput label="Anon Key" placeholder="eyJhbGciOiJIUzI1NiI…" value={key} onChange={e => setKey(e.target.value)} />
        <McBtn variant="primary" onClick={save}>Salvar Configuração</McBtn>
      </div>
    </section>
  );
}

/** 2. Login section */
function LoginSection({ onLoggedIn, onResetConfig }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy]         = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { showToast('Preencha e-mail e senha!', 'error'); return; }
    setBusy(true);
    try {
      await login(email.trim(), password.trim());
      showToast('Login realizado com sucesso!', 'success');
      onLoggedIn();
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    } finally { setBusy(false); }
  };

  return (
    <section className="border-[4px] border-mc-dark p-[30px] mb-5"
             style={{ background: '#48494a', boxShadow: 'inset 0 -4px 0 #313233, inset 0 4px 0 #5a5b5c, 0 6px 20px rgba(0,0,0,0.4)' }}>
      <h1 className="font-mc-five text-[1.5rem] text-white text-center mb-[10px]" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
        🔒 Login Admin
      </h1>
      <p className="font-mc text-[0.9rem] text-white/70 text-center mb-[25px]">
        Faça login para acessar o painel
      </p>
      <div className="flex flex-col gap-[10px]">
        <McInput label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <McInput label="Senha" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <McBtn variant="primary" disabled={busy} onClick={handleLogin}>
          {busy ? 'Entrando…' : 'Entrar'}
        </McBtn>
        <p className="text-center mt-[15px]">
          <button onClick={onResetConfig}
                  className="font-mc text-[0.8rem] text-white/50 bg-transparent border-none cursor-pointer underline hover:text-white/80">
            ⚙️ Reconfigurar Supabase
          </button>
        </p>
      </div>
    </section>
  );
}

/** 3. Full Dashboard (editor + posts table) */
function Dashboard({ onLogout }) {
  const { user }    = useAuth();
  const { posts, fetchPosts, createPost, updatePost, deletePost } = usePosts();
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();

  // editor state
  const [editId,    setEditId]    = useState(null);
  const [title,     setTitle]     = useState('');
  const [excerpt,   setExcerpt]   = useState('');
  const [imageUrl,  setImageUrl]  = useState('');
  const [content,   setContent]   = useState('');
  const [uploading, setUploading] = useState('');
  const [publishing,setPublishing]= useState(false);

  /* ── CORREÇÃO: Carregar posts apenas uma vez no mount ── */
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /* ── handle ?edit=<slug> from URL ── */
  useEffect(() => {
    const slug = searchParams.get('edit');
    if (slug && posts.length) {
      const p = posts.find(x => x.slug === slug);
      if (p) fillEditor(p);
    }
  }, [searchParams, posts]);

  /* ── fill editor with existing post ── */
  const fillEditor = (p) => {
    setEditId(p.id);
    setTitle(p.title);
    setExcerpt(p.excerpt || '');
    setImageUrl(p.image_url || '');
    setContent(p.content);
  };

  const clearEditor = () => {
    setEditId(null); setTitle(''); setExcerpt(''); setImageUrl(''); setContent('');
  };

  /* ── image upload ── */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('Processando…');
    try {
      const uploader = new SupabaseUploader(getSupabaseClient());
      const url = await uploader.upload(file, { folder: 'posts' });
      setImageUrl(url);
      showToast('Imagem enviada!', 'success');
    } catch (err) {
      showToast('Erro no upload: ' + err.message, 'error');
    } finally {
      setUploading('');
    }
  };

  /* ── publish / update post ── */
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
      await fetchPosts();
      navigate('/admin');
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  /* ── delete post ── */
  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await deletePost(id);
      showToast('Post excluído!', 'success');
      await fetchPosts();
    } catch (e) {
      showToast('Erro ao excluir: ' + e.message, 'error');
    }
  };

  /* ── stats ── */
  const lastDate = posts.length
    ? new Date(posts[0].created_at).toLocaleDateString('pt-BR')
    : '—';

  return (
    <>
      {/* ── header ── */}
      <header className="flex justify-between items-center mb-[30px]">
        <h1 className="font-mc-five text-[2rem] text-white" style={{ textShadow: '3px 3px 0 #3f3f3f' }}>
          🎮 Dashboard
        </h1>
        <McBtn variant="danger" onClick={onLogout}>🚪 Sair</McBtn>
      </header>

      {/* ── stats cards ── */}
      <div className="grid grid-cols-2 gap-5 mb-[30px] sm:grid-cols-1">
        {[
          { label: '📝 Total de Posts', value: posts.length },
          { label: '📅 Último Post',    value: lastDate     },
        ].map(({ label, value }) => (
          <div key={label} className="border-[4px] border-mc-dark p-5"
               style={{ background: '#48494a', boxShadow: 'inset 0 -4px 0 #313233, inset 0 4px 0 #5a5b5c' }}>
            <h3 className="font-mc-five text-base text-mc-green-light mb-[10px]">{label}</h3>
            <p className="font-mc text-[2rem] text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* ── editor section ── */}
      <div className="border-[4px] border-mc-dark p-[25px] mb-[30px]"
           style={{ background: '#48494a', boxShadow: 'inset 0 -4px 0 #313233, inset 0 4px 0 #5a5b5c' }}>
        <h2 className="font-mc-five text-[1.3rem] text-white mb-5" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
          {editId ? '✏️ Editando Post' : '✏️ Novo Post'}
        </h2>

        {/* title */}
        <div className="mb-5">
          <McInput label="Título" placeholder="Digite o título do post…" value={title} onChange={e => setTitle(e.target.value)} />
          <p className="font-mc text-[0.8rem] text-white/50 mt-[5px]">
            URL: <span className="text-mc-green-light">corelakes.vercel.app/post/{generateSlug(title) || 'titulo-do-post'}</span>
          </p>
        </div>

        {/* image */}
        <div className="mb-5">
          <McInput label="Imagem de Destaque" placeholder="Cole a URL da imagem ou use o upload abaixo" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          {/* upload area */}
          <div className="border-[3px] border-dashed border-mc-bg-light p-5 text-center mt-[10px] cursor-pointer hover:border-mc-green-light transition-colors duration-200"
               onClick={() => document.getElementById('img-file').click()}>
            <p className="font-mc text-[0.85rem] text-white/60 mb-[10px]">
              {uploading || '📷 Arreste uma imagem ou clique para fazer upload'}
            </p>
            <input id="img-file" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <label htmlFor="img-file" className="inline-block px-4 py-2 font-mc text-[0.8rem] text-white border-[2px] border-mc-dark cursor-pointer hover:bg-mc-bg-light"
                   style={{ background: '#48494a' }}>
              Escolher Imagem
            </label>
          </div>
          {/* preview */}
          {imageUrl && (
            <div className="mt-[10px]">
              <img src={imageUrl} alt="Preview" className="max-w-[200px] max-h-[120px] object-cover border-[2px] border-mc-dark" />
            </div>
          )}
        </div>

        {/* excerpt */}
        <div className="mb-5">
          <McInput label="Resumo (aparece na listagem)" placeholder="Breve descrição do post (max 200 caracteres)…"
                   value={excerpt} maxLength={200} onChange={e => setExcerpt(e.target.value)} />
        </div>

        {/* Quill editor */}
        <div className="mb-5">
          <label className="block font-mc text-[0.9rem] text-mc-green-light mb-2">Conteúdo</label>
          <div className="border-[3px] border-mc-dark" style={{ background: '#313233' }}>
            <ReactQuill theme="snow" value={content} onChange={setContent}
                        placeholder="Escreva o conteúdo do seu post…"
                        modules={{ toolbar: TOOLBAR }}
                        style={{ height: '300px' }} />
          </div>
        </div>

        {/* actions */}
        <div className="flex flex-wrap gap-[15px] mt-5">
          <McBtn variant="primary" disabled={publishing} onClick={publish}>
            {publishing ? 'Publicando…' : (editId ? '💾 Salvar Alterações' : '📤 Publicar Post')}
          </McBtn>
          <McBtn variant="default" onClick={clearEditor}>🗑️ Limpar</McBtn>
        </div>
      </div>

      {/* ── posts table ── */}
      <div className="border-[4px] border-mc-dark p-[25px]"
           style={{ background: '#48494a', boxShadow: 'inset 0 -4px 0 #313233, inset 0 4px 0 #5a5b5c' }}>
        <h2 className="font-mc-five text-[1.3rem] text-white mb-5" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
          📚 Posts Publicados
        </h2>

        {posts.length === 0 ? (
          <p className="font-mc text-[0.9rem] text-white/50 text-center py-[40px]">Nenhum post publicado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Imagem', 'Título', 'Data', 'Ações'].map(h => (
                    <th key={h} className="px-1 py-3 text-center font-mc text-[0.8rem] text-mc-green-light border-b-2 border-mc-dark"
                        style={{ background: '#313233' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id} className="hover:bg-mc-green/10 transition-colors">
                    <td className="px-1 py-3 text-center border-b-2 border-mc-dark">
                      {p.image_url
                        ? <img src={p.image_url} alt="" className="w-[50px] h-[50px] object-cover border-[2px] border-mc-dark mx-auto" />
                        : <span className="text-white/40 font-mc text-[0.75rem]">Sem imagem</span>
                      }
                    </td>
                    <td className="px-1 py-3 text-center font-mc text-[0.8rem] text-white border-b-2 border-mc-dark">{p.title}</td>
                    <td className="px-1 py-3 text-center font-mc text-[0.8rem] text-white border-b-2 border-mc-dark hidden md:table-cell">{p.date}</td>
                    <td className="px-1 py-3 text-center border-b-2 border-mc-dark">
                      <div className="flex gap-2 justify-center">
                        <McBtn variant="default" onClick={() => fillEditor(p)}
                               className="!px-3 !py-[6px] !text-[0.8rem]">✏️</McBtn>
                        <McBtn variant="danger" onClick={() => handleDelete(p.id)}
                               className="!px-3 !py-[6px] !text-[0.8rem]">🗑️</McBtn>
                        <a href={`/post/${p.slug}`} target="_blank" rel="noreferrer"
                           className="inline-flex items-center justify-center px-3 py-[6px] font-mc text-[0.8rem] text-white border-[3px] border-mc-dark no-underline"
                           style={{ background: '#48494a', boxShadow: 'inset 0 -3px 0 #313233, inset 0 3px 0 #5a5b5c' }}>
                          👁️
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────
 * Main Admin page – orchestrates which section to show
 * ────────────────────────────────────────────────────── */
export default function Admin() {
  const { user, loading, checkSession, logout } = useAuth();
  const [view, setView] = useState('loading'); // 'loading' | 'config' | 'login' | 'dashboard'

  useEffect(() => {
    (async () => {
      await checkSession();
    })();
  }, [checkSession]);

  useEffect(() => {
    if (loading) { setView('loading'); return; }

    const hasConfig = localStorage.getItem('supabase_url');
    if (!hasConfig) { setView('config'); return; }
    if (user)       { setView('dashboard'); return; }
    setView('login');
  }, [loading, user]);

  const handleLogout = async () => {
    await logout();
    showToast('Você saiu da dashboard.', 'success');
    setView('login');
  };

  /* wrapper */
  const Wrap = ({ children }) => (
    <main className="relative z-[1] max-w-[1000px] mx-auto px-5 pt-[100px] pb-[140px]">
      {children}
    </main>
  );

  if (view === 'loading') return (
    <Wrap><p className="font-mc text-base text-white/50 text-center py-[60px]">Carregando…</p></Wrap>
  );

  if (view === 'config') return (
    <Wrap><ConfigSection onSaved={() => setView('login')} /></Wrap>
  );

  if (view === 'login') return (
    <Wrap>
      <LoginSection
        onLoggedIn={() => setView('dashboard')}
        onResetConfig={() => { clearSupabaseConfig(); setView('config'); }}
      />
    </Wrap>
  );

  return (
    <Wrap><Dashboard onLogout={handleLogout} /></Wrap>
  );
}

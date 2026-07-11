'use client';

// ── Editor de posts estilo Gutenberg (TipTap) ───────────────────
// Tela cheia abaixo da navbar do site. Cabeçalho próprio com: sair (←),
// desfazer/refazer | configurações (⚙: imagem de destaque, resumo, URL)
// e Publicar. Menu "+" em linha vazia insere blocos (título, lista,
// citação, código, imagem, embed de YouTube/X, separador). Selecionar
// texto abre a barra de formatação; selecionar imagem abre os controles
// de tamanho/alinhamento.
import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import { Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TipTapLink from '@tiptap/extension-link';
import TipTapImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Youtube from '@tiptap/extension-youtube';
import { ApiUploader } from '@/utils/imageProcessor';
import { showToast } from '@/components/Toast';
import { generateSlug } from '@/utils/api';

/* ── Extensões customizadas ────────────────────────────────────── */

// Imagem com atributo `class` (tamanho/alinhamento via classes, porque o
// sanitizador do servidor só preserva `class` — ver lib/validate.js).
const CoreImage = TipTapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: 'img-w-100',
        parseHTML: (el) => el.getAttribute('class'),
        renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
      },
    };
  },
});

// Embed de post do X/Twitter. Salvo como o markup oficial
// <blockquote class="twitter-tweet"><a href="URL"/></blockquote>;
// o script widgets.js transforma isso no tweet real na página do post.
// No editor mostramos só um cartão com a URL (leve e sem script externo).
const Tweet = Node.create({
  name: 'tweet',
  group: 'block',
  atom: true,

  addAttributes() {
    return { url: { default: null } };
  },

  parseHTML() {
    return [{
      tag: 'blockquote.twitter-tweet',
      getAttrs: (el) => ({ url: el.querySelector('a')?.getAttribute('href') || null }),
    }];
  },

  renderHTML({ node }) {
    return [
      'blockquote',
      { class: 'twitter-tweet', 'data-theme': 'dark' },
      ['a', { href: node.attrs.url }, node.attrs.url || ''],
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'embed-card';
      dom.innerHTML =
        `<span class="embed-card-kind">Post do X (Twitter)</span>` +
        `<span class="embed-card-url">${node.attrs.url || ''}</span>` +
        `<span class="embed-card-hint">Aparece incorporado na página publicada</span>`;
      return { dom };
    };
  },

  addCommands() {
    return {
      setTweet: (url) => ({ commands }) =>
        commands.insertContent({ type: 'tweet', attrs: { url } }),
    };
  },
});

/* ── Detecção de URLs de embed ─────────────────────────────────── */
const YT_RE = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{6,}/;
const TW_RE = /(?:twitter\.com|x\.com)\/\w+\/status\/\d+/;

/* ── UI: botõezinhos ───────────────────────────────────────────── */
const Btn = ({ active, title, onClick, children, disabled }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()} /* não rouba o foco do editor */
    onClick={onClick}
    className={`min-w-[34px] h-[34px] px-2 inline-flex items-center justify-center font-mc text-[0.8rem] border border-black transition-colors disabled:opacity-30 ${
      active ? 'bg-mc-green text-white' : 'bg-[#1b1b1c] text-white/75 hover:text-white hover:bg-[#2a2a2b]'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="w-px h-6 bg-[#2a2a2b] mx-1" aria-hidden="true" />;

/* ── Editor ────────────────────────────────────────────────────── */
export default function PostEditor({
  editId,
  status = 'published',            // status atual do post ('draft' | 'published')
  title, setTitle,
  excerpt, setExcerpt,
  imageUrl, setImageUrl,
  content, setContent,
  categories = [],                 // lista de categorias (id, name, color)
  categoryId, setCategoryId,
  featured, setFeatured,
  uploading, publishing,
  onImageUpload, onPublish, onSaveDraft, onExit,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const editor = useEditor({
  immediatelyRender: false, // obrigatório no Next.js (evita erro de SSR)
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Underline,
    TipTapLink.configure({ openOnClick: false, autolink: true }),
    CoreImage,
    Youtube.configure({ nocookie: true, width: 640, height: 360 }),
    Tweet,
    TextStyle,
    Color,
    Placeholder.configure({ placeholder: 'Comece a escrever, ou use o + para adicionar blocos…' }),
  ],
  content: content || '',
  onUpdate: ({ editor: ed }) => setContent(ed.getHTML()),
  editorProps: {
    attributes: { class: 'core-editor' },
    transformPastedHTML(html) {
      return html.replace(/\s*(color|background-color)\s*:\s*[^;"]+;?/gi, '');
    },
  },
});

  // trava o scroll da página atrás do editor
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ── ações ── */
  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('URL do link (vazio remove):', prev);
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertInlineImage = useCallback(() => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.heic,.heif';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      showToast('Enviando imagem…', 'success');
      try {
        const url = await new ApiUploader().upload(file);
        editor.chain().focus().setImage({ src: url, class: 'img-w-100' }).run();
      } catch (err) {
        showToast('Erro no upload: ' + err.message, 'error');
      }
    };
    input.click();
  }, [editor]);

  const insertEmbed = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Cole o link do YouTube ou do post no X (Twitter):');
    if (!url) return;
    if (YT_RE.test(url)) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    } else if (TW_RE.test(url)) {
      editor.chain().focus().setTweet(url).run();
    } else {
      showToast('Link não reconhecido. Use YouTube ou X/Twitter.', 'error');
    }
  }, [editor]);

  // tamanho/alinhamento da imagem selecionada (classes; ver lib/validate.js)
  const imgClass = editor?.getAttributes('image')?.class || '';
  const setImgClass = (kind, value) => {
    const WIDTHS = ['img-w-40', 'img-w-70', 'img-w-100'];
    const ALIGNS = ['img-align-left', 'img-align-center', 'img-align-right'];
    const keep = imgClass.split(' ').filter(Boolean)
      .filter((c) => !(kind === 'w' ? WIDTHS : ALIGNS).includes(c));
    editor.chain().focus().updateAttributes('image', { class: [...keep, value].join(' ') }).run();
  };

  if (!editor) return null;

  const slugPreview = generateSlug(title) || 'titulo-do-post';

  return (
    <div className="fixed inset-x-0 bottom-0 top-[70px] z-[150] bg-[#0e0e0f] flex flex-col">

      {/* ── Cabeçalho do editor ── */}
      <header className="h-[54px] shrink-0 flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-3 bg-[#161617] border-b border-black overflow-hidden">
        <div className="flex items-center gap-1 shrink-0">
          <Btn title="Sair do editor" onClick={onExit}>←</Btn>
          <Divider />
          <Btn title="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>↶</Btn>
          <Btn title="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>↷</Btn>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <span className="hidden md:inline font-mc text-[0.72rem] text-white/40 whitespace-nowrap">
            {editId ? (status === 'draft' ? 'Editando rascunho' : 'Editando post') : 'Novo post'}
          </span>
          {(!editId || status === 'draft') && (
            <button
              type="button"
              disabled={publishing}
              onClick={onSaveDraft}
              title="Salva sem publicar — fica na aba Rascunhos"
              className="h-[34px] px-2 sm:px-3 whitespace-nowrap font-mc text-[0.78rem] sm:text-[0.8rem] text-white/80 bg-[#1b1b1c] border border-black hover:text-white hover:bg-[#2a2a2b] transition-colors disabled:opacity-50"
            >
              <span className="sm:hidden">Rascunho</span>
              <span className="hidden sm:inline">Salvar rascunho</span>
            </button>
          )}
          <Btn title="Configurações do post" active={settingsOpen} onClick={() => setSettingsOpen(!settingsOpen)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Btn>
          <button
            type="button"
            disabled={publishing}
            onClick={onPublish}
            className="h-[34px] px-3 sm:px-4 whitespace-nowrap font-mc text-[0.78rem] sm:text-[0.8rem] text-white bg-mc-green border border-black hover:bg-mc-green-light transition-colors disabled:opacity-50"
          >
            {publishing ? 'Salvando…' : (editId && status === 'published' ? 'Atualizar' : 'Publicar')}
          </button>
        </div>
      </header>

      {/* ── Canvas + sidebar ── */}
      <div className="relative flex-1 flex overflow-hidden">

        {/* canvas de escrita */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[740px] mx-auto px-5 py-8 pb-40">
            <textarea
              rows={1}
              value={title}
              placeholder="Adicionar título"
              onChange={(e) => setTitle(e.target.value)}
              onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); editor.chain().focus().run(); } }}
              className="editor-title w-full resize-none overflow-hidden bg-transparent outline-none"
            />
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* barra de formatação (seleção de texto) / controles de imagem */}
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100, maxWidth: 'none' }}>
          <div className="flex flex-wrap items-center gap-1 p-1 max-w-[92vw] bg-[#161617] border-2 border-black shadow-lg">
            {editor.isActive('image') ? (
              <>
                <Btn title="Pequena" active={imgClass.includes('img-w-40')} onClick={() => setImgClass('w', 'img-w-40')}>40%</Btn>
                <Btn title="Média" active={imgClass.includes('img-w-70')} onClick={() => setImgClass('w', 'img-w-70')}>70%</Btn>
                <Btn title="Total" active={imgClass.includes('img-w-100')} onClick={() => setImgClass('w', 'img-w-100')}>100%</Btn>
                <Divider />
                <Btn title="Esquerda" active={imgClass.includes('img-align-left')} onClick={() => setImgClass('a', 'img-align-left')}>⇤</Btn>
                <Btn title="Centro" active={imgClass.includes('img-align-center')} onClick={() => setImgClass('a', 'img-align-center')}>↔</Btn>
                <Btn title="Direita" active={imgClass.includes('img-align-right')} onClick={() => setImgClass('a', 'img-align-right')}>⇥</Btn>
                <Divider />
                <Btn title="Remover imagem" onClick={() => editor.chain().focus().deleteSelection().run()}>✕</Btn>
              </>
            ) : editor.isActive('tweet') || editor.isActive('youtube') ? (
              <Btn title="Remover embed" onClick={() => editor.chain().focus().deleteSelection().run()}>✕ Remover</Btn>
            ) : (
              <>
                <Btn title="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></Btn>
                <Btn title="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></Btn>
                <Btn title="Sublinhado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></Btn>
                <Btn title="Tachado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></Btn>
                <Btn title="Código inline" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>{'<>'}</Btn>
                <Divider />
                <Btn title="Link" active={editor.isActive('link')} onClick={setLink}>🔗</Btn>
              </>
            )}
          </div>
        </BubbleMenu>

        {/* inserção de blocos em linha vazia (o "+" do Gutenberg) */}
        <FloatingMenu editor={editor} tippyOptions={{ duration: 100, maxWidth: 'none', placement: 'bottom-start' }}>
          <div className="flex flex-wrap items-center gap-1 p-1 max-w-[92vw] bg-[#161617] border-2 border-black shadow-lg">
            <Btn title="Título (H2)" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
            <Btn title="Subtítulo (H3)" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
            <Btn title="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()}>•≡</Btn>
            <Btn title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</Btn>
            <Btn title="Citação" onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</Btn>
            <Btn title="Bloco de código" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{'{ }'}</Btn>
            <Btn title="Separador" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</Btn>
            <Btn title="Imagem" onClick={insertInlineImage}>🖼</Btn>
            <Btn title="Embed (YouTube / X)" onClick={insertEmbed}>▶</Btn>
          </div>
        </FloatingMenu>

        {/* ── Sidebar de configurações (engrenagem) ── */}
        {settingsOpen && (
          <aside className="absolute inset-0 z-20 md:static md:z-auto md:w-[340px] shrink-0 bg-[#141415] md:border-l border-black overflow-y-auto">
            <div className="flex items-center justify-between px-4 h-[46px] border-b border-black">
              <h2 className="font-mc text-[0.85rem] text-white uppercase tracking-[1px]">Configurações do post</h2>
              <Btn title="Fechar" onClick={() => setSettingsOpen(false)}>✕</Btn>
            </div>

            <div className="p-4 flex flex-col gap-6">
              <section>
                <h3 className="font-mc text-[0.75rem] text-mc-green-link uppercase tracking-[1px] mb-2">Categoria</h3>
                <select
                  value={categoryId ?? ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className="admin-input w-full px-3 py-2 text-sm bg-[#0d0d0d] border border-[#2f2f2f] text-white/85 focus:outline-none focus:border-mc-green-bright"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {categoryId && (
                  <span
                    className="inline-block mt-2 px-2 py-1 text-[0.7rem] font-mc text-white border border-black"
                    style={{ background: categories.find((c) => Number(c.id) === Number(categoryId))?.color || '#3c8527' }}
                  >
                    {categories.find((c) => Number(c.id) === Number(categoryId))?.name}
                  </span>
                )}
              </section>

              <section>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="mt-[3px] w-4 h-4 accent-[#3c8527]"
                  />
                  <span>
                    <span className="block font-mc text-[0.8rem] text-white">Post destaque</span>
                    <span className="block text-[0.75rem] text-white/45 mt-1">
                      Aparece em tela cheia no topo do blog, com título, resumo, data e categoria.
                    </span>
                  </span>
                </label>
              </section>

              <section>
                <h3 className="font-mc text-[0.75rem] text-mc-green-link uppercase tracking-[1px] mb-2">Imagem de destaque</h3>
                {imageUrl && (
                  <img src={imageUrl} alt="Imagem de destaque" className="w-full max-h-[160px] object-cover border border-black mb-2" />
                )}
                <label className="block border border-dashed border-[#3a3a3a] bg-[#0d0d0d] p-4 text-center cursor-pointer hover:border-mc-green-bright transition-colors">
                  <span className="font-mc text-[0.78rem] text-white/60">
                    {uploading || (imageUrl ? 'Trocar imagem' : 'Enviar imagem')}
                  </span>
                  <input type="file" accept="image/*,.heic,.heif" className="hidden" onChange={onImageUpload} />
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  placeholder="…ou cole a URL da imagem"
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="admin-input w-full mt-2 px-3 py-2 text-sm bg-[#0d0d0d] border border-[#2f2f2f] text-white/85 focus:outline-none focus:border-mc-green-bright"
                />
                {imageUrl && (
                  <button type="button" onClick={() => setImageUrl('')}
                    className="font-mc text-[0.72rem] text-mc-red hover:text-white mt-2">
                    Remover imagem de destaque
                  </button>
                )}
              </section>

              <section>
                <h3 className="font-mc text-[0.75rem] text-mc-green-link uppercase tracking-[1px] mb-2">Resumo</h3>
                <textarea
                  rows={4}
                  maxLength={200}
                  value={excerpt}
                  placeholder="Breve descrição do post (aparece na listagem e no Google)…"
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="admin-input w-full px-3 py-2 text-sm bg-[#0d0d0d] border border-[#2f2f2f] text-white/85 resize-y focus:outline-none focus:border-mc-green-bright"
                />
                <p className="font-mc text-[0.7rem] text-white/40 text-right">{excerpt.length}/200</p>
              </section>

              <section>
                <h3 className="font-mc text-[0.75rem] text-mc-green-link uppercase tracking-[1px] mb-2">URL</h3>
                <p className="font-mc text-[0.75rem] text-white/50 break-all">
                  corelakes.jonasagra.com.br/post/<span className="text-mc-green-light">{slugPreview}</span>
                </p>
                <p className="font-mc text-[0.68rem] text-white/35 mt-1">Gerada automaticamente a partir do título.</p>
              </section>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

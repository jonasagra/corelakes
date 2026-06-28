import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import './quillImage'; // registra a imagem customizada (preserva a classe)
import { generateSlug } from '../../../utils/api';
import { ApiUploader } from '../../../utils/imageProcessor';
import { showToast } from '../../../components/Toast';
import { IcImage, IcSave, IcTrash, IcUpload, OreButton, OreInput, TOOLBAR } from './AdminControls';

const WIDTHS = ['img-w-40', 'img-w-70', 'img-w-100'];
const ALIGNS = ['img-align-left', 'img-align-center', 'img-align-right'];
const PLACEHOLDER = 'Enviando imagem…';

export default function CreatePostTab({
  editId,
  title,
  setTitle,
  excerpt,
  setExcerpt,
  imageUrl,
  setImageUrl,
  content,
  setContent,
  uploading,
  publishing,
  onImageUpload,
  onPublish,
  onClear,
}) {
  const quillRef = useRef(null);
  const wrapperRef = useRef(null);
  // menu flutuante da imagem: { index, cls, top, left } ou null
  const [imgMenu, setImgMenu] = useState(null);

  // Botão de imagem da toolbar: faz UPLOAD real (Vercel Blob) e insere por URL,
  // em vez do comportamento padrão do Quill (que embute em base64).
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const quill = quillRef.current?.getEditor();
      if (!quill) return;
      const range = quill.getSelection(true);
      const index = range ? range.index : quill.getLength();
      quill.insertText(index, PLACEHOLDER, { italic: true }, 'user');
      try {
        const url = await new ApiUploader().upload(file);
        quill.deleteText(index, PLACEHOLDER.length, 'user');
        quill.insertEmbed(index, 'image', url, 'user');
        quill.formatText(index, 1, 'class', 'img-w-100', 'user'); // largura total por padrão
        quill.setSelection(index + 1, 0, 'user');
        showToast('Imagem inserida!', 'success');
      } catch (err) {
        quill.deleteText(index, PLACEHOLDER.length, 'user');
        showToast('Erro no upload: ' + err.message, 'error');
      }
    };
    input.click();
  }, []);

  const modules = useMemo(
    () => ({ toolbar: { container: TOOLBAR, handlers: { image: imageHandler } } }),
    [imageHandler]
  );

  // Tocar numa imagem abre o menu; tocar fora fecha.
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const root = quill.root;

    const showMenuFor = (img) => {
      const blot = Quill.find(img);
      if (!blot) return;
      const index = quill.getIndex(blot);
      // lê a classe ANTES do destaque, e ignora `is-selected` (só visual).
      const cls = (img.getAttribute('class') || '')
        .split(' ')
        .filter((c) => c && c !== 'is-selected')
        .join(' ');
      const r = img.getBoundingClientRect();
      const w = wrapperRef.current.getBoundingClientRect();
      img.classList.add('is-selected');
      setImgMenu({
        index,
        cls,
        top: r.bottom - w.top + 6,
        left: Math.max(0, r.left - w.left),
      });
    };

    const clearSelected = () => {
      root.querySelectorAll('img.is-selected').forEach((n) => n.classList.remove('is-selected'));
    };

    const onClick = (e) => {
      if (e.target && e.target.tagName === 'IMG') {
        clearSelected();
        showMenuFor(e.target);
      } else {
        clearSelected();
        setImgMenu(null);
      }
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, []);

  // Aplica uma mudança de tamanho/alinhamento mantendo a outra dimensão.
  const applyImg = (changes) => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !imgMenu) return;
    const set = new Set((imgMenu.cls || '').split(' ').filter(Boolean));
    set.delete('is-selected'); // nunca persistir o destaque visual
    if (changes.width) { WIDTHS.forEach((c) => set.delete(c)); set.add(changes.width); }
    if (changes.align) { ALIGNS.forEach((c) => set.delete(c)); set.add(changes.align); }
    const cls = [...set].join(' ');
    quill.formatText(imgMenu.index, 1, 'class', cls, 'user');
    setImgMenu({ ...imgMenu, cls });
  };

  const removeImg = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !imgMenu) return;
    quill.deleteText(imgMenu.index, 1, 'user');
    setImgMenu(null);
  };

  const has = (c) => (imgMenu?.cls || '').split(' ').includes(c);
  const menuBtn = (active) =>
    `px-3 py-2 text-[0.75rem] font-mc border border-black transition-colors ${
      active ? 'bg-mc-green text-white' : 'bg-[#1b1b1c] text-white/75 hover:text-white'
    }`;

  return (
    <div className="mc-panel p-[25px] mb-[30px]">
      <h2 className="font-mc-five text-[1.3rem] text-white mb-5" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
        <span className="inline-flex items-center gap-2">
          <img src="https://minecraft.wiki/images/Book_and_Quill_JE2_BE2.png?2128f&format=original" alt="Editar" className="oreUI-icon" />
          {editId ? 'Editando Post' : 'Novo Post'}
        </span>
      </h2>

      <div className="mb-5">
        <OreInput label="Título" placeholder="Digite o título do post..." value={title} onChange={e => setTitle(e.target.value)} />
        <p className="font-mc text-[0.8rem] text-white/50 mt-[5px]">
          URL: <span className="text-mc-green-light">corelakes.vercel.app/post/{generateSlug(title) || 'titulo-do-post'}</span>
        </p>
      </div>

      <div className="mb-5">
        <OreInput label="Imagem de Destaque" placeholder="Cole a URL da imagem ou use o upload abaixo" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        <div className="border border-dashed border-[#3a3a3a] bg-[#0d0d0d] p-5 text-center mt-[10px] cursor-pointer hover:border-mc-green-bright transition-colors duration-200"
             onClick={() => document.getElementById('img-file').click()}>
          <p className="font-mc text-[0.85rem] text-white/60 mb-[10px]">
            {uploading || <span className="inline-flex items-center gap-2"><IcImage /> Arraste uma imagem ou clique para fazer upload</span>}
          </p>
          <input id="img-file" type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
          <label htmlFor="img-file" className="inline-block px-4 py-2 font-mc text-[0.8rem] text-white bg-[#1b1b1c] border border-[#2f2f2f] cursor-pointer hover:border-mc-green-bright transition-colors">
            Escolher Imagem
          </label>
        </div>
        {imageUrl && (
          <div className="mt-[10px]">
            <img src={imageUrl} alt="Preview" className="max-w-[200px] max-h-[120px] object-cover border-[2px] border-mc-dark" />
          </div>
        )}
      </div>

      <div className="mb-2">
        <OreInput label="Resumo" placeholder="Breve descrição do post (max 200 caracteres)..."
                 value={excerpt} maxLength={200} onChange={e => setExcerpt(e.target.value)} />
      </div>

      <div className="mb-1">
        <label className="block font-mc text-[0.85em] text-mc-green-light mb-4">Conteúdo</label>
        <div ref={wrapperRef} className="relative border border-black" style={{ background: '#313233' }}>
          <ReactQuill
            ref={quillRef}
            className="oreUI-quill"
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Escreva o conteúdo do seu post..."
            modules={modules}
          />

          {imgMenu && (
            <div
              className="absolute z-20 bg-[#48494a] border-2 border-black p-2 shadow-lg"
              style={{ top: imgMenu.top, left: imgMenu.left }}
            >
              <p className="font-mc text-[0.68rem] text-white/60 mb-1 px-1">Tamanho</p>
              <div className="flex gap-1 mb-2">
                <button type="button" className={menuBtn(has('img-w-40'))}  onClick={() => applyImg({ width: 'img-w-40' })}>Pequena</button>
                <button type="button" className={menuBtn(has('img-w-70'))}  onClick={() => applyImg({ width: 'img-w-70' })}>Média</button>
                <button type="button" className={menuBtn(has('img-w-100'))} onClick={() => applyImg({ width: 'img-w-100' })}>Total</button>
              </div>
              <p className="font-mc text-[0.68rem] text-white/60 mb-1 px-1">Alinhamento</p>
              <div className="flex gap-1 mb-2">
                <button type="button" className={menuBtn(has('img-align-left'))}   onClick={() => applyImg({ align: 'img-align-left' })}>Esq.</button>
                <button type="button" className={menuBtn(has('img-align-center'))} onClick={() => applyImg({ align: 'img-align-center' })}>Centro</button>
                <button type="button" className={menuBtn(has('img-align-right'))}  onClick={() => applyImg({ align: 'img-align-right' })}>Dir.</button>
              </div>
              <div className="flex justify-between gap-1">
                <button type="button" className="px-3 py-2 text-[0.75rem] font-mc border border-black bg-mc-red text-white" onClick={removeImg}>Remover</button>
                <button type="button" className="px-3 py-2 text-[0.75rem] font-mc border border-black bg-[#1b1b1c] text-white/75 hover:text-white" onClick={() => setImgMenu(null)}>Fechar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-[12px] mt-1">
        <OreButton variant="primary" disabled={publishing} onClick={onPublish}>
          {publishing ? 'Publicando...' : (editId ? <><IcSave /> Salvar Alterações</> : <><IcUpload /> Publicar Post</>)}
        </OreButton>
        <OreButton variant="default" onClick={onClear}><IcTrash /> Limpar</OreButton>
      </div>
    </div>
  );
}

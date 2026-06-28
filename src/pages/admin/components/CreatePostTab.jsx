import ReactQuill from 'react-quill';
import { generateSlug } from '../../../utils/api';
import { IcImage, IcSave, IcTrash, IcUpload, OreButton, OreInput, TOOLBAR } from './AdminControls';

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
        <OreInput label="Resumo (aparece na listagem)" placeholder="Breve descrição do post (max 200 caracteres)..."
                 value={excerpt} maxLength={200} onChange={e => setExcerpt(e.target.value)} />
      </div>

      <div className="mb-1">
        <label className="block font-mc text-[0.85em] text-mc-green-light mb-4">Conteúdo</label>
        <div className="border border-black" style={{ background: '#313233' }}>
          <ReactQuill
            className="oreUI-quill"
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Escreva o conteúdo do seu post..."
            modules={{ toolbar: TOOLBAR }}
          />
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

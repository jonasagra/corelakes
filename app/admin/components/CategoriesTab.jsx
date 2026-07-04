'use client';

// Configurar categorias: criar, renomear, trocar cor e excluir.
// Cada categoria tem um seletor de cor (o badge usa essa cor no site).
import { useState } from 'react';
import { showToast } from '@/components/Toast';
import { confirmDialog } from '@/components/ConfirmModal';

const PRESETS = ['#c0392b', '#2980b9', '#3c8527', '#8e44ad', '#d35400', '#ffb12b', '#16a085', '#5a5b5c'];

function CategoryRow({ cat, onUpdate, onDelete }) {
  const [name, setName] = useState(cat.name);
  const [color, setColor] = useState(cat.color);
  const [busy, setBusy] = useState(false);
  const dirty = name !== cat.name || color.toLowerCase() !== cat.color.toLowerCase();

  const save = async () => {
    setBusy(true);
    try {
      await onUpdate(cat.id, { name: name.trim(), color });
      showToast('Categoria atualizada!', 'success');
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await confirmDialog({
      title: `Excluir "${cat.name}"?`,
      message: `${cat.post_count} post(s) ficarão sem categoria. Essa ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    try {
      await onDelete(cat.id);
      showToast('Categoria excluída.', 'success');
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 border-b border-[#242424]">
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        title="Cor da categoria"
        className="w-9 h-9 shrink-0 cursor-pointer bg-transparent border border-black"
      />
      <input
        type="text"
        value={name}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
        className="admin-input flex-1 min-w-[140px] px-3 py-2 text-sm bg-[#0d0d0d] border border-[#2f2f2f] text-white/90 focus:outline-none focus:border-mc-green-bright"
      />
      <span
        className="px-2 py-1 text-[0.7rem] font-medium text-white border border-black"
        style={{ background: color }}
      >
        {name || '—'}
      </span>
      <span className="text-[0.75rem] text-white/40 whitespace-nowrap">{cat.post_count} post(s)</span>
      <div className="flex gap-2 shrink-0">
        <button className="mc-btn !py-[6px] !px-3" disabled={!dirty || busy} onClick={save}
          style={!dirty ? { opacity: 0.35, pointerEvents: 'none' } : undefined}>
          Salvar
        </button>
        <button className="mc-btn mc-btn-danger !py-[6px] !px-3" onClick={remove}>Excluir</button>
      </div>
    </div>
  );
}

export default function CategoriesTab({ categories, onCreate, onUpdate, onDelete }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESETS[0]);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!newName.trim()) { showToast('Dê um nome à categoria.', 'error'); return; }
    setBusy(true);
    try {
      await onCreate({ name: newName.trim(), color: newColor });
      showToast('Categoria criada!', 'success');
      setNewName('');
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mc-panel p-5 md:p-[25px]">
      <h2 className="text-[1.05rem] font-semibold text-white mb-1">Configurar categorias</h2>
      <p className="text-[0.8rem] text-white/45 mb-5">
        A cor escolhida pinta o badge da categoria no blog, no post e nas listagens do painel.
      </p>

      {/* nova categoria */}
      <div className="flex flex-wrap items-center gap-3 p-4 mb-5 bg-[#0d0d0d] border border-[#2f2f2f]">
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          title="Cor da nova categoria"
          className="w-9 h-9 shrink-0 cursor-pointer bg-transparent border border-black"
        />
        <input
          type="text"
          value={newName}
          maxLength={40}
          placeholder="Nome da nova categoria…"
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && create()}
          className="admin-input flex-1 min-w-[160px] px-3 py-2 text-sm bg-[#151516] border border-[#2f2f2f] text-white/90 focus:outline-none focus:border-mc-green-bright"
        />
        <div className="flex gap-1">
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => setNewColor(c)}
              className={`w-6 h-6 border ${newColor === c ? 'border-white' : 'border-black'}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <button className="mc-btn mc-btn-solid !py-[8px]" disabled={busy} onClick={create}>
          + Adicionar
        </button>
      </div>

      {/* existentes */}
      {categories.length === 0 ? (
        <p className="text-white/45 text-sm py-6 text-center">Nenhuma categoria ainda. Crie a primeira acima.</p>
      ) : (
        categories.map((cat) => (
          <CategoryRow key={cat.id} cat={cat} onUpdate={onUpdate} onDelete={onDelete} />
        ))
      )}
    </section>
  );
}

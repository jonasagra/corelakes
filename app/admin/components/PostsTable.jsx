'use client';

// Lista de postagens do painel (usada em "Editar postagens" e "Rascunhos"),
// com busca por título e filtro por categoria.
import { useMemo, useState } from 'react';

export const CatBadge = ({ name, color }) => (
  <span
    className="inline-block px-2 py-[3px] text-[0.7rem] font-medium text-white border border-black whitespace-nowrap"
    style={{ background: color || '#3c8527' }}
  >
    {name || 'Sem categoria'}
  </span>
);

export default function PostsTable({ title, posts, categories, onEdit, onDelete, emptyText }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (filterCat === 'none' && p.category_id) return false;
      if (filterCat !== 'all' && filterCat !== 'none' && Number(p.category_id) !== Number(filterCat)) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [posts, search, filterCat]);

  return (
    <section className="mc-panel p-5 md:p-[25px]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-[1.05rem] font-semibold text-white">{title}</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={search}
            placeholder="Buscar por título…"
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input px-3 py-2 text-sm bg-[#0d0d0d] border border-[#2f2f2f] text-white/85 focus:outline-none focus:border-mc-green-bright"
          />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="admin-input px-3 py-2 text-sm bg-[#0d0d0d] border border-[#2f2f2f] text-white/85 focus:outline-none focus:border-mc-green-bright"
          >
            <option value="all">Todas as categorias</option>
            <option value="none">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-white/45 text-sm py-8 text-center">{emptyText || 'Nenhum post encontrado.'}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead>
              <tr className="border-b border-[#2a2a2b] text-white/50">
                <th className="py-3 pr-3 font-medium">Título</th>
                <th className="py-3 pr-3 font-medium">Categoria</th>
                <th className="py-3 pr-3 font-medium">Views</th>
                <th className="py-3 pr-3 font-medium">Data</th>
                <th className="py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-b border-[#242424]">
                  <td className="py-3 pr-3">
                    <span className="text-white">{post.title}</span>
                    {post.featured && (
                      <span className="ml-2 text-[0.68rem] text-mc-gold" title="Post destaque">★ destaque</span>
                    )}
                    <span className="block text-[0.72rem] text-white/35">/{post.slug}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <CatBadge name={post.category_name} color={post.category_color} />
                  </td>
                  <td className="py-3 pr-3 text-white/60">{post.views ?? 0}</td>
                  <td className="py-3 pr-3 text-white/60">{post.date}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button className="mc-btn !py-[6px] !px-3" onClick={() => onEdit(post)}>Editar</button>
                      <button className="mc-btn mc-btn-danger !py-[6px] !px-3" onClick={() => onDelete(post.id)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

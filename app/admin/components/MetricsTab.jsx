'use client';

// Métricas gerais: contagens, views acumuladas e ranking de posts.
// As views são contadas no servidor a cada visita pública de um post
// publicado (visitas do admin logado não contam).
import { CatBadge } from './PostsTable';

export const Card = ({ label, value, hint }) => (
  <div className="mc-panel p-5">
    <p className="text-[0.75rem] uppercase tracking-[1px] text-white/45">{label}</p>
    <p className="text-[1.9rem] font-bold text-white leading-tight mt-1">{value}</p>
    {hint && <p className="text-[0.72rem] text-white/35 mt-1">{hint}</p>}
  </div>
);

export default function MetricsTab({ posts, categories }) {
  const published = posts.filter((p) => p.status === 'published');
  const drafts = posts.filter((p) => p.status === 'draft');
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const avgViews = published.length ? Math.round(totalViews / published.length) : 0;
  const top = [...published].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card label="Posts publicados" value={published.length} />
        <Card label="Rascunhos" value={drafts.length} />
        <Card label="Views totais" value={totalViews.toLocaleString('pt-BR')} hint="Visitas públicas às páginas de post" />
        <Card label="Média por post" value={avgViews.toLocaleString('pt-BR')} />
      </div>

      <section className="mc-panel p-5 md:p-[25px]">
        <h2 className="text-[1.05rem] font-semibold text-white mb-4">Posts mais vistos</h2>
        {top.length === 0 ? (
          <p className="text-white/45 text-sm py-4 text-center">Publique posts para começar a medir.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {top.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 py-2 border-b border-[#242424] last:border-0">
                <span className="w-6 text-white/35 font-bold">{i + 1}.</span>
                <span className="flex-1 text-white/85 truncate">{p.title}</span>
                <CatBadge name={p.category_name} color={p.category_color} />
                <span className="text-white/55 text-sm w-[90px] text-right">{(p.views || 0).toLocaleString('pt-BR')} views</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mc-panel p-5 md:p-[25px]">
        <h2 className="text-[1.05rem] font-semibold text-white mb-4">Posts por categoria</h2>
        {categories.length === 0 ? (
          <p className="text-white/45 text-sm py-4 text-center">Nenhuma categoria criada.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-2 px-3 py-2 bg-[#0d0d0d] border border-[#2f2f2f]">
                <span className="w-3 h-3 border border-black" style={{ background: c.color }} />
                <span className="text-white/85 text-sm">{c.name}</span>
                <span className="text-white/40 text-sm">{c.post_count}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

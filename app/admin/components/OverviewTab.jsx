'use client';

// Visão geral — a "casa" do painel (como o Painel do WordPress):
// números rápidos, atividade recente e atalhos.
import Link from 'next/link';
import { Card } from './MetricsTab';
import { CatBadge } from './PostsTable';

function timeAgo(dateStr) {
  const s = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (Number.isNaN(s) || s < 0) return '';
  if (s < 3600) { const m = Math.max(1, Math.floor(s / 60)); return `há ${m} min`; }
  if (s < 86400) { const h = Math.floor(s / 3600); return `há ${h} hora${h > 1 ? 's' : ''}`; }
  const d = Math.floor(s / 86400);
  if (d < 30) return `há ${d} dia${d > 1 ? 's' : ''}`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `há ${mo} ${mo > 1 ? 'meses' : 'mês'}`;
  const y = Math.max(1, Math.floor(d / 365));
  return `há ${y} ano${y > 1 ? 's' : ''}`;
}

export default function OverviewTab({ posts, categories, onEdit, onNew, onNavigate }) {
  const published = posts.filter((p) => p.status !== 'draft');
  const drafts = posts.filter((p) => p.status === 'draft');
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const recent = posts.slice(0, 5); // já vem ordenado por data (mais novo primeiro)

  return (
    <div className="flex flex-col gap-5">

      {/* números rápidos */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card label="Publicados" value={published.length} />
        <Card label="Rascunhos" value={drafts.length} />
        <Card label="Views totais" value={totalViews.toLocaleString('pt-BR')} />
        <Card label="Categorias" value={categories.length} />
      </div>

      {/* atalhos */}
      <section className="mc-panel p-5">
        <h2 className="text-[1.05rem] font-semibold text-white mb-4">Atalhos</h2>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="mc-btn mc-btn-solid" onClick={onNew}>+ Criar postagem</button>
          <Link href="/blog" className="mc-btn">Ver o blog</Link>
          <button type="button" className="mc-btn" onClick={() => onNavigate('categories')}>Configurar categorias</button>
          <button type="button" className="mc-btn" onClick={() => onNavigate('metrics')}>Métricas gerais</button>
        </div>
      </section>

      {/* atividade recente */}
      <section className="mc-panel p-5 md:p-[25px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[1.05rem] font-semibold text-white">Atividade recente</h2>
          <button type="button" onClick={() => onNavigate('posts')}
                  className="text-mc-green-bright text-[0.82rem] font-semibold hover:text-white transition-colors">
            Ver todas ›
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="text-white/45 text-sm py-6 text-center">
            Nada por aqui ainda — crie sua primeira postagem no botão acima.
          </p>
        ) : (
          <ul className="flex flex-col">
            {recent.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3 border-b border-[#242424] last:border-0">
                <span className={`px-2 py-[2px] text-[0.68rem] font-bold uppercase border border-black ${
                  p.status === 'draft' ? 'bg-mc-gold text-black' : 'bg-mc-green text-white'
                }`}>
                  {p.status === 'draft' ? 'Rascunho' : 'Publicado'}
                </span>
                <button type="button" onClick={() => onEdit(p)}
                        className="flex-1 min-w-[160px] text-left text-white/90 hover:text-mc-green-bright transition-colors truncate">
                  {p.title}
                </button>
                <CatBadge name={p.category_name} color={p.category_color} />
                <span className="text-white/40 text-[0.78rem] w-[110px] text-right">
                  {timeAgo(p.updated_at || p.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

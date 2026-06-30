// GET /sitemap.xml  (via rewrite em vercel.json)
// Sitemap gerado na hora: home, blog e TODOS os posts do banco (Neon).
// Atualiza sozinho a cada novo post — sem precisar editar nada à mão.
import { sql } from './_lib/db.js';

const BASE = 'https://corelakes.jonasagra.com.br';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export default async function handler(req, res) {
  let posts = [];
  try {
    posts = await sql`SELECT slug, updated_at, created_at FROM posts ORDER BY created_at DESC`;
  } catch (err) {
    console.error('sitemap db error:', err);
  }

  const statics = [
    { loc: `${BASE}/`,     changefreq: 'weekly', priority: '1.0' },
    { loc: `${BASE}/blog`, changefreq: 'daily',  priority: '0.8' },
  ];

  const urls = [
    ...statics.map(
      (u) => `<url><loc>${esc(u.loc)}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
    ),
    ...posts.map((p) => {
      const lastmod = new Date(p.updated_at || p.created_at).toISOString();
      return `<url><loc>${BASE}/post/${esc(p.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
    }),
  ].join('');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  );
}

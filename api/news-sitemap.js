// GET /news-sitemap.xml  (via rewrite em vercel.json)
// Sitemap no formato Google News: SÓ os posts dos últimos 2 dias (exigência
// do Google News). Atualiza sozinho. Lembre de cadastrar o site no Google
// News Publisher Center pra que ele seja considerado.
import { sql } from './_lib/db.js';

const BASE = 'https://corelakes.jonasagra.com.br';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export default async function handler(req, res) {
  let posts = [];
  try {
    posts = await sql`
      SELECT slug, title, created_at
      FROM posts
      WHERE created_at > now() - interval '2 days'
      ORDER BY created_at DESC`;
  } catch (err) {
    console.error('news-sitemap db error:', err);
  }

  const items = posts.map((p) => {
    const date = new Date(p.created_at).toISOString();
    return `<url><loc>${BASE}/post/${esc(p.slug)}</loc>` +
      `<news:news>` +
        `<news:publication><news:name>Corelakes</news:name><news:language>pt</news:language></news:publication>` +
        `<news:publication_date>${date}</news:publication_date>` +
        `<news:title>${esc(p.title)}</news:title>` +
      `</news:news></url>`;
  }).join('');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  return res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${items}</urlset>`
  );
}

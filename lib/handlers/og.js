// GET /api/og?slug=...
// Devolve um HTML com as meta tags Open Graph/Twitter DO POST, pra que a
// imagem de destaque, título e descrição apareçam ao compartilhar o link
// em WhatsApp, Twitter/X, Facebook, Messenger, Instagram, Discord, Bluesky, etc.
import { sql } from '../db.js';

const BASE = 'https://corelakes.jonasagra.com.br';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export default async function handler(req, res) {
  const slug = String(req.query?.slug || '');

  let post = null;
  try {
    const rows = await sql`SELECT title, excerpt, content, image_url FROM posts WHERE slug = ${slug} LIMIT 1`;
    post = rows[0] || null;
  } catch { /* fallback abaixo */ }

  const title = post?.title ? `${post.title} — Corelakes` : 'Corelakes | Blog e Minecraft';
  const desc = (
    post?.excerpt ||
    (post?.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180) ||
    'Corelakes: blog de Minecraft com notícias, guias e conteúdo da comunidade brasileira.'
  ).trim();
  // Preview sempre em JPG 1200x630 (via /api/og-image), porque WebP não é
  // renderizado de forma confiável por Facebook/X/LinkedIn. O WebP fica só no site.
  const image = `${BASE}/api/og-image?slug=${encodeURIComponent(slug)}`;
  const url = `${BASE}/post/${slug}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // cache curto na CDN (previews atualizam, mas não a cada hit)
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');

  return res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Corelakes" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:secure_url" content="${esc(image)}" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${esc(post?.title || 'Corelakes')}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:locale" content="pt_BR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(image)}" />
</head>
<body>
<h1>${esc(post?.title || 'Corelakes')}</h1>
<p>${esc(desc)}</p>
<p><a href="${esc(url)}">Ler no Corelakes</a></p>
</body>
</html>`);
}

// /api/posts
//   GET            -> lista pública de posts (ou ?slug=xxx para um só)
//   POST (admin)   -> cria post  [requer sessão válida + validação server-side]
import { sql } from '../_lib/db.js';
import { requireAuth, verifyOrigin } from '../_lib/auth.js';
import { validatePost, generateSlug } from '../_lib/validate.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const slug = req.query?.slug;
      if (slug) {
        const rows = await sql`SELECT * FROM posts WHERE slug = ${String(slug)} LIMIT 1`;
        if (!rows[0]) return res.status(404).json({ error: 'Post não encontrado.' });
        return res.status(200).json(rows[0]);
      }
      const rows = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      if (!verifyOrigin(req, res)) return; // 403 já enviado
      const session = await requireAuth(req, res);
      if (!session) return; // 401 já enviado

      const { title, excerpt, imageUrl, content } = validatePost(req.body);
      const slug = await uniqueSlug(generateSlug(title));

      const rows = await sql`
        INSERT INTO posts (title, slug, content, excerpt, image_url)
        VALUES (${title}, ${slug}, ${content}, ${excerpt}, ${imageUrl})
        RETURNING *`;
      return res.status(201).json(rows[0]);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    // Erros de validação têm mensagem amigável; o resto vira 500 genérico.
    if (err?.message && err.message.length < 200 && !/\bsql\b/i.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    console.error('posts POST/GET error:', err);
    return res.status(500).json({ error: 'Erro no servidor.' });
  }
}

// Garante slug único (acrescenta -2, -3, ... se já existir).
async function uniqueSlug(base) {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = await sql`SELECT 1 FROM posts WHERE slug = ${slug} LIMIT 1`;
    if (!rows[0]) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

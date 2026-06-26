// /api/posts/:id
//   PUT (admin)    -> atualiza post  [requer sessão + validação server-side]
//   DELETE (admin) -> remove post    [requer sessão]
import { sql } from '../_lib/db.js';
import { requireAuth, verifyOrigin } from '../_lib/auth.js';
import { validatePost, generateSlug } from '../_lib/validate.js';

export default async function handler(req, res) {
  const id = Number(req.query?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    if (!verifyOrigin(req, res)) return; // 403 já enviado
    const session = await requireAuth(req, res);
    if (!session) return; // 401 já enviado

    if (req.method === 'PUT') {
      const { title, excerpt, imageUrl, content } = validatePost(req.body);
      const slug = await uniqueSlug(generateSlug(title), id);

      const rows = await sql`
        UPDATE posts
        SET title = ${title}, slug = ${slug}, content = ${content},
            excerpt = ${excerpt}, image_url = ${imageUrl},
            updated_at = now()
        WHERE id = ${id}
        RETURNING *`;
      if (!rows[0]) return res.status(404).json({ error: 'Post não encontrado.' });
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const rows = await sql`DELETE FROM posts WHERE id = ${id} RETURNING id`;
      if (!rows[0]) return res.status(404).json({ error: 'Post não encontrado.' });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    if (err?.message && err.message.length < 200 && !/\bsql\b/i.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    console.error('posts [id] error:', err);
    return res.status(500).json({ error: 'Erro no servidor.' });
  }
}

// Slug único, ignorando o próprio post que está sendo editado.
async function uniqueSlug(base, selfId) {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = await sql`SELECT 1 FROM posts WHERE slug = ${slug} AND id <> ${selfId} LIMIT 1`;
    if (!rows[0]) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

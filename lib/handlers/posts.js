// Handler compartilhado: GET/POST/PUT/DELETE /api/posts
// Usado pela Route Handler do Next.js (app/api/posts/route.js).
//
// Regras de visibilidade:
//  • Público vê apenas posts com status='published'.
//  • Admin logado pode listar tudo (?all=1) e abrir rascunhos pelo slug.
//  • Cada visita pública a um post publicado incrementa `views` (métricas).
import { sql } from '../db.js';
import { requireAuth, verifyOrigin, getSession } from '../auth.js';
import { validatePost, generateSlug } from '../validate.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const slug = req.query?.slug;

      if (slug) {
        const rows = await sql`
          SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.color AS category_color
          FROM posts p LEFT JOIN categories c ON c.id = p.category_id
          WHERE p.slug = ${String(slug)} LIMIT 1`;
        const post = rows[0];
        if (!post) return res.status(404).json({ error: 'Post não encontrado.' });

        const session = await getSession(req);
        // rascunho: só o admin enxerga
        if (post.status !== 'published' && !session) {
          return res.status(404).json({ error: 'Post não encontrado.' });
        }
        // visita pública conta view (admin não infla a métrica)
        if (post.status === 'published' && !session) {
          await sql`UPDATE posts SET views = views + 1 WHERE id = ${post.id}`;
        }
        return res.status(200).json(post);
      }

      // listagem: ?all=1 (admin) inclui rascunhos
      if (req.query?.all) {
        const session = await getSession(req);
        if (session) {
          const rows = await sql`
            SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.color AS category_color
            FROM posts p LEFT JOIN categories c ON c.id = p.category_id
            ORDER BY p.created_at DESC`;
          return res.status(200).json(rows);
        }
      }

      const rows = await sql`
        SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.color AS category_color
        FROM posts p LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.status = 'published'
        ORDER BY p.created_at DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      if (!verifyOrigin(req, res)) return;
      const session = await requireAuth(req, res);
      if (!session) return;
      const { title, excerpt, imageUrl, content, status, featured, categoryId } = validatePost(req.body);
      const slug = await uniqueSlug(generateSlug(title));
      const rows = await sql`
        INSERT INTO posts (title, slug, content, excerpt, image_url, status, featured, category_id)
        VALUES (${title}, ${slug}, ${content}, ${excerpt}, ${imageUrl}, ${status}, ${featured}, ${categoryId})
        RETURNING *`;
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT' || req.method === 'DELETE') {
      if (!verifyOrigin(req, res)) return;
      const session = await requireAuth(req, res);
      if (!session) return;

      const id = Number(req.query?.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido.' });
      }

      if (req.method === 'DELETE') {
        const rows = await sql`DELETE FROM posts WHERE id = ${id} RETURNING id`;
        if (!rows[0]) return res.status(404).json({ error: 'Post não encontrado.' });
        return res.status(200).json({ ok: true });
      }

      const { title, excerpt, imageUrl, content, status, featured, categoryId } = validatePost(req.body);
      const slug = await uniqueSlug(generateSlug(title), id);
      const rows = await sql`
        UPDATE posts
        SET title = ${title}, slug = ${slug}, content = ${content},
            excerpt = ${excerpt}, image_url = ${imageUrl},
            status = ${status}, featured = ${featured}, category_id = ${categoryId},
            updated_at = now()
        WHERE id = ${id}
        RETURNING *`;
      if (!rows[0]) return res.status(404).json({ error: 'Post não encontrado.' });
      return res.status(200).json(rows[0]);
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    if (err?.message && err.message.length < 200 && !/\bsql\b/i.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    console.error('posts error:', err);
    return res.status(500).json({ error: 'Erro no servidor.' });
  }
}

async function uniqueSlug(base, selfId = null) {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = selfId
      ? await sql`SELECT 1 FROM posts WHERE slug = ${slug} AND id <> ${selfId} LIMIT 1`
      : await sql`SELECT 1 FROM posts WHERE slug = ${slug} LIMIT 1`;
    if (!rows[0]) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

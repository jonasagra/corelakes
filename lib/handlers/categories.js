// GET/POST/PUT/DELETE /api/categories
// GET é público (o blog usa pra pintar os badges); escrita exige admin.
import { sql } from '../db.js';
import { requireAuth, verifyOrigin } from '../auth.js';
import { validateCategory, generateSlug } from '../validate.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // inclui a contagem de posts de cada categoria (para o painel)
      const rows = await sql`
        SELECT c.*, count(p.id)::int AS post_count
        FROM categories c
        LEFT JOIN posts p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name ASC`;
      return res.status(200).json(rows);
    }

    if (!verifyOrigin(req, res)) return;
    const session = await requireAuth(req, res);
    if (!session) return;

    if (req.method === 'POST') {
      const { name, color } = validateCategory(req.body);
      const slug = generateSlug(name);
      const rows = await sql`
        INSERT INTO categories (name, slug, color)
        VALUES (${name}, ${slug}, ${color})
        ON CONFLICT (name) DO NOTHING
        RETURNING *`;
      if (!rows[0]) return res.status(409).json({ error: 'Já existe uma categoria com esse nome.' });
      return res.status(201).json(rows[0]);
    }

    const id = Number(req.query?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    if (req.method === 'PUT') {
      const { name, color } = validateCategory(req.body);
      const slug = generateSlug(name);
      const rows = await sql`
        UPDATE categories SET name = ${name}, slug = ${slug}, color = ${color}
        WHERE id = ${id} RETURNING *`;
      if (!rows[0]) return res.status(404).json({ error: 'Categoria não encontrada.' });
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      // posts da categoria ficam "sem categoria" (FK ON DELETE SET NULL)
      const rows = await sql`DELETE FROM categories WHERE id = ${id} RETURNING id`;
      if (!rows[0]) return res.status(404).json({ error: 'Categoria não encontrada.' });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    if (err?.message && err.message.length < 200 && !/\bsql\b/i.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    console.error('categories error:', err);
    return res.status(500).json({ error: 'Erro no servidor.' });
  }
}

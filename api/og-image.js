// GET /api/og-image?slug=...
// Devolve um JPG 1200x630 da imagem de destaque do post, convertido NA HORA
// a partir do WebP guardado no Blob. Existe porque o site usa WebP (leve),
// mas algumas redes (Facebook, X, LinkedIn) não renderizam WebP de forma
// confiável no preview do link. Aqui entregamos um JPG padrão pra elas.
import sharp from 'sharp';
import { sql } from '../lib/db.js';

const BASE = 'https://corelakes.jonasagra.com.br';
const FALLBACK = `${BASE}/logo.webp`;

export default async function handler(req, res) {
  const slug = String(req.query?.slug || '');

  // imagem de destaque do post (ou o logo, se não houver)
  let imageUrl = FALLBACK;
  try {
    const rows = await sql`SELECT image_url FROM posts WHERE slug = ${slug} LIMIT 1`;
    if (rows[0]?.image_url) imageUrl = rows[0].image_url;
  } catch {
    /* usa o fallback */
  }

  try {
    const resp = await fetch(imageUrl);
    if (!resp.ok) throw new Error('fonte da imagem indisponível');
    const input = Buffer.from(await resp.arrayBuffer());

    const jpg = await sharp(input)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    res.setHeader('Content-Type', 'image/jpeg');
    // CDN guarda por 1 dia; revalida em segundo plano por 1 semana.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(jpg);
  } catch (err) {
    console.error('og-image error:', err);
    // último recurso: manda o logo original (raro, só se a conversão falhar).
    return res.redirect(302, FALLBACK);
  }
}

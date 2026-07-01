// POST /api/upload  (admin)
// Recebe a imagem (já reduzida no cliente) como base64 em JSON, valida tipo e
// tamanho NO SERVIDOR, converte para WEBP com sharp e envia para o Vercel Blob.
// O cliente manda JPEG (formato que TODO navegador, inclusive iOS Safari,
// consegue gerar) e o WEBP é feito aqui — assim o site fica leve sem depender
// do navegador codificar WebP. O token do Blob fica só no servidor.
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { requireAuth, verifyOrigin } from '../lib/auth.js';

// O corpo do request na Vercel é limitado a ~4.5MB. Como base64 infla ~33%,
// limitamos o arquivo real a 3MB (3MB -> ~4MB em base64, dentro do limite).
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 3 * 1024 * 1024; // 3MB do arquivo real

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!verifyOrigin(req, res)) return;

  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const { dataBase64, contentType } = req.body || {};

    if (!dataBase64 || typeof dataBase64 !== 'string') {
      return res.status(400).json({ error: 'Imagem ausente.' });
    }
    if (!ALLOWED.includes(contentType)) {
      return res.status(400).json({ error: 'Formato não suportado (use JPEG, PNG ou WEBP).' });
    }

    const buffer = Buffer.from(dataBase64, 'base64');
    if (buffer.length === 0) return res.status(400).json({ error: 'Imagem inválida.' });
    if (buffer.length > MAX_BYTES) {
      return res.status(413).json({ error: 'Imagem muito grande (máx. 3MB).' });
    }

    // Converte pra WEBP no servidor. `.rotate()` aplica a orientação do EXIF
    // (fotos de celular deitadas saem em pé). Limita a 1920px de largura.
    const webp = await sharp(buffer)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const safeName = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const blob = await put(safeName, webp, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('upload error:', err);
    return res.status(500).json({ error: 'Erro no upload.' });
  }
}

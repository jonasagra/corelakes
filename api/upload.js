// POST /api/upload  (admin)
// Recebe a imagem (já processada/redimensionada no cliente) como base64 em
// JSON, valida tipo e tamanho NO SERVIDOR e envia para o Vercel Blob.
// O token do Blob fica só no servidor (BLOB_READ_WRITE_TOKEN).
import { put } from '@vercel/blob';
import { requireAuth, verifyOrigin } from './_lib/auth.js';

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
    const { filename, dataBase64, contentType } = req.body || {};

    if (!dataBase64 || typeof dataBase64 !== 'string') {
      return res.status(400).json({ error: 'Imagem ausente.' });
    }
    if (!ALLOWED.includes(contentType)) {
      return res.status(400).json({ error: 'Formato não suportado (use JPG, PNG ou WEBP).' });
    }

    const buffer = Buffer.from(dataBase64, 'base64');
    if (buffer.length === 0) return res.status(400).json({ error: 'Imagem inválida.' });
    if (buffer.length > MAX_BYTES) {
      return res.status(413).json({ error: 'Imagem muito grande (máx. 3MB).' });
    }

    const ext = contentType.split('/')[1].replace('jpeg', 'jpg');
    const safeName = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(safeName, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('upload error:', err);
    return res.status(500).json({ error: 'Erro no upload.' });
  }
}

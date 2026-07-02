// POST /api/upload  (admin)
// Recebe a imagem como multipart/form-data (campo "file") — exatamente o que
// o front (src/utils/imageProcessor.js) envia. Valida tipo e tamanho NO
// SERVIDOR, converte para WEBP com sharp e envia para o Vercel Blob.
// O token do Blob fica só no servidor.
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { getSession } from '../../../lib/auth.js';

// O corpo do request na Vercel é limitado a ~4.5MB; limitamos o arquivo a 3MB.
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 3 * 1024 * 1024; // 3MB

export const dynamic = 'force-dynamic';

export async function POST(request) {
  // Anti-CSRF: Origin deve bater com o host do servidor.
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  try {
    if (!origin || new URL(origin).host !== host) {
      return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  }

  // Só admin autenticado (sessão validada no banco, com revogação).
  const session = await getSession({ headers: { cookie: request.headers.get('cookie') || '' } });
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Imagem ausente.' }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Formato não suportado (use JPEG, PNG ou WEBP).' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Imagem inválida.' }, { status: 400 });
    }
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: 'Imagem muito grande (máx. 3MB).' }, { status: 413 });
    }

    // Converte pra WEBP no servidor. `.rotate()` aplica a orientação do EXIF
    // (fotos de celular deitadas saem em pé). Limita a 1920px.
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

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('upload error:', err);
    return NextResponse.json({ error: 'Erro no upload.' }, { status: 500 });
  }
}

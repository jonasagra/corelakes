// Upload de imagens para /api/upload (multipart/form-data, campo "file").
// HEIC/HEIF (fotos de iPhone) são convertidas para JPEG NO NAVEGADOR com
// heic2any, porque o sharp no servidor não decodifica HEIC. Os demais
// formatos vão direto — o servidor valida, converte pra WEBP e manda pro Blob.
const HEIC_TYPES = ['image/heic', 'image/heif'];

function isHeic(file) {
  if (HEIC_TYPES.includes(file.type)) return true;
  return /\.heic$|\.heif$/i.test(file.name || '');
}

export class ApiUploader {
  async prepare(file) {
    if (!isHeic(file)) return file;
    const { default: heic2any } = await import('heic2any');
    const jpeg = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    const blob = Array.isArray(jpeg) ? jpeg[0] : jpeg;
    const name = (file.name || 'imagem').replace(/\.(heic|heif)$/i, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  }

  async upload(file) {
    const prepared = await this.prepare(file);

    const body = new FormData();
    body.append('file', prepared);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body,
      credentials: 'include',
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || 'Falha ao enviar imagem');
    return data.url;
  }
}

export class ApiUploader {
  async upload(file) {
    const body = new FormData();
    body.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body,
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Falha ao enviar imagem');
    return data.url;
  }
}

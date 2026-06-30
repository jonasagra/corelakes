// ── Cliente da API ─────────────────────────────────────────────
// O navegador NÃO fala com o banco (Neon) diretamente: só conversa com /api/*.
// A sessão vai no cookie httpOnly automaticamente (credentials: 'include');
// não há token nem chave de banco guardada no front.

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch { /* sem corpo */ }

  if (!res.ok) {
    const message = data?.error || `Erro ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get:  (p)       => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put:  (p, body) => request(p, { method: 'PUT', body }),
  del:  (p)       => request(p, { method: 'DELETE' }),
};

/**
 * Gera slug apenas para PRÉVIA na tela (ex.: mostrar a URL enquanto digita).
 * O slug definitivo é sempre gerado no servidor — nunca confie no cliente.
 */
export function generateSlug(title) {
  return String(title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

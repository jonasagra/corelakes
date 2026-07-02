// POST /api/logout  -> apaga o cookie de sessão.
import { clearSessionCookie, verifyOrigin } from '../auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!verifyOrigin(req, res)) return;
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}

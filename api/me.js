// GET /api/me -> devolve o admin logado (e se tem 2FA ativo), ou 401.
// O front usa isto para saber se mostra o dashboard. A decisão real de
// autorização acontece em cada endpoint de escrita, não aqui.
import { getSession } from '../lib/auth.js';
import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  const session = await getSession(req);
  if (!session) return res.status(401).json({ user: null });

  let twofaEnabled = false;
  try {
    const rows = await sql`SELECT totp_enabled FROM users WHERE id = ${Number(session.sub)} LIMIT 1`;
    twofaEnabled = !!rows[0]?.totp_enabled;
  } catch { /* mantém false */ }

  return res.status(200).json({ user: { email: session.email, twofaEnabled } });
}

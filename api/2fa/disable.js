// POST /api/2fa/disable  { code }  (admin)
// Desliga o 2FA. Exige um código válido para evitar que uma sessão sequestrada
// simplesmente remova a proteção.
import { sql } from '../_lib/db.js';
import { requireAuth, verifyOrigin } from '../_lib/auth.js';
import { verifyToken } from '../_lib/totp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  if (!verifyOrigin(req, res)) return;
  const session = await requireAuth(req, res);
  if (!session) return;

  const code = String(req.body?.code ?? '').trim();
  if (!code) return res.status(400).json({ error: 'Informe o código.' });

  try {
    const rows = await sql`SELECT totp_secret, totp_enabled FROM users WHERE id = ${Number(session.sub)} LIMIT 1`;
    const user = rows[0];
    if (!user?.totp_enabled) return res.status(400).json({ error: '2FA não está ativo.' });
    if (!verifyToken(code, user.totp_secret)) {
      return res.status(401).json({ error: 'Código inválido.' });
    }

    await sql`UPDATE users SET totp_secret = NULL, totp_enabled = false WHERE id = ${Number(session.sub)}`;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('2fa disable error:', err);
    return res.status(500).json({ error: 'Erro ao desativar 2FA.' });
  }
}

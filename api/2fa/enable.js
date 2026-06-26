// POST /api/2fa/enable  { code }  (admin)
// Confirma o código do app contra o segredo pendente e LIGA o 2FA.
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
    const rows = await sql`SELECT totp_secret FROM users WHERE id = ${Number(session.sub)} LIMIT 1`;
    const secret = rows[0]?.totp_secret;
    if (!secret) return res.status(400).json({ error: 'Inicie a configuração do 2FA primeiro.' });

    if (!verifyToken(code, secret)) {
      return res.status(401).json({ error: 'Código inválido. Tente novamente.' });
    }

    await sql`UPDATE users SET totp_enabled = true WHERE id = ${Number(session.sub)}`;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('2fa enable error:', err);
    return res.status(500).json({ error: 'Erro ao ativar 2FA.' });
  }
}

// POST /api/2fa  { action: 'setup' | 'enable' | 'disable', code? }  (admin)
// Rotas de 2FA consolidadas num único handler.
import QRCode from 'qrcode';
import { sql } from '../db.js';
import { requireAuth, verifyOrigin } from '../auth.js';
import { generateSecret, keyuri, verifyToken } from '../totp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  if (!verifyOrigin(req, res)) return;
  const session = await requireAuth(req, res);
  if (!session) return;

  const action = String(req.body?.action ?? '').trim();

  try {
    if (action === 'setup') {
      const secret = generateSecret();
      await sql`UPDATE users SET totp_secret = ${secret}, totp_enabled = false WHERE id = ${Number(session.sub)}`;
      const otpauth = keyuri(session.email, secret);
      const qr = await QRCode.toDataURL(otpauth);
      return res.status(200).json({ secret, otpauth, qr });
    }

    if (action === 'enable') {
      const code = String(req.body?.code ?? '').trim();
      if (!code) return res.status(400).json({ error: 'Informe o código.' });

      const rows = await sql`SELECT totp_secret FROM users WHERE id = ${Number(session.sub)} LIMIT 1`;
      const secret = rows[0]?.totp_secret;
      if (!secret) return res.status(400).json({ error: 'Inicie a configuração do 2FA primeiro.' });
      if (!verifyToken(code, secret)) {
        return res.status(401).json({ error: 'Código inválido. Tente novamente.' });
      }

      await sql`UPDATE users SET totp_enabled = true WHERE id = ${Number(session.sub)}`;
      return res.status(200).json({ ok: true });
    }

    if (action === 'disable') {
      const code = String(req.body?.code ?? '').trim();
      if (!code) return res.status(400).json({ error: 'Informe o código.' });

      const rows = await sql`SELECT totp_secret, totp_enabled FROM users WHERE id = ${Number(session.sub)} LIMIT 1`;
      const user = rows[0];
      if (!user?.totp_enabled) return res.status(400).json({ error: '2FA não está ativo.' });
      if (!verifyToken(code, user.totp_secret)) {
        return res.status(401).json({ error: 'Código inválido.' });
      }

      await sql`UPDATE users SET totp_secret = NULL, totp_enabled = false WHERE id = ${Number(session.sub)}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Ação inválida. Use setup, enable ou disable.' });
  } catch (err) {
    console.error('2fa error:', err);
    return res.status(500).json({ error: 'Erro no 2FA.' });
  }
}

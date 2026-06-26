// POST /api/2fa/setup  (admin)
// Gera um segredo TOTP "pendente" e devolve o QR para o usuário escanear.
// Só passa a valer depois de confirmar um código em /api/2fa/enable.
import QRCode from 'qrcode';
import { sql } from '../_lib/db.js';
import { requireAuth, verifyOrigin } from '../_lib/auth.js';
import { generateSecret, keyuri } from '../_lib/totp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  if (!verifyOrigin(req, res)) return;
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const secret = generateSecret();
    // Guarda como pendente (não habilita ainda).
    await sql`UPDATE users SET totp_secret = ${secret}, totp_enabled = false WHERE id = ${Number(session.sub)}`;

    const otpauth = keyuri(session.email, secret);
    const qr = await QRCode.toDataURL(otpauth);
    return res.status(200).json({ secret, otpauth, qr });
  } catch (err) {
    console.error('2fa setup error:', err);
    return res.status(500).json({ error: 'Erro ao iniciar 2FA.' });
  }
}

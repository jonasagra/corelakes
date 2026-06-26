// ── Desliga o 2FA de um admin (recuperação) ──────────────────
// Use se você perder o app autenticador e ficar trancado para fora.
// Roda direto no banco (precisa do DATABASE_URL), sem precisar de código.
//
// Uso:
//   node --env-file=.env scripts/disable-2fa.mjs "seu@email.com"
import { sql } from '../api/_lib/db.js';

const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
if (!email) {
  console.error('Uso: node --env-file=.env scripts/disable-2fa.mjs <email>');
  process.exit(1);
}

try {
  const rows = await sql`
    UPDATE users SET totp_secret = NULL, totp_enabled = false
    WHERE email = ${email}
    RETURNING email`;
  if (!rows[0]) { console.error('Usuário não encontrado.'); process.exit(1); }
  console.log(`✓ 2FA desativado para ${email}. Você já pode logar só com a senha.`);
  process.exit(0);
} catch (err) {
  console.error('Erro:', err.message);
  process.exit(1);
}

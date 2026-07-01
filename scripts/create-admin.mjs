// ── Cria (ou redefine a senha de) um admin no banco ───────────
// Uso:
//   1) Tenha DATABASE_URL no ambiente (ou em .env).
//   2) Rode:
//        node --env-file=.env scripts/create-admin.mjs "seu@email.com" "suaSenhaForte"
//      ou, sem argumentos, usando as variáveis ADMIN_EMAIL e ADMIN_PASSWORD.
//
// Roda contra o mesmo banco Neon da aplicação. A senha é guardada como
// hash scrypt; o texto puro nunca é salvo.
import { sql } from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';

const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.argv[3] || process.env.ADMIN_PASSWORD || '';

if (!email || !password) {
  console.error('Uso: node --env-file=.env scripts/create-admin.mjs <email> <senha>');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Senha muito curta. Use pelo menos 8 caracteres.');
  process.exit(1);
}

const hash = hashPassword(password);

try {
  // Ao trocar a senha (conflito de e-mail), incrementamos token_version para
  // invalidar qualquer sessão antiga que ainda esteja ativa.
  await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${hash})
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          token_version = users.token_version + 1`;
  console.log(`✓ Admin pronto: ${email}`);
  process.exit(0);
} catch (err) {
  console.error('Erro ao criar admin:', err.message);
  process.exit(1);
}

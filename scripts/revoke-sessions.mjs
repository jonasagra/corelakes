// ── Revoga TODAS as sessões ativas de um admin ───────────────
// "Deslogar de todos os lugares". Útil se você suspeitar que um crachá
// (cookie) vazou. Incrementa token_version: todos os crachás antigos param
// de valer no próximo pedido.
//
// Uso:
//   node --env-file=.env scripts/revoke-sessions.mjs "seu@email.com"
import { sql } from '../lib/db.js';

const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();

if (!email) {
  console.error('Uso: node --env-file=.env scripts/revoke-sessions.mjs <email>');
  process.exit(1);
}

try {
  const rows = await sql`
    UPDATE users SET token_version = token_version + 1
    WHERE email = ${email}
    RETURNING token_version`;
  if (!rows[0]) {
    console.error('Usuário não encontrado.');
    process.exit(1);
  }
  console.log(`✓ Sessões revogadas para ${email}. Nova versão: ${rows[0].token_version}`);
  process.exit(0);
} catch (err) {
  console.error('Erro ao revogar:', err.message);
  process.exit(1);
}

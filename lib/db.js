// ── Conexão com o Neon (Postgres) ──────────────────────────────
// O driver serverless usa HTTPS/fetch, perfeito para funções da Vercel.
// A connection string NUNCA vai para o navegador: fica só em
// process.env.DATABASE_URL (variável de ambiente do servidor).
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada nas variáveis de ambiente.');
}

export const sql = neon(process.env.DATABASE_URL);

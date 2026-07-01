// ── Limite de tentativas de login (anti força-bruta) ──────────
// Como funções serverless não compartilham memória entre invocações,
// guardamos as tentativas no próprio banco (tabela login_attempts).
import { sql } from './db.js';

const WINDOW = '15 minutes';
const MAX_ATTEMPTS = 10; // por IP, dentro da janela

export function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.socket?.remoteAddress || 'desconhecido';
}

export async function tooManyAttempts(ip) {
  const rows = await sql`
    SELECT count(*)::int AS c
    FROM login_attempts
    WHERE ip = ${ip} AND attempted_at > now() - interval '15 minutes'`;
  return (rows[0]?.c || 0) >= MAX_ATTEMPTS;
}

export async function recordAttempt(ip) {
  await sql`INSERT INTO login_attempts (ip) VALUES (${ip})`;
  // Limpeza oportunista de registros antigos (mantém a tabela pequena).
  await sql`DELETE FROM login_attempts WHERE attempted_at < now() - interval '1 hour'`;
}

export async function clearAttempts(ip) {
  await sql`DELETE FROM login_attempts WHERE ip = ${ip}`;
}

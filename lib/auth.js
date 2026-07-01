// ── Autenticação e sessão ──────────────────────────────────────
// Estratégia de segurança:
//  • Senha guardada no banco como hash scrypt (sal aleatório por usuário).
//  • Sessão = JWT assinado (HS256) com AUTH_SECRET, guardado em cookie
//    httpOnly + Secure + SameSite=Strict.
//    -> httpOnly: o JavaScript da página (e o DevTools via document.cookie)
//       NÃO consegue ler nem alterar o cookie.
//    -> assinado: ninguém forja uma sessão sem o AUTH_SECRET (que só o
//       servidor conhece).
import crypto from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { serialize, parse } from 'cookie';
import { sql } from './db.js';

const COOKIE_NAME = 'cl_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function secretKey() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error('AUTH_SECRET ausente ou curta (use >= 32 caracteres).');
  }
  return new TextEncoder().encode(s);
}

/* ── Senha: hash e verificação ─────────────────────────────────── */
// Formato guardado: "scrypt:<saltHex>:<hashHex>"
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  try {
    const [scheme, saltHex, hashHex] = String(stored).split(':');
    if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, salt, expected.length);
    // Comparação em tempo constante (evita timing attacks)
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// Hash "isca": usado no login quando o e-mail NÃO existe, só para gastar o
// mesmo tempo de um scrypt real e impedir enumeração de e-mails por timing.
export const DUMMY_HASH = hashPassword('constant-time-dummy-password');

/* ── Sessão (JWT) ──────────────────────────────────────────────── */
export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

/* ── Cookies ───────────────────────────────────────────────────── */
export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE,
  }));
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  }));
}

// Lê e valida só o JWT do cookie (sem tocar no banco).
async function readToken(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySession(token);
}

/**
 * Resolve a sessão de verdade: valida o JWT E confere no banco se a sessão
 * não foi revogada (token_version). Se o admin tiver "deslogado de todos os
 * lugares", todos os crachás antigos param de valer aqui.
 * Retorna a sessão, ou null.
 */
export async function getSession(req) {
  const payload = await readToken(req);
  if (!payload) return null;
  try {
    const rows = await sql`SELECT token_version FROM users WHERE id = ${Number(payload.sub)} LIMIT 1`;
    const user = rows[0];
    if (!user) return null;
    if (Number(user.token_version) !== Number(payload.tv)) return null; // revogada
    return payload;
  } catch {
    return null;
  }
}

/**
 * Garante que o pedido vem de um admin autenticado (com sessão não revogada).
 * Retorna a sessão, ou responde 401 e retorna null.
 * Uso: const session = await requireAuth(req, res); if (!session) return;
 */
export async function requireAuth(req, res) {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Não autorizado.' });
    return null;
  }
  return session;
}

/**
 * 2a camada anti-CSRF: confere se o header Origin bate com o host do servidor.
 * Toda escrita (POST/PUT/DELETE) deve passar por aqui. Navegadores enviam
 * Origin nesses métodos; se faltar ou divergir, rejeitamos.
 * Retorna true se ok; senão responde 403 e retorna false.
 */
export function verifyOrigin(req, res) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  try {
    if (origin && new URL(origin).host === host) return true;
  } catch { /* origin malformado */ }
  res.status(403).json({ error: 'Origem inválida.' });
  return false;
}

// POST /api/login  { email, password, code? }
// Autentica contra a tabela users e cria a sessão (cookie httpOnly).
// Endurecimentos: check de Origin, limite de tentativas por IP, verificação
// de senha em tempo constante e 2º fator (TOTP) quando o usuário tem 2FA ativo.
import { sql } from '../lib/db.js';
import { verifyPassword, signSession, setSessionCookie, verifyOrigin, DUMMY_HASH } from '../lib/auth.js';
import { clientIp, tooManyAttempts, recordAttempt, clearAttempts } from '../lib/ratelimit.js';
import { verifyToken } from '../lib/totp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!verifyOrigin(req, res)) return; // 403 já enviado

  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  const code = String(req.body?.code ?? '').trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const ip = clientIp(req);

  try {
    if (await tooManyAttempts(ip)) {
      return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos.' });
    }

    const rows = await sql`
      SELECT id, email, password_hash, token_version, totp_secret, totp_enabled
      FROM users WHERE email = ${email} LIMIT 1`;
    const user = rows[0];

    // Tempo constante: roda scrypt mesmo quando o e-mail não existe.
    const ok = user
      ? verifyPassword(password, user.password_hash)
      : (verifyPassword(password, DUMMY_HASH), false);

    if (!ok) {
      await recordAttempt(ip);
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // 2º fator: se o usuário tem 2FA ativo, exige o código do app.
    if (user.totp_enabled) {
      if (!code) {
        // Senha correta, mas falta o código. Pede o 2º passo (sem criar sessão).
        return res.status(200).json({ twofa: true });
      }
      if (!verifyToken(code, user.totp_secret)) {
        await recordAttempt(ip);
        return res.status(401).json({ error: 'Código de verificação inválido.' });
      }
    }

    await clearAttempts(ip);
    const token = await signSession({
      sub: String(user.id),
      email: user.email,
      tv: Number(user.token_version),
    });
    setSessionCookie(res, token);
    return res.status(200).json({ email: user.email });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Erro no servidor.' });
  }
}

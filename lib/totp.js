// ── 2FA (TOTP) ─────────────────────────────────────────────────
// Código de 6 dígitos de apps como Google Authenticator / Authy.
// Padrão TOTP (RFC 6238): o segredo é compartilhado uma vez (via QR) e o
// app gera os códigos localmente, sem internet. Usa a lib `otpauth`.
import { TOTP, Secret } from 'otpauth';

const ISSUER = 'Corelakes';

export function generateSecret() {
  return new Secret({ size: 20 }).base32; // string base32 para guardar no banco
}

// URI otpauth:// que vira o QR code (e identifica a conta no app).
export function keyuri(email, secret) {
  const totp = new TOTP({ issuer: ISSUER, label: email, secret: Secret.fromBase32(secret) });
  return totp.toString();
}

export function verifyToken(token, secret) {
  try {
    if (!secret) return false;
    const totp = new TOTP({ issuer: ISSUER, secret: Secret.fromBase32(secret) });
    // window:1 tolera ±30s de diferença de relógio. null = inválido.
    return totp.validate({ token: String(token).trim(), window: 1 }) !== null;
  } catch {
    return false;
  }
}

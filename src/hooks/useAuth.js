import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

/**
 * useAuth – sessão de admin validada pelo SERVIDOR.
 *
 * Não há mais flag de admin no localStorage (que qualquer um editava pelo
 * DevTools). O estado vem de /api/me, que só responde "logado" se houver um
 * cookie de sessão httpOnly válido — impossível de forjar pelo navegador.
 *
 * Retorna { user, loading, isAdmin, login, logout, checkSession, refresh }
 */
export default function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/me');
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  // Login em duas etapas: se o servidor responder { twofa: true }, a senha
  // estava certa mas falta o código do app (2º fator).
  const login = async (email, password, code) => {
    const data = await api.post('/api/login', { email, password, code });
    if (data?.twofa) return { twofa: true };
    setUser({ email: data.email });
    return { ok: true };
  };

  const logout = async () => {
    try { await api.post('/api/logout'); } catch { /* ignore */ }
    setUser(null);
  };

  return { user, loading, isAdmin: !!user, login, logout, checkSession, refresh: checkSession };
}

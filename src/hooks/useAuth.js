import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '../utils/supabase';

/**
 * useAuth – manages Supabase session & admin flag in localStorage.
 *
 * Returns { user, loading, isAdmin, login, logout, checkSession }
 */
export default function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const sb = getSupabaseClient();
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        setUser(session.user);
        setIsAdmin(true);
        localStorage.setItem('admin_authenticated', 'true');
      } else {
        setUser(null);
        setIsAdmin(localStorage.getItem('admin_authenticated') === 'true');
      }
    } catch {
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('admin_authenticated');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  const login = async (email, password) => {
    const sb = getSupabaseClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    setIsAdmin(true);
    localStorage.setItem('admin_authenticated', 'true');
    return data.user;
  };

  const logout = async () => {
    const sb = getSupabaseClient();
    await sb.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('admin_authenticated');
  };

  return { user, loading, isAdmin, login, logout, checkSession };
}

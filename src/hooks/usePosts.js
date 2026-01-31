import { useState, useCallback } from 'react';
import { getSupabaseClient, generateSlug } from '../utils/supabase';

/**
 * usePosts – CRUD layer backed by Supabase with localStorage fallback.
 */
export default function usePosts() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  /* ── helpers ──────────────────────────────────────── */
  const fmt = (p) => ({
    ...p,
    date: p.date || new Date(p.created_at).toLocaleDateString('pt-BR'),
  });

  const syncLocal = (arr) => {
    localStorage.setItem('blog_posts', JSON.stringify(arr.map(fmt)));
  };

  /* ── fetch all posts (public) ─────────────────────── */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sb   = getSupabaseClient();
      const { data, error: e } = await sb.from('posts').select('*').order('created_at', { ascending: false });
      if (e) throw e;
      const formatted = (data || []).map(fmt);
      setPosts(formatted);
      syncLocal(formatted);
    } catch (err) {
      // fall back to localStorage
      const cached = JSON.parse(localStorage.getItem('blog_posts') || '[]');
      setPosts(cached);
      if (!cached.length) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── single post by slug ──────────────────────────── */
  const getPostBySlug = useCallback(async (slug) => {
    try {
      const sb = getSupabaseClient();
      const { data, error: e } = await sb.from('posts').select('*').eq('slug', slug).single();
      if (!e && data) return fmt(data);
    } catch { /* fall through */ }
    // localStorage fallback
    const cached = JSON.parse(localStorage.getItem('blog_posts') || '[]');
    return cached.find(p => p.slug === slug) || null;
  }, []);

  /* ── create ───────────────────────────────────────── */
  const createPost = useCallback(async ({ title, content, excerpt, imageUrl }) => {
    const sb   = getSupabaseClient();
    const now  = new Date().toISOString();
    const { data, error: e } = await sb.from('posts').insert([{
      title, slug: generateSlug(title), content, excerpt,
      image_url: imageUrl || null, created_at: now, updated_at: now,
    }]).select();
    if (e) throw e;
    return fmt(data[0]);
  }, []);

  /* ── update ───────────────────────────────────────── */
  const updatePost = useCallback(async (id, { title, content, excerpt, imageUrl }) => {
    const sb = getSupabaseClient();
    const { data, error: e } = await sb.from('posts').update({
      title, slug: generateSlug(title), content, excerpt,
      image_url: imageUrl || null, updated_at: new Date().toISOString(),
    }).eq('id', id).select();
    if (e) throw e;
    return fmt(data[0]);
  }, []);

  /* ── delete ───────────────────────────────────────── */
  const deletePost = useCallback(async (id) => {
    const sb = getSupabaseClient();
    const { error: e } = await sb.from('posts').delete().eq('id', id);
    if (e) throw e;
  }, []);

  return { posts, loading, error, fetchPosts, getPostBySlug, createPost, updatePost, deletePost };
}

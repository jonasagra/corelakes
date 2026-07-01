import { useState, useCallback } from 'react';
import { api } from '@/utils/api';

export default function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fmt = (p) => ({
    ...p,
    date: p.date || (p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : ''),
  });

  const syncLocal = (arr) => {
    try { localStorage.setItem('blog_posts', JSON.stringify(arr)); } catch {}
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/posts');
      const formatted = (data || []).map(fmt);
      setPosts(formatted);
      syncLocal(formatted);
    } catch (err) {
      const cached = JSON.parse(localStorage.getItem('blog_posts') || '[]');
      setPosts(cached);
      if (!cached.length) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostBySlug = useCallback(async (slug) => {
    try {
      const data = await api.get(`/api/posts?slug=${encodeURIComponent(slug)}`);
      if (data) return fmt(data);
    } catch {}
    const cached = JSON.parse(localStorage.getItem('blog_posts') || '[]');
    return cached.find((p) => p.slug === slug) || null;
  }, []);

  const createPost = useCallback(async ({ title, content, excerpt, imageUrl }) => {
    const data = await api.post('/api/posts', { title, content, excerpt, imageUrl });
    return fmt(data);
  }, []);

  const updatePost = useCallback(async (id, { title, content, excerpt, imageUrl }) => {
    const data = await api.put(`/api/posts?id=${id}`, { title, content, excerpt, imageUrl });
    return fmt(data);
  }, []);

  const deletePost = useCallback(async (id) => {
    await api.del(`/api/posts?id=${id}`);
  }, []);

  return { posts, loading, error, fetchPosts, getPostBySlug, createPost, updatePost, deletePost };
}

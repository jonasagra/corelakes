import { useState, useCallback } from 'react';
import { api } from '@/utils/api';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/categories');
      setCategories(data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async ({ name, color }) => {
    return api.post('/api/categories', { name, color });
  }, []);

  const updateCategory = useCallback(async (id, { name, color }) => {
    return api.put(`/api/categories?id=${id}`, { name, color });
  }, []);

  const deleteCategory = useCallback(async (id) => {
    return api.del(`/api/categories?id=${id}`);
  }, []);

  return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory };
}

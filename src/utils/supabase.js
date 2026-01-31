import { createClient } from '@supabase/supabase-js';

// ── cached singleton ──────────────────────────────────
let _client = null;

// Default public (anon) credentials – read-only access to posts table
const DEFAULT_URL = 'https://nkrpxjlixrpvmvkyzobf.supabase.co';
const DEFAULT_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcnB4amxpeHJwdm12a3l6b2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyOTU1ODAsImV4cCI6MjA4NDg3MTU4MH0.EvfrUfAQKQo-scZ487m4nT2FyUggYDpavD1YTUZhfWs';

export function getSupabaseClient() {
  if (_client) return _client;

  const url = localStorage.getItem('supabase_url') || DEFAULT_URL;
  const key = localStorage.getItem('supabase_key') || DEFAULT_KEY;

  _client = createClient(url, key);
  return _client;
}

/** Persist custom credentials and reset the cached client */
export function saveSupabaseConfig(url, key) {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  _client = null; // force re-creation next call
}

/** Wipe custom credentials back to defaults */
export function clearSupabaseConfig() {
  localStorage.removeItem('supabase_url');
  localStorage.removeItem('supabase_key');
  _client = null;
}

/** Generate a URL-safe slug from a post title */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

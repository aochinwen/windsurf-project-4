import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Surface a clear error in dev. In production, the env vars must be set in Vercel.
  // eslint-disable-next-line no-console
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Cloud sync will be disabled.'
  );
}

export const supabase = url && key ? createClient(url, key) : null;

export const isCloudEnabled = () => Boolean(supabase);

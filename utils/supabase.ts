import type { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://missing-supabase-url.supabase.co',
  supabaseAnonKey ?? 'missing-supabase-anon-key',
  {},
);

export type SupabaseClient = typeof supabase;

const PATTERN_IMAGES_BUCKET = 'pattern-images';

export function getPatternImageUrl(coverImageKey: string): string {
  if (!isSupabaseConfigured) return '';

  return `${supabaseUrl}/storage/v1/object/public/${PATTERN_IMAGES_BUCKET}/${coverImageKey}.png`;
}


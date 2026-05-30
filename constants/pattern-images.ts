import { getPatternImageUrl } from '@/utils/supabase';
import type { ImageSource } from 'expo-image';

export function getPatternImageSource(coverImageKey: string): ImageSource {
  const url = getPatternImageUrl(coverImageKey);

  if (url) {
    return { uri: url };
  }

  return { uri: '' };
}

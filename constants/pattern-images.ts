import { getPatternImageUrl } from '@/utils/supabase';
import type { ImageSource } from 'expo-image';

const localImages = {
  'amigurumi-whale': require('@/assets/images/patterns/amigurumi-whale.png'),
  'basic-baby-blanket': require('@/assets/images/patterns/basic-baby-blanket.png'),
  'minimalist-coaster': require('@/assets/images/patterns/minimalist-coaster.png'),
  'round-trivet': require('@/assets/images/patterns/round-trivet.png'),
  'simple-dishcloth': require('@/assets/images/patterns/simple-dishcloth.png'),
  'ribbed-washcloth': require('@/assets/images/patterns/ribbed-washcloth.png'),
  'beginner-scarf': require('@/assets/images/patterns/beginner-scarf.png'),
  'granny-stripe-scarf': require('@/assets/images/patterns/granny-stripe-scarf.png'),
  'basic-granny-square': require('@/assets/images/patterns/basic-granny-square.png'),
  'granny-square-tote': require('@/assets/images/patterns/granny-square-tote.png'),
  'mini-granny-square-join': require('@/assets/images/patterns/mini-granny-square-join.png'),
  'cotton-face-scrubbies': require('@/assets/images/patterns/cotton-face-scrubbies.png'),
  'basic-amigurumi-ball': require('@/assets/images/patterns/basic-amigurumi-ball.png'),
  'cozy-mug-sleeve': require('@/assets/images/patterns/cozy-mug-sleeve.png'),
  'ribbed-scrunchie': require('@/assets/images/patterns/ribbed-scrunchie.png'),
  'slim-bookmark': require('@/assets/images/patterns/slim-bookmark.png'),
  'simple-drawstring-pouch': require('@/assets/images/patterns/simple-drawstring-pouch.png'),
  'mesh-market-bag': require('@/assets/images/patterns/mesh-market-bag.png'),
  'tiny-heart-applique': require('@/assets/images/patterns/tiny-heart-applique.png'),
  'simple-flower-applique': require('@/assets/images/patterns/simple-flower-applique.png'),
  'chunky-storage-basket': require('@/assets/images/patterns/chunky-storage-basket.png'),
  'easy-ribbed-beanie': require('@/assets/images/patterns/easy-ribbed-beanie.png'),
  'ribbed-headband': require('@/assets/images/patterns/ribbed-headband.png'),
} as const;

export type PatternImageKey = keyof typeof localImages;

export function getPatternImageSource(
  coverImageKey: string,
): ImageSource {
  const remoteUrl = getPatternImageUrl(coverImageKey);

  if (remoteUrl) {
    return { uri: remoteUrl };
  }

  return (localImages as Record<string, ImageSource>)[coverImageKey]
    ?? localImages['minimalist-coaster'];
}

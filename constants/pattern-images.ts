export const patternImages = {
  "minimalist-coaster": require("@/assets/images/patterns/minimalist-coaster.png"),
  "simple-dishcloth": require("@/assets/images/patterns/simple-dishcloth.png"),
  "beginner-scarf": require("@/assets/images/patterns/beginner-scarf.png"),
  "basic-granny-square": require("@/assets/images/patterns/basic-granny-square.png"),
  "mini-granny-square-join": require("@/assets/images/patterns/mini-granny-square-join.png"),
  "cotton-face-scrubbies": require("@/assets/images/patterns/cotton-face-scrubbies.png"),
  "cozy-mug-sleeve": require("@/assets/images/patterns/cozy-mug-sleeve.png"),
  "ribbed-scrunchie": require("@/assets/images/patterns/ribbed-scrunchie.png"),
  "slim-bookmark": require("@/assets/images/patterns/slim-bookmark.png"),
  "tiny-heart-applique": require("@/assets/images/patterns/tiny-heart-applique.png"),
  "simple-flower-applique": require("@/assets/images/patterns/simple-flower-applique.png"),
  "chunky-storage-basket": require("@/assets/images/patterns/chunky-storage-basket.png"),
  "easy-ribbed-beanie": require("@/assets/images/patterns/easy-ribbed-beanie.png"),
} as const;

export type PatternImageKey = keyof typeof patternImages;

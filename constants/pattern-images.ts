export const patternImages = {
  "minimalist-coaster": require("@/assets/images/patterns/minimalist-coaster.png"),
  "simple-dishcloth": require("@/assets/images/patterns/simple-dishcloth.png"),
  "beginner-scarf": require("@/assets/images/patterns/beginner-scarf.png"),
  "basic-granny-square": require("@/assets/images/patterns/basic-granny-square.png"),
  "mini-granny-square-join": require("@/assets/images/patterns/mini-granny-square-join.png"),
} as const;

export type PatternImageKey = keyof typeof patternImages;

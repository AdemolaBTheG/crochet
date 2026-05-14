import basicAmigurumiBall from "./basic-amigurumi-ball.json";
import basicGrannySquare from "./basic-granny-square.json";
import beginnerScarf from "./beginner-scarf.json";
import chunkyStorageBasket from "./chunky-storage-basket.json";
import cottonFaceScrubbies from "./cotton-face-scrubbies.json";
import cozyMugSleeve from "./cozy-mug-sleeve.json";
import easyRibbedBeanie from "./easy-ribbed-beanie.json";
import grannyStripeScarf from "./granny-stripe-scarf.json";
import miniGrannySquareJoin from "./mini-granny-square-join.json";
import minimalistCoaster from "./minimalist-coaster.json";
import ribbedHeadband from "./ribbed-headband.json";
import ribbedScrunchie from "./ribbed-scrunchie.json";
import ribbedWashcloth from "./ribbed-washcloth.json";
import roundTrivet from "./round-trivet.json";
import simpleDishcloth from "./simple-dishcloth.json";
import simpleDrawstringPouch from "./simple-drawstring-pouch.json";
import simpleFlowerApplique from "./simple-flower-applique.json";
import slimBookmark from "./slim-bookmark.json";
import tinyHeartApplique from "./tiny-heart-applique.json";

type PatternStep = {
  type: "instruction" | "row" | "round" | "repeat";
  title: string;
  instruction: string;
  counterLabel?: string;
  targetCount?: number;
};

type PatternContent = {
  title: string;
  description: string;
  materials: string[];
  skills: string[];
  expectationText: string;
  steps: PatternStep[];
};

const patternContentMap: Record<string, PatternContent> = {
  "basic-amigurumi-ball": basicAmigurumiBall as PatternContent,
  "basic-granny-square": basicGrannySquare as PatternContent,
  "beginner-scarf": beginnerScarf as PatternContent,
  "chunky-storage-basket": chunkyStorageBasket as PatternContent,
  "cotton-face-scrubbies": cottonFaceScrubbies as PatternContent,
  "cozy-mug-sleeve": cozyMugSleeve as PatternContent,
  "easy-ribbed-beanie": easyRibbedBeanie as PatternContent,
  "granny-stripe-scarf": grannyStripeScarf as PatternContent,
  "mini-granny-square-join": miniGrannySquareJoin as PatternContent,
  "minimalist-coaster": minimalistCoaster as PatternContent,
  "ribbed-headband": ribbedHeadband as PatternContent,
  "ribbed-scrunchie": ribbedScrunchie as PatternContent,
  "ribbed-washcloth": ribbedWashcloth as PatternContent,
  "round-trivet": roundTrivet as PatternContent,
  "simple-dishcloth": simpleDishcloth as PatternContent,
  "simple-drawstring-pouch": simpleDrawstringPouch as PatternContent,
  "simple-flower-applique": simpleFlowerApplique as PatternContent,
  "slim-bookmark": slimBookmark as PatternContent,
  "tiny-heart-applique": tinyHeartApplique as PatternContent,
};

export default patternContentMap;
export type { PatternContent, PatternStep };

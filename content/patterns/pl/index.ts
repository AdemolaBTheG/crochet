import amigurumiWhale from "./amigurumi-whale.json";
import basicAmigurumiBall from "./basic-amigurumi-ball.json";
import basicBabyBlanket from "./basic-baby-blanket.json";
import basicGrannySquare from "./basic-granny-square.json";
import beginnerScarf from "./beginner-scarf.json";
import bucketHat from "./bucket-hat.json";
import chunkyStorageBasket from "./chunky-storage-basket.json";
import cottonFaceScrubbies from "./cotton-face-scrubbies.json";
import crochetBunny from "./crochet-bunny.json";
import crochetMouse from "./crochet-mouse.json";
import cozyMugSleeve from "./cozy-mug-sleeve.json";
import easyRibbedBeanie from "./easy-ribbed-beanie.json";
import flowerGrannySquare from "./flower-granny-square.json";
import grannySquareTote from "./granny-square-tote.json";
import grannyStripeScarf from "./granny-stripe-scarf.json";
import meshBeachBag from "./mesh-beach-bag.json";
import meshMarketBag from "./mesh-market-bag.json";
import miniGrannySquareJoin from "./mini-granny-square-join.json";
import minimalistCoaster from "./minimalist-coaster.json";
import ribbedHeadband from "./ribbed-headband.json";
import ribbedScrunchie from "./ribbed-scrunchie.json";
import ribbedWashcloth from "./ribbed-washcloth.json";
import roundTrivet from "./round-trivet.json";
import shellStitchScarf from "./shell-stitch-scarf.json";
import simpleBeanie from "./simple-beanie.json";
import simpleDishcloth from "./simple-dishcloth.json";
import simpleDrawstringPouch from "./simple-drawstring-pouch.json";
import simpleFlowerApplique from "./simple-flower-applique.json";
import simpleMarketBag from "./simple-market-bag.json";
import slimBookmark from "./slim-bookmark.json";
import tinyHeartApplique from "./tiny-heart-applique.json";
import tunisianPotholder from "./tunisian-potholder.json";
import waveStitchBlanket from "./wave-stitch-blanket.json";

import babyBooties from "./baby-booties.json";
import bandanaHeadscarf from "./bandana-headscarf.json";
import simpleCrochetVest from "./simple-crochet-vest.json";
import crochetLaptopSleeve from "./crochet-laptop-sleeve.json";
import waterBottleHolder from "./water-bottle-holder.json";
import glassesCase from "./glasses-case.json";
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
  "amigurumi-whale": amigurumiWhale as PatternContent,
  "basic-amigurumi-ball": basicAmigurumiBall as PatternContent,
  "basic-baby-blanket": basicBabyBlanket as PatternContent,
  "basic-granny-square": basicGrannySquare as PatternContent,
  "beginner-scarf": beginnerScarf as PatternContent,
  "bucket-hat": bucketHat as PatternContent,
  "chunky-storage-basket": chunkyStorageBasket as PatternContent,
  "cotton-face-scrubbies": cottonFaceScrubbies as PatternContent,
  "crochet-bunny": crochetBunny as PatternContent,
  "crochet-mouse": crochetMouse as PatternContent,
  "cozy-mug-sleeve": cozyMugSleeve as PatternContent,
  "easy-ribbed-beanie": easyRibbedBeanie as PatternContent,
  "flower-granny-square": flowerGrannySquare as PatternContent,
  "granny-square-tote": grannySquareTote as PatternContent,
  "granny-stripe-scarf": grannyStripeScarf as PatternContent,
  "mesh-beach-bag": meshBeachBag as PatternContent,
  "mesh-market-bag": meshMarketBag as PatternContent,
  "mini-granny-square-join": miniGrannySquareJoin as PatternContent,
  "minimalist-coaster": minimalistCoaster as PatternContent,
  "ribbed-headband": ribbedHeadband as PatternContent,
  "ribbed-scrunchie": ribbedScrunchie as PatternContent,
  "ribbed-washcloth": ribbedWashcloth as PatternContent,
  "round-trivet": roundTrivet as PatternContent,
  "shell-stitch-scarf": shellStitchScarf as PatternContent,
  "simple-beanie": simpleBeanie as PatternContent,
  "simple-dishcloth": simpleDishcloth as PatternContent,
  "simple-drawstring-pouch": simpleDrawstringPouch as PatternContent,
  "simple-flower-applique": simpleFlowerApplique as PatternContent,
  "simple-market-bag": simpleMarketBag as PatternContent,
  "slim-bookmark": slimBookmark as PatternContent,
  "tiny-heart-applique": tinyHeartApplique as PatternContent,
  "tunisian-potholder": tunisianPotholder as PatternContent,
  "wave-stitch-blanket": waveStitchBlanket as PatternContent,
  "baby-booties": babyBooties as PatternContent,
  "bandana-headscarf": bandanaHeadscarf as PatternContent,
  "simple-crochet-vest": simpleCrochetVest as PatternContent,
  "crochet-laptop-sleeve": crochetLaptopSleeve as PatternContent,
  "water-bottle-holder": waterBottleHolder as PatternContent,
  "glasses-case": glassesCase as PatternContent,
};

export default patternContentMap;
export type { PatternContent, PatternStep };

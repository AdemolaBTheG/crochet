import backLoopOnlyRibbing from "./back-loop-only-ribbing.json";
import chainSpacesAndCorners from "./chain-spaces-and-corners.json";
import doubleCrochet from "./double-crochet.json";
import fastenOffAndWeaveEnds from "./fasten-off-and-weave-ends.json";
import foundationChain from "./foundation-chain.json";
import halfDoubleCrochet from "./half-double-crochet.json";
import increasingAndDecreasing from "./increasing-and-decreasing.json";
import magicRing from "./magic-ring.json";
import singleCrochet from "./single-crochet.json";
import slipKnotAndHold from "./slip-knot-and-hold.json";
import slipStitchAndJoin from "./slip-stitch-and-join.json";
import workingInRounds from "./working-in-rounds.json";
import workingInRows from "./working-in-rows.json";

type LessonContent = {
  title: string;
  description: string;
  content: {
    summary: string;
    whyItMatters: string;
    steps: string[];
    practice: string;
    commonMistakes: string[];
  };
};

const lessonContentMap: Record<string, LessonContent> = {
  "back-loop-only-ribbing": backLoopOnlyRibbing as LessonContent,
  "chain-spaces-and-corners": chainSpacesAndCorners as LessonContent,
  "double-crochet": doubleCrochet as LessonContent,
  "fasten-off-and-weave-ends": fastenOffAndWeaveEnds as LessonContent,
  "foundation-chain": foundationChain as LessonContent,
  "half-double-crochet": halfDoubleCrochet as LessonContent,
  "increasing-and-decreasing": increasingAndDecreasing as LessonContent,
  "magic-ring": magicRing as LessonContent,
  "single-crochet": singleCrochet as LessonContent,
  "slip-knot-and-hold": slipKnotAndHold as LessonContent,
  "slip-stitch-and-join": slipStitchAndJoin as LessonContent,
  "working-in-rounds": workingInRounds as LessonContent,
  "working-in-rows": workingInRows as LessonContent,
};

export default lessonContentMap;
export type { LessonContent };

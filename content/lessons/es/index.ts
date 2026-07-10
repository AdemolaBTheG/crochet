import backLoopOnlyRibbing from "./back-loop-only-ribbing.json";
import blockingBasics from "./blocking-basics.json";
import chainSpacesAndCorners from "./chain-spaces-and-corners.json";
import colorChanges from "./color-changes.json";
import doubleCrochet from "./double-crochet.json";
import fastenOffAndWeaveEnds from "./fasten-off-and-weave-ends.json";
import foundationChain from "./foundation-chain.json";
import frontPostAndBackPost from "./front-post-and-back-post.json";
import gaugeBasics from "./gauge-basics.json";
import halfDoubleCrochet from "./half-double-crochet.json";
import increasingAndDecreasing from "./increasing-and-decreasing.json";
import invisibleDecreaseForAmigurumi from "./invisible-decrease-for-amigurumi.json";
import joiningGrannySquares from "./joining-granny-squares.json";
import magicRing from "./magic-ring.json";
import readingPatternAbbreviations from "./reading-pattern-abbreviations.json";
import shellStitch from "./shell-stitch.json";
import singleCrochet from "./single-crochet.json";
import slipKnotAndHold from "./slip-knot-and-hold.json";
import slipStitchAndJoin from "./slip-stitch-and-join.json";
import trebleCrochet from "./treble-crochet.json";
import workingInRounds from "./working-in-rounds.json";
import workingInRows from "./working-in-rows.json";

import bordersAndEdgings from "./borders-and-edgings.json";
import seamingAndAssemblyBasics from "./seaming-and-assembly-basics.json";
import crochetCordsAndStraps from "./crochet-cords-and-straps.json";
import buttonholesAndSimpleClosures from "./buttonholes-and-simple-closures.json";
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
  "blocking-basics": blockingBasics as LessonContent,
  "chain-spaces-and-corners": chainSpacesAndCorners as LessonContent,
  "color-changes": colorChanges as LessonContent,
  "double-crochet": doubleCrochet as LessonContent,
  "fasten-off-and-weave-ends": fastenOffAndWeaveEnds as LessonContent,
  "foundation-chain": foundationChain as LessonContent,
  "front-post-and-back-post": frontPostAndBackPost as LessonContent,
  "gauge-basics": gaugeBasics as LessonContent,
  "half-double-crochet": halfDoubleCrochet as LessonContent,
  "increasing-and-decreasing": increasingAndDecreasing as LessonContent,
  "invisible-decrease-for-amigurumi": invisibleDecreaseForAmigurumi as LessonContent,
  "joining-granny-squares": joiningGrannySquares as LessonContent,
  "magic-ring": magicRing as LessonContent,
  "reading-pattern-abbreviations": readingPatternAbbreviations as LessonContent,
  "shell-stitch": shellStitch as LessonContent,
  "single-crochet": singleCrochet as LessonContent,
  "slip-knot-and-hold": slipKnotAndHold as LessonContent,
  "slip-stitch-and-join": slipStitchAndJoin as LessonContent,
  "treble-crochet": trebleCrochet as LessonContent,
  "working-in-rounds": workingInRounds as LessonContent,
  "working-in-rows": workingInRows as LessonContent,
  "borders-and-edgings": bordersAndEdgings as LessonContent,
  "seaming-and-assembly-basics": seamingAndAssemblyBasics as LessonContent,
  "crochet-cords-and-straps": crochetCordsAndStraps as LessonContent,
  "buttonholes-and-simple-closures": buttonholesAndSimpleClosures as LessonContent,
};

export default lessonContentMap;
export type { LessonContent };

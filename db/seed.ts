import * as schema from "@/db/schema";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

type LessonContent = {
  summary: string;
  whyItMatters: string;
  steps: string[];
  practice: string;
  commonMistakes: string[];
};

type PatternStep = {
  type: "instruction" | "row" | "round" | "repeat";
  title: string;
  instruction: string;
  counterLabel?: string;
  targetCount?: number;
};

function lessonContent(content: LessonContent) {
  return JSON.stringify(content);
}

function patternSteps(steps: PatternStep[]) {
  return JSON.stringify(steps);
}

const lessonSeeds: schema.NewLesson[] = [
  {
    slug: "slip-knot-and-hold",
    title: "Slip Knot and Holding Your Hook",
    description: "Set up your yarn and hook comfortably before making your first stitch.",
    sortOrder: 1,
    difficulty: "beginner",
    content: lessonContent({
      summary: "Learn how to make a slip knot and hold the hook and yarn without fighting the tension.",
      whyItMatters: "Every crochet project starts here. A smooth setup makes every stitch easier.",
      steps: [
        "Wrap the yarn over itself to make a loop.",
        "Pull a strand through the loop to create the slip knot.",
        "Tighten the knot gently on the hook so it can still slide.",
        "Practice holding the hook and guiding yarn with even tension.",
      ],
      practice: "Make and remove the slip knot three times until it feels easy.",
      commonMistakes: [
        "Pulling the knot too tight on the hook.",
        "Gripping the yarn so tightly that the hook cannot move.",
      ],
    }),
    videoUrl: null,
  },
  {
    slug: "foundation-chain",
    title: "Foundation Chain",
    description: "Make the starting chain used for rows, scarves, dishcloths, and more.",
    sortOrder: 2,
    difficulty: "beginner",
    content: lessonContent({
      summary: "Learn the yarn-over motion and create even chain stitches.",
      whyItMatters: "The foundation chain determines the width of many beginner projects.",
      steps: [
        "Start with a slip knot on the hook.",
        "Yarn over from back to front.",
        "Pull the yarn through the loop on the hook.",
        "Repeat until your chain length looks even.",
      ],
      practice: "Chain 15 stitches twice and compare how even they look.",
      commonMistakes: [
        "Making chains so tight the hook cannot pass through them later.",
        "Twisting the chain and losing the front vs back of the stitches.",
      ],
    }),
    videoUrl: null,
  },
  {
    slug: "single-crochet",
    title: "Single Crochet",
    description: "Learn the most useful beginner stitch for compact, sturdy fabric.",
    sortOrder: 3,
    difficulty: "beginner",
    content: lessonContent({
      summary: "Insert the hook, pull up a loop, and complete a simple stitch with two loops on the hook.",
      whyItMatters: "Single crochet is a core stitch used in coasters, amigurumi, dishcloths, and borders.",
      steps: [
        "Insert the hook into the next stitch.",
        "Yarn over and pull up a loop.",
        "Yarn over again and pull through both loops.",
        "Repeat across the row.",
      ],
      practice: "Work 3 rows of 10 single crochet stitches.",
      commonMistakes: [
        "Accidentally skipping the last stitch in the row.",
        "Adding extra stitches at the edges without noticing.",
      ],
    }),
    videoUrl: null,
  },
  {
    slug: "slip-stitch-and-join",
    title: "Slip Stitch and Joining",
    description: "Use slip stitch to move neatly, join rounds, and finish edges cleanly.",
    sortOrder: 4,
    difficulty: "beginner",
    content: lessonContent({
      summary: "A slip stitch is short and simple, but it is essential for joining rounds and edging.",
      whyItMatters: "You need this for coasters, granny squares, and any project worked in the round.",
      steps: [
        "Insert the hook into the stitch or space.",
        "Yarn over and pull through the stitch and the loop on the hook at once.",
        "Use slip stitch to join the end of a round to the first stitch.",
      ],
      practice: "Make a short chain, join it into a ring, and practice slip stitching around it.",
      commonMistakes: [
        "Pulling slip stitches too tight.",
        "Joining to the wrong stitch and shifting the round start.",
      ],
    }),
    videoUrl: null,
  },
  {
    slug: "half-double-crochet",
    title: "Half Double Crochet",
    description: "A versatile stitch that works up faster than single crochet but stays easy to read.",
    sortOrder: 5,
    difficulty: "beginner",
    content: lessonContent({
      summary: "Half double crochet sits between single and double crochet in height and speed.",
      whyItMatters: "It is ideal for scarves, simple garments, and soft, flexible fabric.",
      steps: [
        "Yarn over before inserting the hook.",
        "Insert the hook into the next stitch and pull up a loop.",
        "Yarn over and pull through all three loops on the hook.",
      ],
      practice: "Work 2 rows of 12 half double crochet stitches.",
      commonMistakes: [
        "Forgetting the first yarn over.",
        "Pulling through two loops instead of all three.",
      ],
    }),
    videoUrl: null,
  },
  {
    slug: "double-crochet",
    title: "Double Crochet",
    description: "Build taller stitches for airy fabric and classic granny-square clusters.",
    sortOrder: 6,
    difficulty: "beginner",
    content: lessonContent({
      summary: "Double crochet is tall, rhythmic, and one of the most important stitches to master.",
      whyItMatters: "You need it for granny squares, shawls, scarves, and many decorative patterns.",
      steps: [
        "Yarn over before inserting the hook.",
        "Insert the hook and pull up a loop.",
        "Yarn over and pull through two loops.",
        "Yarn over and pull through the final two loops.",
      ],
      practice: "Work 2 rows of 10 double crochet stitches.",
      commonMistakes: [
        "Pulling through all loops at once.",
        "Forgetting the turning-chain height at the start of a row.",
      ],
    }),
    videoUrl: null,
  },
  {
    slug: "working-in-rows",
    title: "Working in Rows",
    description: "Learn when to turn your work and how to keep your stitch count steady.",
    sortOrder: 7,
    difficulty: "beginner",
    content: lessonContent({
      summary: "Rows teach you to turn the work, use turning chains, and avoid growing or shrinking accidentally.",
      whyItMatters: "Dishcloths and scarves depend on steady row counts and consistent edges.",
      steps: [
        "Finish a row and make the correct turning chain.",
        "Turn the work so the back faces you.",
        "Start the next row in the correct stitch for that stitch type.",
        "Count stitches at the end of each row.",
      ],
      practice: "Make a 5-row swatch and count stitches after every row.",
      commonMistakes: [
        "Working into the turning chain by accident.",
        "Skipping the final stitch at the edge.",
      ],
    }),
    videoUrl: null,
  },
  {
    slug: "working-in-rounds",
    title: "Working in Rounds",
    description: "Learn to build circles and motifs without losing your place.",
    sortOrder: 8,
    difficulty: "beginner",
    content: lessonContent({
      summary: "Rounds are built around a center point and often joined or marked at the end.",
      whyItMatters: "Coasters and granny squares depend on clean, easy-to-follow round structure.",
      steps: [
        "Create a center ring or chain loop.",
        "Place stitches around the center.",
        "Join the round with a slip stitch or continue in a spiral.",
        "Track the first stitch of each round carefully.",
      ],
      practice: "Make two practice circles with 6 to 12 stitches in the round.",
      commonMistakes: [
        "Losing the round start.",
        "Adding stitches unevenly and warping the circle.",
      ],
    }),
    videoUrl: null,
  },
  {
    slug: "magic-ring",
    title: "Magic Ring",
    description: "Start circular projects with a tight center instead of a visible hole.",
    sortOrder: 9,
    difficulty: "beginner",
    content: lessonContent({
      summary: "The magic ring gives you an adjustable center for granny squares and round motifs.",
      whyItMatters: "It makes circular projects look cleaner and more finished.",
      steps: [
        "Wrap the yarn into a loose ring around your fingers.",
        "Insert the hook through the ring and pull up a loop.",
        "Chain to secure the ring.",
        "Work stitches into the ring, then pull the tail to close the center.",
      ],
      practice: "Make three magic rings and close each one fully.",
      commonMistakes: [
        "Securing the ring too loosely before stitching into it.",
        "Pulling the tail before enough stitches are anchored.",
      ],
    }),
    videoUrl: null,
  },
  {
    slug: "fasten-off-and-weave-ends",
    title: "Fasten Off and Weave in Ends",
    description: "Finish projects cleanly so they stay secure after washing and use.",
    sortOrder: 10,
    difficulty: "beginner",
    content: lessonContent({
      summary: "Fastening off and weaving in ends is the final step that makes the work feel complete.",
      whyItMatters: "A project is not finished until the yarn tails are secure and tidy.",
      steps: [
        "Cut the yarn leaving a tail.",
        "Pull the tail fully through the last loop.",
        "Thread the tail onto a yarn needle.",
        "Weave the tail through nearby stitches in more than one direction.",
      ],
      practice: "Fasten off one swatch and weave in both tails neatly.",
      commonMistakes: [
        "Leaving tails too short.",
        "Weaving in a straight line only, which can work loose over time.",
      ],
    }),
    videoUrl: null,
  },
];

const patternSeeds: schema.NewPattern[] = [
  {
    slug: "minimalist-coaster",
    title: "Minimalist Coaster",
    description: "A fast circular project for learning rounds, joining, and simple stitch repetition.",
    difficulty: "beginner",
    category: "home",
    coverImageKey: "minimalist-coaster",
    estimatedMinutes: 20,
    materialsText: "Cotton yarn, 4 to 5 mm hook, yarn needle, scissors.",
    skillsText: "Magic ring, single crochet, slip stitch, working in rounds",
    expectationText: "A quick round project where you practice building a flat circle, joining neatly, and finishing something useful in one short sitting.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Make a center ring",
        instruction: "Start with a magic ring or chain 4 and join into a loop.",
      },
      {
        type: "round",
        title: "Round 1",
        instruction: "Work 8 single crochet into the ring and join with a slip stitch.",
        counterLabel: "round",
        targetCount: 1,
      },
      {
        type: "round",
        title: "Round 2",
        instruction: "Work 2 single crochet into each stitch around for 16 stitches total.",
        counterLabel: "round",
        targetCount: 2,
      },
      {
        type: "round",
        title: "Round 3",
        instruction: "Alternate 1 single crochet, then 2 single crochet in the next stitch around.",
        counterLabel: "round",
        targetCount: 3,
      },
      {
        type: "instruction",
        title: "Finish",
        instruction: "Slip stitch to join, fasten off, and weave in the end.",
      },
    ]),
  },
  {
    slug: "simple-dishcloth",
    title: "Simple Dishcloth",
    description: "A practical square project for learning rows and building even tension.",
    difficulty: "beginner",
    category: "home",
    coverImageKey: "simple-dishcloth",
    estimatedMinutes: 45,
    materialsText: "Cotton yarn, 5 mm hook, yarn needle, scissors.",
    skillsText: "Foundation chain, single crochet, turning rows, weaving ends",
    expectationText: "A steady row-by-row project for practicing even tension, clean edges, and the rhythm of turning your work.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Foundation",
        instruction: "Chain 21 stitches.",
      },
      {
        type: "row",
        title: "Row 1",
        instruction: "Single crochet into the second chain from the hook and each chain across.",
        counterLabel: "row",
        targetCount: 1,
      },
      {
        type: "repeat",
        title: "Rows 2 to 18",
        instruction: "Chain 1, turn, and single crochet in each stitch across.",
        counterLabel: "row",
        targetCount: 18,
      },
      {
        type: "instruction",
        title: "Finish",
        instruction: "Fasten off and weave in both ends.",
      },
    ]),
  },
  {
    slug: "beginner-scarf",
    title: "Beginner Scarf",
    description: "A long, repetitive project that makes row tracking genuinely useful.",
    difficulty: "beginner",
    category: "wearable",
    coverImageKey: "beginner-scarf",
    estimatedMinutes: 120,
    materialsText: "Soft worsted yarn, 5.5 mm hook, yarn needle, scissors.",
    skillsText: "Foundation chain, half double crochet, turning rows, row counting",
    expectationText: "A longer repeat project where the app helps you stay on track without recounting every row from scratch.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Foundation",
        instruction: "Chain 26 stitches.",
      },
      {
        type: "row",
        title: "Row 1",
        instruction: "Half double crochet in the third chain from the hook and each chain across.",
        counterLabel: "row",
        targetCount: 1,
      },
      {
        type: "repeat",
        title: "Rows 2 to 40",
        instruction: "Chain 2, turn, and work half double crochet across each row.",
        counterLabel: "row",
        targetCount: 40,
      },
      {
        type: "instruction",
        title: "Finish",
        instruction: "Fasten off, weave in ends, and block lightly if needed.",
      },
    ]),
  },
  {
    slug: "basic-granny-square",
    title: "Basic Granny Square",
    description: "A classic crochet motif that teaches double crochet clusters and corners.",
    difficulty: "beginner",
    category: "motif",
    coverImageKey: "basic-granny-square",
    estimatedMinutes: 35,
    materialsText: "Worsted yarn, 5 mm hook, yarn needle, scissors.",
    skillsText: "Magic ring, double crochet, chain spaces, slip stitch joining",
    expectationText: "A classic motif that teaches corners, clusters, and round structure without jumping into a huge project.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Center ring",
        instruction: "Create a magic ring or chain 4 and join into a loop.",
      },
      {
        type: "round",
        title: "Round 1",
        instruction: "Make 4 granny clusters separated by chain spaces and join to close the square.",
        counterLabel: "round",
        targetCount: 1,
      },
      {
        type: "round",
        title: "Round 2",
        instruction: "Slip stitch to a corner space, build the next layer of granny clusters, and form corners with chain spaces.",
        counterLabel: "round",
        targetCount: 2,
      },
      {
        type: "round",
        title: "Round 3",
        instruction: "Repeat granny clusters along the sides and corners until the square reaches the size you want.",
        counterLabel: "round",
        targetCount: 3,
      },
      {
        type: "instruction",
        title: "Finish",
        instruction: "Join the round, fasten off, and weave in ends.",
      },
    ]),
  },
  {
    slug: "mini-granny-square-join",
    title: "Mini Granny Square Join Project",
    description: "Turn four granny squares into one small finished project so the user completes something real.",
    difficulty: "beginner",
    category: "motif",
    coverImageKey: "mini-granny-square-join",
    estimatedMinutes: 75,
    materialsText: "Worsted yarn, 5 mm hook, yarn needle, scissors.",
    skillsText: "Granny squares, slip stitch joining, seaming, weaving ends",
    expectationText: "A small finishing project where you turn separate squares into one piece and practice simple joining with confidence.",
    stepsJson: patternSteps([
      {
        type: "repeat",
        title: "Make four squares",
        instruction: "Complete the basic granny square pattern four times.",
        targetCount: 4,
      },
      {
        type: "instruction",
        title: "Arrange the squares",
        instruction: "Lay the four squares in a 2 by 2 layout with the right sides facing up.",
      },
      {
        type: "instruction",
        title: "Join the first seam",
        instruction: "Use slip stitch or whip stitch to join the top two squares.",
      },
      {
        type: "instruction",
        title: "Join the second seam",
        instruction: "Join the bottom two squares, then connect the rows together.",
      },
      {
        type: "instruction",
        title: "Finish",
        instruction: "Weave in all ends and lightly shape the finished piece.",
      },
    ]),
  },
];

export async function seedDatabase(db: ExpoSQLiteDatabase<typeof schema>) {
  const existingLessons = await db
    .select({ id: schema.lessons.id })
    .from(schema.lessons)
    .limit(1);

  if (existingLessons.length === 0) {
    await db
      .insert(schema.lessons)
      .values(lessonSeeds)
      .onConflictDoNothing({ target: schema.lessons.slug });
  }

  const existingPatterns = await db
    .select({ id: schema.patterns.id })
    .from(schema.patterns)
    .limit(1);

  if (existingPatterns.length === 0) {
    await db
      .insert(schema.patterns)
      .values(patternSeeds)
      .onConflictDoNothing({ target: schema.patterns.slug });
  }
}

export { lessonSeeds, patternSeeds };

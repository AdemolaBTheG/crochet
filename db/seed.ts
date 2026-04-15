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
  {
    slug: "cotton-face-scrubbies",
    title: "Cotton Face Scrubbies",
    description: "A tiny reusable round that gives beginners another fast win with increases.",
    difficulty: "beginner",
    category: "home",
    coverImageKey: "cotton-face-scrubbies",
    estimatedMinutes: 25,
    materialsText: "Cotton yarn, 4 mm hook, yarn needle, scissors.",
    skillsText: "Magic ring, single crochet, increasing, slip stitch joining",
    expectationText: "A low-pressure mini project where you make a soft reusable round and practice keeping increases even.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Make the center",
        instruction: "Start with a magic ring or chain 4 and join into a loop.",
      },
      {
        type: "round",
        title: "Round 1",
        instruction: "Work 8 single crochet into the center ring and join with a slip stitch.",
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
        title: "Finish the edge",
        instruction: "Slip stitch around the edge, fasten off, and weave in the ends.",
      },
    ]),
  },
  {
    slug: "cozy-mug-sleeve",
    title: "Cozy Mug Sleeve",
    description: "A small rectangle project that wraps around a mug and teaches simple finishing.",
    difficulty: "beginner",
    category: "home",
    coverImageKey: "cozy-mug-sleeve",
    estimatedMinutes: 40,
    materialsText: "Worsted cotton yarn, 5 mm hook, yarn needle, scissors, button.",
    skillsText: "Foundation chain, half double crochet, turning rows, button loop",
    expectationText: "A practical rectangle that turns into a finished object with one small joining detail at the end.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Foundation",
        instruction: "Chain 12 stitches for the height of the sleeve.",
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
        title: "Rows 2 to 18",
        instruction: "Chain 2, turn, and half double crochet across until the sleeve wraps around your mug.",
        counterLabel: "row",
        targetCount: 18,
      },
      {
        type: "instruction",
        title: "Add a loop",
        instruction: "Chain a small loop at one short edge for the button closure.",
      },
      {
        type: "instruction",
        title: "Attach the button",
        instruction: "Sew a button to the opposite edge, fasten off, and weave in ends.",
      },
    ]),
  },
  {
    slug: "ribbed-scrunchie",
    title: "Ribbed Scrunchie",
    description: "A quick wearable project made around a hair elastic with beginner-friendly repeats.",
    difficulty: "beginner",
    category: "wearable",
    coverImageKey: "ribbed-scrunchie",
    estimatedMinutes: 35,
    materialsText: "Soft yarn, 4.5 mm hook, hair elastic, yarn needle, scissors.",
    skillsText: "Single crochet, half double crochet, working around an elastic, joining",
    expectationText: "A playful quick project where repetition builds confidence and the finished result feels giftable.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Cover the elastic",
        instruction: "Join yarn around the hair elastic and single crochet evenly around it.",
      },
      {
        type: "round",
        title: "Round 1",
        instruction: "Work enough single crochet around the elastic so the band is fully covered.",
        counterLabel: "round",
        targetCount: 1,
      },
      {
        type: "round",
        title: "Round 2",
        instruction: "Chain 2, then work half double crochet into each stitch around.",
        counterLabel: "round",
        targetCount: 2,
      },
      {
        type: "round",
        title: "Round 3",
        instruction: "Work one more round of half double crochet for a fuller scrunchie.",
        counterLabel: "round",
        targetCount: 3,
      },
      {
        type: "instruction",
        title: "Finish",
        instruction: "Slip stitch to join, fasten off, and weave the tail inside the folds.",
      },
    ]),
  },
  {
    slug: "slim-bookmark",
    title: "Slim Bookmark",
    description: "A narrow row project for practicing edges, tension, and a tiny tassel finish.",
    difficulty: "beginner",
    category: "gift",
    coverImageKey: "slim-bookmark",
    estimatedMinutes: 30,
    materialsText: "Cotton yarn, 3.5 to 4 mm hook, yarn needle, scissors.",
    skillsText: "Foundation chain, single crochet, turning rows, tassel making",
    expectationText: "A neat little project that rewards careful tension and gives you a finished gift in under an hour.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Foundation",
        instruction: "Chain 8 stitches for a slim bookmark width.",
      },
      {
        type: "row",
        title: "Row 1",
        instruction: "Single crochet in the second chain from the hook and each chain across.",
        counterLabel: "row",
        targetCount: 1,
      },
      {
        type: "repeat",
        title: "Rows 2 to 24",
        instruction: "Chain 1, turn, and single crochet across each row.",
        counterLabel: "row",
        targetCount: 24,
      },
      {
        type: "instruction",
        title: "Add a tassel",
        instruction: "Cut a few yarn strands and attach them to one short edge.",
      },
      {
        type: "instruction",
        title: "Finish",
        instruction: "Trim the tassel evenly and weave in the starting tail.",
      },
    ]),
  },
  {
    slug: "tiny-heart-applique",
    title: "Tiny Heart Applique",
    description: "A small decorative heart for practicing shaping in one quick round.",
    difficulty: "beginner",
    category: "gift",
    coverImageKey: "tiny-heart-applique",
    estimatedMinutes: 20,
    materialsText: "Cotton yarn, 4 mm hook, yarn needle, scissors.",
    skillsText: "Magic ring, double crochet, treble crochet, slip stitch",
    expectationText: "A tiny shaped motif that teaches how stitch height changes the outline of a design.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Make the ring",
        instruction: "Start with a magic ring and chain 2 to begin the heart shape.",
      },
      {
        type: "round",
        title: "Build the lobes",
        instruction: "Work taller stitches into the ring to form the rounded top of the heart.",
        counterLabel: "round",
        targetCount: 1,
      },
      {
        type: "instruction",
        title: "Shape the point",
        instruction: "Use shorter stitches, then one taller stitch at the bottom point.",
      },
      {
        type: "instruction",
        title: "Close the heart",
        instruction: "Mirror the first side, slip stitch to close, and pull the ring tight.",
      },
      {
        type: "instruction",
        title: "Finish",
        instruction: "Fasten off and weave the tails into the back of the heart.",
      },
    ]),
  },
  {
    slug: "simple-flower-applique",
    title: "Simple Flower Applique",
    description: "A five-petal flower motif for learning repeated shaping around a center.",
    difficulty: "beginner",
    category: "gift",
    coverImageKey: "simple-flower-applique",
    estimatedMinutes: 25,
    materialsText: "Cotton yarn, 4 mm hook, yarn needle, scissors.",
    skillsText: "Magic ring, chain spaces, double crochet, slip stitch",
    expectationText: "A cheerful motif that repeats the same petal sequence so shaping starts to feel predictable.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Make the center",
        instruction: "Start with a magic ring and work 10 single crochet into the center.",
      },
      {
        type: "round",
        title: "Round 1",
        instruction: "Join the center round with a slip stitch and tighten the ring.",
        counterLabel: "round",
        targetCount: 1,
      },
      {
        type: "repeat",
        title: "Make five petals",
        instruction: "Repeat chain stitches and double crochet into the same stitch to form each petal.",
        targetCount: 5,
      },
      {
        type: "instruction",
        title: "Shape the petals",
        instruction: "Gently tug each petal into place so the flower sits flat.",
      },
      {
        type: "instruction",
        title: "Finish",
        instruction: "Fasten off and weave tails into the back of the flower.",
      },
    ]),
  },
  {
    slug: "chunky-storage-basket",
    title: "Chunky Storage Basket",
    description: "A sturdy home project for practicing rounds, sides, and simple structure.",
    difficulty: "intermediate",
    category: "home",
    coverImageKey: "chunky-storage-basket",
    estimatedMinutes: 90,
    materialsText: "Chunky cotton yarn, 6.5 mm hook, yarn needle, scissors.",
    skillsText: "Magic ring, single crochet, increasing, working in back loops, rounds",
    expectationText: "A useful home piece where you move from a flat base into upright sides and see structure take shape.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Start the base",
        instruction: "Make a magic ring and work 8 single crochet into the center.",
      },
      {
        type: "round",
        title: "Rounds 1 to 4",
        instruction: "Increase evenly each round until the base reaches the width you want.",
        counterLabel: "round",
        targetCount: 4,
      },
      {
        type: "round",
        title: "Turn the side",
        instruction: "Work one round in the back loops only to create a clean edge.",
        counterLabel: "round",
        targetCount: 5,
      },
      {
        type: "repeat",
        title: "Build the walls",
        instruction: "Single crochet around without increasing until the basket is tall enough.",
        counterLabel: "round",
        targetCount: 10,
      },
      {
        type: "instruction",
        title: "Finish the rim",
        instruction: "Slip stitch around the top edge, fasten off, and weave in ends.",
      },
    ]),
  },
  {
    slug: "easy-ribbed-beanie",
    title: "Easy Ribbed Beanie",
    description: "A beginner-friendly wearable made from a ribbed rectangle and simple seam.",
    difficulty: "intermediate",
    category: "wearable",
    coverImageKey: "easy-ribbed-beanie",
    estimatedMinutes: 110,
    materialsText: "Worsted yarn, 5.5 mm hook, yarn needle, scissors.",
    skillsText: "Foundation chain, half double crochet, back loop only, seaming",
    expectationText: "A wearable project built from simple rows, then seamed into shape so you can finish a real hat without complex shaping.",
    stepsJson: patternSteps([
      {
        type: "instruction",
        title: "Foundation",
        instruction: "Chain enough stitches to reach from the brim to the crown of the hat.",
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
        title: "Rows 2 to 36",
        instruction: "Chain 2, turn, and work half double crochet in the back loop only across.",
        counterLabel: "row",
        targetCount: 36,
      },
      {
        type: "instruction",
        title: "Seam the side",
        instruction: "Fold the rectangle and seam the first and last rows together.",
      },
      {
        type: "instruction",
        title: "Close the crown",
        instruction: "Weave yarn around the top edge, pull tight, secure, and weave in ends.",
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

  await db
    .insert(schema.patterns)
    .values(patternSeeds)
    .onConflictDoNothing({ target: schema.patterns.slug });
}

export { lessonSeeds, patternSeeds };

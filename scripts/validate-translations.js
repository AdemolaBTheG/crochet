const fs = require("fs");
const path = require("path");

const LESSONS_DIR = path.join(__dirname, "..", "content", "lessons");
const PATTERNS_DIR = path.join(__dirname, "..", "content", "patterns");
const LOCALES = ["en", "de", "fr", "es", "nl", "it", "ja", "ko", "pt-BR", "pl", "sv"];

const LESSON_SLUGS = [
  "slip-knot-and-hold",
  "foundation-chain",
  "single-crochet",
  "slip-stitch-and-join",
  "half-double-crochet",
  "double-crochet",
  "working-in-rows",
  "working-in-rounds",
  "magic-ring",
  "fasten-off-and-weave-ends",
  "increasing-and-decreasing",
  "chain-spaces-and-corners",
  "back-loop-only-ribbing",
  "color-changes",
  "joining-granny-squares",
  "invisible-decrease-for-amigurumi",
];

const PATTERN_SLUGS = [
  "minimalist-coaster",
  "simple-dishcloth",
  "beginner-scarf",
  "basic-granny-square",
  "mini-granny-square-join",
  "cotton-face-scrubbies",
  "cozy-mug-sleeve",
  "ribbed-scrunchie",
  "slim-bookmark",
  "tiny-heart-applique",
  "simple-flower-applique",
  "chunky-storage-basket",
  "easy-ribbed-beanie",
  "round-trivet",
  "granny-stripe-scarf",
  "ribbed-washcloth",
  "basic-amigurumi-ball",
  "ribbed-headband",
  "simple-drawstring-pouch",
  "granny-square-tote",
  "mesh-market-bag",
  "basic-baby-blanket",
  "amigurumi-whale",
];

const REQUIRED_LESSON_KEYS = ["title", "description", "content"];
const REQUIRED_LESSON_CONTENT_KEYS = [
  "summary",
  "whyItMatters",
  "steps",
  "practice",
  "commonMistakes",
];

const REQUIRED_PATTERN_KEYS = ["title", "description", "materials", "skills", "expectationText", "steps"];
const REQUIRED_PATTERN_STEP_KEYS = ["title", "instruction"];

let errors = 0;
let warnings = 0;

function logError(msg) {
  console.error(`ERROR: ${msg}`);
  errors += 1;
}

function logWarning(msg) {
  console.warn(`WARNING: ${msg}`);
  warnings += 1;
}

function readJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function checkEmptyStrings(obj, prefix) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string" && value.trim().length === 0) {
      logWarning(`${prefix}.${key} is an empty string`);
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (typeof item === "string" && item.trim().length === 0) {
          logWarning(`${prefix}.${key}[${idx}] is an empty string`);
        }
      });
    } else if (value && typeof value === "object") {
      checkEmptyStrings(value, `${prefix}.${key}`);
    }
  }
}

console.log("=== Translation QA Validation ===\n");

// Validate lessons
console.log("--- Lessons ---");
for (const locale of LOCALES) {
  const localeDir = path.join(LESSONS_DIR, locale);
  console.log(`\nLocale: ${locale}`);

  for (const slug of LESSON_SLUGS) {
    const filePath = path.join(localeDir, `${slug}.json`);
    const enFilePath = path.join(LESSONS_DIR, "en", `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      if (locale === "en") {
        logError(`Missing English lesson file: ${filePath}`);
      } else {
        logWarning(`Missing ${locale} lesson file: ${filePath}`);
      }
      continue;
    }

    const data = readJson(filePath);
    if (!data) {
      logError(`Failed to parse JSON: ${filePath}`);
      continue;
    }

    for (const key of REQUIRED_LESSON_KEYS) {
      if (!(key in data)) {
        logError(`${filePath}: missing key "${key}"`);
      }
    }

    if (data.content) {
      for (const key of REQUIRED_LESSON_CONTENT_KEYS) {
        if (!(key in data.content)) {
          logError(`${filePath}: missing content key "${key}"`);
        }
      }

      if (!Array.isArray(data.content.steps)) {
        logError(`${filePath}: content.steps is not an array`);
      }

      if (!Array.isArray(data.content.commonMistakes)) {
        logError(`${filePath}: content.commonMistakes is not an array`);
      }

      // Compare step counts with English
      if (locale !== "en" && fs.existsSync(enFilePath)) {
        const enData = readJson(enFilePath);
        if (enData?.content?.steps && data.content?.steps) {
          if (enData.content.steps.length !== data.content.steps.length) {
            logError(
              `${filePath}: step count mismatch (en=${enData.content.steps.length}, ${locale}=${data.content.steps.length})`,
            );
          }
        }
        if (enData?.content?.commonMistakes && data.content?.commonMistakes) {
          if (enData.content.commonMistakes.length !== data.content.commonMistakes.length) {
            logError(
              `${filePath}: commonMistakes count mismatch (en=${enData.content.commonMistakes.length}, ${locale}=${data.content.commonMistakes.length})`,
            );
          }
        }
      }
    }

    checkEmptyStrings(data, path.relative(process.cwd(), filePath));
  }
}

// Validate patterns
console.log("\n--- Patterns ---");
for (const locale of LOCALES) {
  const localeDir = path.join(PATTERNS_DIR, locale);
  console.log(`\nLocale: ${locale}`);

  for (const slug of PATTERN_SLUGS) {
    const filePath = path.join(localeDir, `${slug}.json`);
    const enFilePath = path.join(PATTERNS_DIR, "en", `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      if (locale === "en") {
        logError(`Missing English pattern file: ${filePath}`);
      } else {
        logWarning(`Missing ${locale} pattern file: ${filePath}`);
      }
      continue;
    }

    const data = readJson(filePath);
    if (!data) {
      logError(`Failed to parse JSON: ${filePath}`);
      continue;
    }

    for (const key of REQUIRED_PATTERN_KEYS) {
      if (!(key in data)) {
        logError(`${filePath}: missing key "${key}"`);
      }
    }

    if (!Array.isArray(data.materials)) {
      logError(`${filePath}: materials is not an array`);
    }

    if (!Array.isArray(data.skills)) {
      logError(`${filePath}: skills is not an array`);
    }

    if (!Array.isArray(data.steps)) {
      logError(`${filePath}: steps is not an array`);
    } else {
      data.steps.forEach((step, idx) => {
        for (const key of REQUIRED_PATTERN_STEP_KEYS) {
          if (!(key in step)) {
            logError(`${filePath}: steps[${idx}] missing key "${key}"`);
          }
        }
      });

      // Compare step counts with English
      if (locale !== "en" && fs.existsSync(enFilePath)) {
        const enData = readJson(enFilePath);
        if (enData?.steps && data.steps) {
          if (enData.steps.length !== data.steps.length) {
            logError(
              `${filePath}: steps count mismatch (en=${enData.steps.length}, ${locale}=${data.steps.length})`,
            );
          }
        }
      }
    }

    checkEmptyStrings(data, path.relative(process.cwd(), filePath));
  }
}

console.log(`\n=== Results ===`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors > 0) {
  console.log("\nValidation FAILED with errors.");
  process.exit(1);
} else if (warnings > 0) {
  console.log("\nValidation passed with warnings.");
  process.exit(0);
} else {
  console.log("\nValidation passed with no issues.");
  process.exit(0);
}

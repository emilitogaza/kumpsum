// Swedish-flavoured "lorem ipsum" word bank.
// A mix of plain words, åäö words, beer vocabulary and developer/designer
// buzzwords. "öl" and its many synonyms feature heavily, and a few rare
// easter-egg phrases sneak in.

// Names for, and words around, öl (beer) — the heart of the generator.
const OL_WORDS = [
  "öl",
  "bärs",
  "bira",
  "folköl",
  "starköl",
  "mellanöl",
  "lättöl",
  "lager",
  "pilsner",
  "porter",
  "stout",
  "ale",
  "ipa",
  "humle",
  "malt",
  "jäst",
  "sejdel",
  "stånka",
  "fredagsöl",
  "systemöl",
  "burköl",
  "fatöl",
  "skumöl",
  "julöl",
  "påsköl",
];

// Words with åäö — sprinkled in so roughly every 3rd–4th word carries one.
const ACCENT_WORDS = [
  "kär",
  "kärlek",
  "fjäril",
  "härlig",
  "läcker",
  "knäckebröd",
  "kräftskiva",
  "förträfflig",
  "frågvis",
  "väldigt",
  "förstås",
  "äntligen",
  "smörgås",
  "köttbulle",
  "trädgård",
  "väder",
  "höst",
  "dröm",
  "björn",
  "älg",
  "skägg",
  "påtår",
  "förälskelse",
  "blåbär",
  "växthus",
  "väntan",
  "grönska",
  "snärtig",
  "törstig",
  "lagård",
  "förträff",
  "snöig",
  "mörkrädd",
  "kämpa",
];

// Plain words, no åäö — the majority, to keep the accents from overwhelming.
const PLAIN_WORDS = [
  "fika",
  "lagom",
  "mysig",
  "ljus",
  "trevlig",
  "snabb",
  "lugn",
  "smart",
  "ren",
  "fin",
  "godis",
  "kanel",
  "bulle",
  "kaffe",
  "sommar",
  "vinter",
  "skog",
  "vatten",
  "moln",
  "stuga",
  "cykel",
  "katt",
  "hund",
  "bord",
  "stol",
  "lampa",
  "tegel",
  "gran",
  "moln",
  "vante",
  "filt",
  "pinne",
  "flinga",
  "kavel",
  "tomte",
  "vimpel",
  "krita",
  "penna",
  "boll",
  "ramp",
];

// Developer & designer buzzwords — we build things, after all.
const BUZZWORDS = [
  "deploya",
  "refaktorera",
  "pixelperfekt",
  "responsiv",
  "sprint",
  "standup",
  "merge",
  "rebase",
  "kanban",
  "wireframe",
  "typografi",
  "whitespace",
  "grid",
  "konvertering",
  "synergi",
  "skalbar",
  "molnet",
  "serverless",
  "microservices",
  "fullstack",
  "pipeline",
  "komponent",
  "hydrering",
  "lighthouse",
  "designsystem",
  "prototyp",
  "edge",
  "cache",
  "lazy-loadad",
  "agil",
  "backlog",
  "roadmap",
  "MVP",
  "API",
];

// Rare easter eggs — whole phrases dropped in once in a blue moon.
const EASTER_EGGS = [
  "det funkar på min maskin",
  "öl-driven utveckling",
  "köttbullar-driven design",
  "git blame någon annan",
  "deploya aldrig på en fredag",
  "100 i Lighthouse",
  "rubber duck",
  "fika är obligatoriskt",
  "skål och commit",
  "ship it",
];

const EASTER_EGG_CHANCE = 0.015; // ~1.5% of words become an easter-egg phrase

// Punctuation tuning — kept sparse so sentences read in longer breaths rather
// than choppy "word, word, word" runs.
const PUNCT_CHANCE = 0.14; // chance an eligible word gets a comma/semicolon
const SEMICOLON_RATIO = 0.18; // of those breaks, how many are semicolons (rare)
const MIN_GAP = 2; // words that must follow a break before the next one

export type Mode = "word" | "sentence" | "paragraph";
export type Length = "short" | "medium" | "long";

// Word counts per sentence by chosen length.
const SENTENCE_WORDS: Record<Length, [number, number]> = {
  short: [3, 6],
  medium: [7, 13],
  long: [14, 22],
};

// Sentence counts per paragraph by chosen length.
const PARAGRAPH_SENTENCES: Record<Length, [number, number]> = {
  short: [2, 3],
  medium: [4, 6],
  long: [7, 10],
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Weighted category pick. Tuned so that beer + accent words land around one in
// every 3–4 words, while plain words and buzzwords make up the rest.
function randomWord(): string {
  const r = Math.random();
  if (r < 0.16) return pick(OL_WORDS); // ~16% beer (about half carry åäö)
  if (r < 0.38) return pick(ACCENT_WORDS); // ~22% åäö words
  if (r < 0.56) return pick(BUZZWORDS); // ~18% dev/design buzzwords
  return pick(PLAIN_WORDS); // ~44% plain, accent-free words
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function buildSentence(length: Length): string {
  const [min, max] = SENTENCE_WORDS[length];
  const count = randInt(min, max);
  let sentence = "";
  let sinceBreak = 0; // words since the last comma/semicolon

  for (let i = 0; i < count; i++) {
    // Once in a blue moon, drop in a whole easter-egg phrase instead of a word.
    const word =
      Math.random() < EASTER_EGG_CHANCE ? pick(EASTER_EGGS) : randomWord();

    // A break is only eligible mid-sentence, never on the final word (it gets
    // the period) nor right after another break — that keeps clauses breathing.
    const canBreak = i > 0 && i < count - 1 && sinceBreak >= MIN_GAP;
    let punct = "";
    if (canBreak && Math.random() < PUNCT_CHANCE) {
      punct = Math.random() < SEMICOLON_RATIO ? ";" : ",";
      sinceBreak = 0;
    } else {
      sinceBreak++;
    }

    sentence += `${i === 0 ? capitalize(word) : word}${punct} `;
  }

  return `${sentence.trim()}.`;
}

function buildParagraph(length: Length): string {
  const [min, max] = PARAGRAPH_SENTENCES[length];
  const count = randInt(min, max);
  // Sentence length inside a paragraph tracks the overall length setting.
  return Array.from({ length: count }, () => buildSentence(length)).join(" ");
}

export interface GenerateOptions {
  mode: Mode;
  length: Length;
  count: number;
}

/** Generates an array of blocks (words, sentences or paragraphs). */
export function generate({ mode, length, count }: GenerateOptions): string[] {
  switch (mode) {
    case "word": {
      // Group all words into one block, sentence-cased for a tidy look.
      const words = Array.from({ length: count }, randomWord);
      return [`${capitalize(words.join(" "))}.`];
    }
    case "sentence":
      return [
        Array.from({ length: count }, () => buildSentence(length)).join(" "),
      ];
    case "paragraph":
      return Array.from({ length: count }, () => buildParagraph(length));
  }
}

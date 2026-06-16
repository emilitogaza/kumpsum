#!/usr/bin/env node

// src/cli.ts
import { spawnSync } from "child_process";

// ../core/src/index.ts
var OL_WORDS = [
  "\xF6l",
  "b\xE4rs",
  "bira",
  "folk\xF6l",
  "stark\xF6l",
  "mellan\xF6l",
  "l\xE4tt\xF6l",
  "lager",
  "pilsner",
  "porter",
  "stout",
  "ale",
  "ipa",
  "humle",
  "malt",
  "j\xE4st",
  "sejdel",
  "st\xE5nka",
  "fredags\xF6l",
  "system\xF6l",
  "burk\xF6l",
  "fat\xF6l",
  "skum\xF6l",
  "jul\xF6l",
  "p\xE5sk\xF6l"
];
var ACCENT_WORDS = [
  "k\xE4r",
  "k\xE4rlek",
  "fj\xE4ril",
  "h\xE4rlig",
  "l\xE4cker",
  "kn\xE4ckebr\xF6d",
  "kr\xE4ftskiva",
  "f\xF6rtr\xE4fflig",
  "fr\xE5gvis",
  "v\xE4ldigt",
  "f\xF6rst\xE5s",
  "\xE4ntligen",
  "sm\xF6rg\xE5s",
  "k\xF6ttbulle",
  "tr\xE4dg\xE5rd",
  "v\xE4der",
  "h\xF6st",
  "dr\xF6m",
  "bj\xF6rn",
  "\xE4lg",
  "sk\xE4gg",
  "p\xE5t\xE5r",
  "f\xF6r\xE4lskelse",
  "bl\xE5b\xE4r",
  "v\xE4xthus",
  "v\xE4ntan",
  "gr\xF6nska",
  "sn\xE4rtig",
  "t\xF6rstig",
  "lag\xE5rd",
  "f\xF6rtr\xE4ff",
  "sn\xF6ig",
  "m\xF6rkr\xE4dd",
  "k\xE4mpa"
];
var PLAIN_WORDS = [
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
  "ramp"
];
var BUZZWORDS = [
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
  "API"
];
var EASTER_EGGS = [
  "det funkar p\xE5 min maskin",
  "\xF6l-driven utveckling",
  "k\xF6ttbullar-driven design",
  "git blame n\xE5gon annan",
  "deploya aldrig p\xE5 en fredag",
  "100 i Lighthouse",
  "rubber duck",
  "fika \xE4r obligatoriskt",
  "sk\xE5l och commit",
  "ship it"
];
var EASTER_EGG_CHANCE = 0.015;
var PUNCT_CHANCE = 0.14;
var SEMICOLON_RATIO = 0.18;
var MIN_GAP = 2;
var SENTENCE_WORDS = {
  short: [3, 6],
  medium: [7, 13],
  long: [14, 22]
};
var PARAGRAPH_SENTENCES = {
  short: [2, 3],
  medium: [4, 6],
  long: [7, 10]
};
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomWord() {
  const r = Math.random();
  if (r < 0.16) return pick(OL_WORDS);
  if (r < 0.38) return pick(ACCENT_WORDS);
  if (r < 0.56) return pick(BUZZWORDS);
  return pick(PLAIN_WORDS);
}
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
function buildSentence(length) {
  const [min, max] = SENTENCE_WORDS[length];
  const count = randInt(min, max);
  let sentence = "";
  let sinceBreak = 0;
  for (let i = 0; i < count; i++) {
    const word = Math.random() < EASTER_EGG_CHANCE ? pick(EASTER_EGGS) : randomWord();
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
function buildParagraph(length) {
  const [min, max] = PARAGRAPH_SENTENCES[length];
  const count = randInt(min, max);
  return Array.from({ length: count }, () => buildSentence(length)).join(" ");
}
function generate({ mode, length, count }) {
  switch (mode) {
    case "word": {
      const words = Array.from({ length: count }, randomWord);
      return [`${capitalize(words.join(" "))}.`];
    }
    case "sentence":
      return [
        Array.from({ length: count }, () => buildSentence(length)).join(" ")
      ];
    case "paragraph":
      return Array.from({ length: count }, () => buildParagraph(length));
  }
}

// src/cli.ts
var VERSION = "0.2.0";
var CLIPBOARD_COMMANDS = process.platform === "darwin" ? [["pbcopy", []]] : process.platform === "win32" ? [["clip", []]] : [
  ["wl-copy", []],
  ["xclip", ["-selection", "clipboard"]],
  ["xsel", ["--clipboard", "--input"]]
];
function copyToClipboard(text) {
  for (const [cmd, args] of CLIPBOARD_COMMANDS) {
    const result = spawnSync(cmd, args, { input: text });
    if (!result.error && result.status === 0) return true;
  }
  return false;
}
var MODE_ALIASES = {
  p: "paragraph",
  para: "paragraph",
  paragraph: "paragraph",
  s: "sentence",
  sentence: "sentence",
  w: "word",
  word: "word"
};
var LENGTHS = ["short", "medium", "long"];
var HELP = `kumpsum \u2014 Swedish-beer lorem ipsum, in your terminal

USAGE
  kumpsum [mode] [count] [options]

MODE      paragraph | sentence | word   (aliases: p, s, w)   default: paragraph
COUNT     how many to generate                               default: 3

OPTIONS
  -l, --length  short | medium | long    block size          default: medium
  -c, --copy    also copy the output to your clipboard
  -j, --json    output as a JSON array of blocks
  -h, --help    show this help
  -v, --version show version

EXAMPLES
  kumpsum                 three medium paragraphs (the default)
  kumpsum p 8             eight paragraphs
  kumpsum word 50         fifty words
  kumpsum s 3 -l long     three long sentences
  kumpsum p 8 -c          eight paragraphs, copied to the clipboard
`;
function fail(message) {
  process.stderr.write(`kumpsum: ${message}

Run \`kumpsum --help\` for usage.
`);
  process.exit(1);
}
function parse(argv) {
  let mode = "paragraph";
  let count = 3;
  let length = "medium";
  let json = false;
  let copy = false;
  let modeSet = false;
  let countSet = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "help" || arg === "-h" || arg === "--help") {
      process.stdout.write(HELP);
      process.exit(0);
    }
    if (arg === "-v" || arg === "--version") {
      process.stdout.write(`${VERSION}
`);
      process.exit(0);
    }
    if (arg === "-j" || arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "-c" || arg === "--copy") {
      copy = true;
      continue;
    }
    if (arg === "-l" || arg === "--length") {
      const value = argv[++i];
      if (!value || !LENGTHS.includes(value)) {
        fail(`--length must be one of: ${LENGTHS.join(", ")}`);
      }
      length = value;
      continue;
    }
    if (/^\d+$/.test(arg)) {
      count = Number.parseInt(arg, 10);
      countSet = true;
      continue;
    }
    const key = arg.replace(/^-+/, "").toLowerCase();
    if (key in MODE_ALIASES) {
      if (modeSet) fail(`unexpected extra argument: "${arg}"`);
      mode = MODE_ALIASES[key];
      modeSet = true;
      continue;
    }
    fail(`unknown argument: "${arg}"`);
  }
  if (count < 1) fail("count must be a positive number");
  void modeSet;
  void countSet;
  return { mode, count, length, json, copy };
}
function main() {
  const { mode, count, length, json, copy } = parse(process.argv.slice(2));
  const blocks = generate({ mode, length, count });
  const output = json ? JSON.stringify(blocks, null, 2) : (
    // Blank line between blocks reads well for paragraphs, harmless otherwise.
    blocks.join("\n\n")
  );
  process.stdout.write(`${output}
`);
  if (copy) {
    const ok = copyToClipboard(output);
    process.stderr.write(
      ok ? "\u{1F4CB} copied to clipboard\n" : "kumpsum: couldn't reach a clipboard tool (sk\xE5l anyway)\n"
    );
  }
}
main();

#!/usr/bin/env node
import { generate, type Length, type Mode } from "@kumpsum/core";

const VERSION = "0.1.0";

// Mode aliases so `kumpsum p 8`, `kumpsum paragraph 8` and `kumpsum -p 8` all work.
const MODE_ALIASES: Record<string, Mode> = {
  p: "paragraph",
  para: "paragraph",
  paragraph: "paragraph",
  s: "sentence",
  sentence: "sentence",
  w: "word",
  word: "word",
};

const LENGTHS: Length[] = ["short", "medium", "long"];

const HELP = `kumpsum — Swedish-beer lorem ipsum, in your terminal

USAGE
  kumpsum [mode] [count] [options]

MODE      paragraph | sentence | word   (aliases: p, s, w)   default: paragraph
COUNT     how many to generate                               default: 3

OPTIONS
  -l, --length  short | medium | long    block size          default: medium
  -j, --json    output as a JSON array of blocks
  -h, --help    show this help
  -v, --version show version

EXAMPLES
  kumpsum                 three medium paragraphs (the default)
  kumpsum p 8             eight paragraphs
  kumpsum word 50         fifty words
  kumpsum s 3 -l long     three long sentences
  kumpsum p 8 | pbcopy    pipe straight to the clipboard
`;

interface ParsedArgs {
  mode: Mode;
  count: number;
  length: Length;
  json: boolean;
}

function fail(message: string): never {
  process.stderr.write(`kumpsum: ${message}\n\nRun \`kumpsum --help\` for usage.\n`);
  process.exit(1);
}

function parse(argv: string[]): ParsedArgs {
  let mode: Mode = "paragraph";
  let count = 3;
  let length: Length = "medium";
  let json = false;
  let modeSet = false;
  let countSet = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    // `kumpsum help`, `kumpsum -h` and `kumpsum --help` all show usage.
    if (arg === "help" || arg === "-h" || arg === "--help") {
      process.stdout.write(HELP);
      process.exit(0);
    }
    if (arg === "-v" || arg === "--version") {
      process.stdout.write(`${VERSION}\n`);
      process.exit(0);
    }
    if (arg === "-j" || arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "-l" || arg === "--length") {
      const value = argv[++i];
      if (!value || !LENGTHS.includes(value as Length)) {
        fail(`--length must be one of: ${LENGTHS.join(", ")}`);
      }
      length = value as Length;
      continue;
    }

    // A bare number is the count.
    if (/^\d+$/.test(arg)) {
      count = Number.parseInt(arg, 10);
      countSet = true;
      continue;
    }

    // Otherwise treat it as a mode (bare word or `-p`/`--paragraph` style).
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
  // Silence unused-var lint while keeping the flags self-documenting.
  void modeSet;
  void countSet;

  return { mode, count, length, json };
}

function main() {
  const { mode, count, length, json } = parse(process.argv.slice(2));
  const blocks = generate({ mode, length, count });

  if (json) {
    process.stdout.write(`${JSON.stringify(blocks, null, 2)}\n`);
    return;
  }

  // Blank line between blocks reads well for paragraphs and is harmless otherwise.
  process.stdout.write(`${blocks.join("\n\n")}\n`);
}

main();

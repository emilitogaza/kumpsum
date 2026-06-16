#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { generate, type Length, type Mode } from "@kumpsum/core";

// Injected from package.json at build time (see tsup.config.ts) so the version
// never has to be edited here — `npm version` is the only place it changes.
declare const __VERSION__: string;
const VERSION = __VERSION__;

// Native clipboard tools per platform — no dependency, just pipe text into the
// OS utility. Linux tries a few since installs vary (Wayland vs X11).
const CLIPBOARD_COMMANDS: Array<[string, string[]]> =
  process.platform === "darwin"
    ? [["pbcopy", []]]
    : process.platform === "win32"
      ? [["clip", []]]
      : [
          ["wl-copy", []],
          ["xclip", ["-selection", "clipboard"]],
          ["xsel", ["--clipboard", "--input"]],
        ];

function copyToClipboard(text: string): boolean {
  for (const [cmd, args] of CLIPBOARD_COMMANDS) {
    const result = spawnSync(cmd, args, { input: text });
    if (!result.error && result.status === 0) return true;
  }
  return false;
}

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

interface ParsedArgs {
  mode: Mode;
  count: number;
  length: Length;
  json: boolean;
  copy: boolean;
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
  let copy = false;
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
    if (arg === "-c" || arg === "--copy") {
      copy = true;
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

  return { mode, count, length, json, copy };
}

function main() {
  const { mode, count, length, json, copy } = parse(process.argv.slice(2));
  const blocks = generate({ mode, length, count });

  const output = json
    ? JSON.stringify(blocks, null, 2)
    : // Blank line between blocks reads well for paragraphs, harmless otherwise.
      blocks.join("\n\n");

  process.stdout.write(`${output}\n`);

  if (copy) {
    // Confirmation goes to stderr so it never pollutes piped/redirected stdout.
    const ok = copyToClipboard(output);
    process.stderr.write(
      ok
        ? "📋 copied to clipboard\n"
        : "kumpsum: couldn't reach a clipboard tool (skål anyway)\n",
    );
  }
}

main();

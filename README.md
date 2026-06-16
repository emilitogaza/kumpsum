# 🍺 kumpsum

Swedish-beer lorem ipsum. Placeholder text with one too many *starköl* — generate it in the browser, or straight from your terminal.

Same engine, two taps:

- **CLI** — `kumpsum p 8` for devs who live in the terminal. ([`packages/cli`](packages/cli))
- **Web** — a little UI for non-devs to pour and copy. ([`app/`](app))

## Quick start (CLI)

```bash
npx kumpsum                 # zero-install taste test → 3 medium paragraphs
```

Like it? Put it on tap permanently:

```bash
pnpm add -g kumpsum         # or: npm i -g kumpsum
kumpsum p 8                 # then it's just `kumpsum`
```

> Needs Node ≥ 18. No runtime dependencies — it's a single file.

## What you can do

```bash
kumpsum                     # 🍺 three medium paragraphs (the house special)
kumpsum p 8                 # eight paragraphs
kumpsum word 50             # fifty words
kumpsum s 3 -l long         # three long sentences
kumpsum p 8 -c              # ...and copy it to the clipboard, skål
kumpsum w 20 -j             # JSON array, for piping into the robots
```

### Features

- **Three modes** — `paragraph` · `sentence` · `word`, with short aliases (`p` · `s` · `w`).
- **Any count** — `kumpsum p 12` for as many blocks as you can handle.
- **Block sizing** — `-l short|medium|long` to dial how chunky each block is.
- **Copy to clipboard** — `-c` pipes straight into your OS clipboard (macOS `pbcopy`, Windows `clip`, Linux `wl-copy`/`xclip`/`xsel`) — no extra tooling.
- **Pipe-friendly** — text goes to stdout, confirmations to stderr, so `kumpsum p 5 -c > file.txt` stays clean.
- **JSON output** — `-j` emits a tidy array of blocks for scripts and codegen.
- **Swedish flavor** — proper åäö, and now and then a `fredagsöl` (or some unsolicited wisdom) slips into the text.
- `kumpsum -h` for the full menu, `kumpsum -v` for the version.

### Cheat sheet

| Order this     | Get                                                    | On the house |
| -------------- | ------------------------------------------------------ | ------------ |
| `mode`         | `paragraph` · `sentence` · `word` (or `p` · `s` · `w`) | `paragraph`  |
| `count`        | however many you can handle                            | `3`          |
| `-l, --length` | `short` · `medium` · `long`                            | `medium`     |
| `-c, --copy`   | also slide it onto your clipboard                      | off          |
| `-j, --json`   | a JSON array of blocks                                 | off          |
| `-h, --help`   | the full menu                                          | —            |
| `-v, --version`| the version                                            | —            |

## The web app

A small Next.js site at [`app/`](app) — pick word / sentence / paragraph, dial the length and count, and the text regenerates as you go (with a little motion). Handy for non-devs.

## The monorepo

```
kumpsum/
├─ app/, components/, lib/   # the Next.js site (private)
└─ packages/
   ├─ core/   # @kumpsum/core — the shared generation engine
   └─ cli/    # kumpsum — the published CLI
```

One generator in `packages/core`, used by both surfaces — no copy-paste, one source of truth.

## Develop

```bash
pnpm install
pnpm dev                       # run the website → http://localhost:3000
pnpm --filter kumpsum build    # build the CLI
pnpm --filter kumpsum dev      # rebuild the CLI on change
```

After building, run your local CLI with `node packages/cli/dist/cli.js …`.

## Hosting

The CLI lives on **npm**.

---

Drink responsibly, deploy never on a Friday. 🍻

# 🍺 kumpsum

Swedish-beer lorem ipsum. Placeholder text with one too many *starköl* — generate it in the browser, or straight from your terminal.

Same engine, two taps:

- **Web** — a little UI for non-devs to pour and copy. ([`app/`](app))
- **CLI** — `kumpsum p 8` for devs who live in the terminal. ([`packages/cli`](packages/cli))

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
```

## The CLI

```bash
npx kumpsum p 8                # zero-install taste test
pnpm add -g kumpsum            # then just: kumpsum
```

Full menu lives in [`packages/cli`](packages/cli/README.md).

## Hosting

The site deploys on **Coolify**. The CLI lives on **npm**.

---

Drink responsibly, deploy never on a Friday. 🍻

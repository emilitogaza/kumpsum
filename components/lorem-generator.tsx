"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generate, type Length, type Mode } from "@/lib/lorem";
import { cn } from "@/lib/utils";

const MODES: { value: Mode; label: string }[] = [
  { value: "word", label: "Ord" },
  { value: "sentence", label: "Meningar" },
  { value: "paragraph", label: "Stycken" },
];

const LENGTHS: Length[] = ["short", "medium", "long"];
const LENGTH_LABELS: Record<Length, string> = {
  short: "Kort",
  medium: "Mellan",
  long: "Lång",
};

const UNIT_LABEL: Record<Mode, string> = {
  word: "ord",
  sentence: "meningar",
  paragraph: "stycken",
};

export function LoremGenerator() {
  const [mode, setMode] = useState<Mode>("paragraph");
  const [lengthIdx, setLengthIdx] = useState(1); // medium
  const [count, setCount] = useState(3);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const length = LENGTHS[lengthIdx];

  // Regenerate from an explicit set of options so each control can pass its
  // own freshly-chosen value without waiting for a state round-trip.
  const run = useCallback(
    (opts?: Partial<{ mode: Mode; length: Length; count: number }>) => {
      setBlocks(
        generate({
          mode: opts?.mode ?? mode,
          length: opts?.length ?? length,
          count: opts?.count ?? count,
        })
      );
      setCopied(false);
    },
    [mode, length, count]
  );

  // Seed the first paint on the client. Randomised text can't run during SSR
  // without a hydration mismatch, so it's generated once after mount.
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    setBlocks(generate({ mode, length, count }));
  }, [mode, length, count]);

  const copy = async () => {
    await navigator.clipboard.writeText(blocks.join("\n\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Controls */}
      <div className="rounded-3xl border border-border bg-fill-raised p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)] sm:p-8">
        {/* Step 1 — mode tabs */}
        <Step n={1} label="Vad vill du ha?">
          <div className="inline-flex w-full rounded-full bg-fill p-1 sm:w-auto">
            {MODES.map((m) => (
              <button
                type="button"
                key={m.value}
                onClick={() => {
                  setMode(m.value);
                  run({ mode: m.value });
                }}
                className={cn(
                  "flex-1 rounded-full px-5 py-2.5 text-sm font-medium transition-colors sm:flex-none",
                  mode === m.value
                    ? "bg-accent text-accent-ink"
                    : "text-ink-dim hover:text-ink"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </Step>

        {/* Step 2 — length (irrelevant for word mode) */}
        <Step
          n={2}
          label="Hur långa?"
          disabled={mode === "word"}
          hint={mode === "word" ? "Gäller bara meningar & stycken" : undefined}
        >
          <input
            type="range"
            min={0}
            max={2}
            step={1}
            value={lengthIdx}
            disabled={mode === "word"}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setLengthIdx(idx);
              run({ length: LENGTHS[idx] });
            }}
            className="disabled:opacity-40"
          />
          <div className="mt-3 flex justify-between text-xs font-medium">
            {LENGTHS.map((l, i) => (
              <span
                key={l}
                className={cn(
                  mode !== "word" && i === lengthIdx
                    ? "text-ink"
                    : "text-ink-dim"
                )}
              >
                {LENGTH_LABELS[l]}
              </span>
            ))}
          </div>
        </Step>

        {/* Step 3 — count */}
        <Step n={3} label="Hur många?" last>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={count}
            onChange={(e) => {
              const c = Number(e.target.value);
              setCount(c);
              run({ count: c });
            }}
          />
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xs font-medium text-ink-dim">1</span>
            <span className="text-sm font-semibold text-ink">
              {count} {UNIT_LABEL[mode]}
            </span>
            <span className="text-xs font-medium text-ink-dim">10</span>
          </div>
        </Step>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => run()}
            className="flex-1 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-ink-flip transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Brygg ny text 🍺
          </button>
          <button
            type="button"
            onClick={copy}
            className="rounded-full border border-border bg-fill-raised px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-fill"
          >
            {copied ? "Kopierat!" : "Kopiera"}
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="mt-6 rounded-3xl border border-border bg-fill-raised p-6 sm:p-8">
        <div className="space-y-4 leading-relaxed text-ink">
          {blocks.map((block, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: output is fully regenerated each run; blocks may repeat, so index is the stable key
            <p key={i}>{block}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  label,
  hint,
  children,
  disabled,
  last,
}: {
  n: number;
  label: string;
  hint?: string;
  children: React.ReactNode;
  disabled?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "py-5",
        !last && "border-b border-border",
        disabled && "opacity-60"
      )}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink">
          {n}
        </span>
        <span className="text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="text-xs text-ink-dim">· {hint}</span>}
      </div>
      {children}
    </div>
  );
}

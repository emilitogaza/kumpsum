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
  short: "Korta",
  medium: "Mellan",
  long: "Lång",
};

export function LoremGenerator() {
  const [mode, setMode] = useState<Mode>("paragraph");
  const [lengthIdx, setLengthIdx] = useState(1); // medium
  const [count, setCount] = useState(3);
  const [blocks, setBlocks] = useState<string[]>([]);

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
        }),
      );
    },
    [mode, length, count],
  );

  // Seed the first paint on the client. Randomised text can't run during SSR
  // without a hydration mismatch, so it's generated once after mount.
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    setBlocks(generate({ mode, length, count }));
  }, [mode, length, count]);

  return (
    <div className="w-full max-w-3xl">
      {/* Controls */}
      <div className="">
        {/* Step 1 — mode chips */}
        <Step n={1} label="Vad önskas?">
          <div className="flex flex-wrap gap-2.5">
            {MODES.map((m) => (
              <Chip
                key={m.value}
                active={mode === m.value}
                onClick={() => {
                  setMode(m.value);
                  run({ mode: m.value });
                }}
              >
                {m.label}
              </Chip>
            ))}
          </div>
        </Step>

        {/* Step 2 — length chips (irrelevant for word mode) */}
        <Step
          n={2}
          label="Hur långt?"
          disabled={mode === "word"}
          hint={mode === "word" ? "Gäller bara meningar & stycken" : undefined}
        >
          <div className="flex flex-wrap gap-2.5">
            {LENGTHS.map((l, i) => (
              <Chip
                key={l}
                active={mode !== "word" && i === lengthIdx}
                disabled={mode === "word"}
                onClick={() => {
                  setLengthIdx(i);
                  run({ length: l });
                }}
              >
                {LENGTH_LABELS[l]}
              </Chip>
            ))}
          </div>
        </Step>

        {/* Step 3 — count stepper */}
        <Step n={3} label="Hur många?" last>
          <div className="inline-flex items-center gap-2 rounded-4 bg-fill-raised p-1">
            <button
              type="button"
              aria-label="Färre"
              disabled={count <= 1}
              onClick={() => {
                const c = Math.max(1, count - 1);
                setCount(c);
                run({ count: c });
              }}
              className="flex size-15 cursor-pointer items-center justify-center rounded-3 text-2xl font-medium text-ink transition-colors duration-200 ease-out hover:bg-brand hover:text-ink-flip disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>
            <span className="min-w-12 text-center text-xl font-semibold tabular-nums text-ink">
              {count}
            </span>
            <button
              type="button"
              aria-label="Fler"
              disabled={count >= 10}
              onClick={() => {
                const c = Math.min(10, count + 1);
                setCount(c);
                run({ count: c });
              }}
              className="flex size-15 cursor-pointer items-center justify-center rounded-3 text-2xl font-medium text-ink transition-colors duration-200 ease-out hover:bg-brand hover:text-ink-flip disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>
          </div>
        </Step>
      </div>

      {/* Output */}
      <div className="mt-6 ">
        <div className="space-y-4 text-lg md:text-xl leading-relaxed text-ink">
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
    <div className={cn("pb-8", !last && "pb-12", disabled && "opacity-60")}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex size-12 items-center justify-center rounded-3 bg-brand/15 text-2xl font-semibold text-brand-ink">
          {n}
        </span>
        <span className="text-2xl font-semibold text-ink">{label}</span>
        {hint && <span className="text-ink-dim">· {hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-3 outline-2 px-6 py-3 text-xl font-semibold  transition-all",
        active
          ? " bg-brand text-brand-ink-flip outline-brand"
          : " bg-fill text-ink-dim hover:text-ink hover:bg-brand/10 hover:outline-4 outline-brand/20 cursor-pointer hover:outline-brand",
        disabled && "cursor-not-allowed opacity-40 hover:text-ink-dim",
      )}
    >
      {children}
    </button>
  );
}

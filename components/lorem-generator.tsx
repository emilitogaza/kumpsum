"use client";

import { AnimatePresence, m } from "motion/react";
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
  medium: "Lagom",
  long: "Långt",
};

export function LoremGenerator() {
  const [mode, setMode] = useState<Mode>("paragraph");
  const [lengthIdx, setLengthIdx] = useState(1); // medium
  const [count, setCount] = useState(3);
  const [blocks, setBlocks] = useState<string[]>([]);
  // Bumped on every generation so AnimatePresence treats each result as a new
  // node — that's what drives the exit-then-enter word animation.
  const [genId, setGenId] = useState(0);

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
      setGenId((n) => n + 1);
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
    setGenId((n) => n + 1);
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
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <m.div
            key={genId}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeIn" }}
            className="space-y-4 text-lg leading-relaxed text-ink md:text-xl"
          >
            {(() => {
              // Stagger every word across the whole output with a global index.
              // The per-word delay scales to the total word count so the cascade
              // spreads evenly across MAX_STAGGER no matter how long the result
              // is — short results animate quickly, long ones don't drag.
              const MAX_STAGGER = 0.7;
              const total = blocks.reduce(
                (sum, b) => sum + b.split(" ").length,
                0,
              );
              const step = MAX_STAGGER / Math.max(total - 1, 1);
              let w = 0;
              return blocks.map((block, bi) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: output is fully regenerated each run; blocks may repeat, so index is the stable key
                <p key={bi}>
                  {block.split(" ").map((word, wi) => (
                    <m.span
                      // biome-ignore lint/suspicious/noArrayIndexKey: words regenerate as a set; index is the stable key within a block
                      key={wi}
                      className="inline-block"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                        delay: w++ * step,
                      }}
                    >
                      {word}&nbsp;
                    </m.span>
                  ))}
                </p>
              ));
            })()}
          </m.div>
        </AnimatePresence>
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

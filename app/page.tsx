import { LoremGenerator } from "@/components/lorem-generator";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center px-5 py-16 sm:py-24">
      <header className="mb-12 w-full max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-fill-raised px-3.5 py-1.5 text-xs font-medium text-ink-dim">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Fyllnadstext, bryggd i Sverige
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
          Kumpsum
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-dim">
          En lorem ipsum-generator med svenska bokstäver, åäö och en hälsosam
          dos öl. Välj ord, meningar eller stycken — så fixar vi resten.
        </p>
      </header>

      <LoremGenerator />

      <footer className="mt-16 text-sm text-ink-dim">
        Skål! 🍻 Inspirerad av kumpan.se
      </footer>
    </div>
  );
}

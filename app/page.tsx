export default function Home() {
  return (
    <main className="min-h-screen px-8 py-10">
      <section className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-muted-foreground">
          Phase 1
        </p>
        <h1 className="font-serif text-5xl font-semibold tracking-tight">
          Rent vs. Buy Calculator
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          The calculation engine is being built first. The interactive UI will
          be wired after the engine and data layer are tested.
        </p>
      </section>
    </main>
  );
}

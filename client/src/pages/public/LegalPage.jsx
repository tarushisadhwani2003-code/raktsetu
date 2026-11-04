/** Shared layout for the terms and privacy pages. */
export default function LegalPage({ title, updated, children }) {
  return (
    <div className="pb-20">
      <section className="border-b border-ink-100 bg-white">
        <div className="container-page max-w-3xl py-12 sm:py-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-ink-500">Last updated {updated}</p>
        </div>
      </section>
      <article className="container-page prose-page max-w-3xl pt-4">{children}</article>
    </div>
  );
}

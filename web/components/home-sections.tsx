const featureCards = [
  {
    title: "Search with heritage in mind",
    body: "Start from a dish you care about, then use cuisine and diet labels to compare options without flattening cultural context.",
    tone: "bg-[var(--bg-lavender)]"
  },
  {
    title: "Shop nearby, not blindly",
    body: "We guide you to nearby stores likely to carry missing ingredients so the journey from recipe to market feels practical.",
    tone: "bg-[var(--bg-sky)]"
  },
  {
    title: "Understand impact honestly",
    body: "Recipe carbon class and store-trip emissions are shown together as an estimate, with clear notes on what is measured and what is inferred.",
    tone: "bg-[var(--bg-mint)]"
  }
];

const workflow = [
  "Search recipes from Edamam.",
  "Open a dish and review ingredients, labels, and source details.",
  "Set your location and check off ingredients you already have.",
  "See nearby stores likely to carry the rest.",
  "Review the hybrid environmental estimate before cooking."
];

export function HomeSections() {
  return (
    <>
      <section className="section bg-[var(--bg-navy)] text-white">
        <div className="page-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="eyebrow text-white">Why This Exists</span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-[-0.03em] md:text-6xl">
              Good food and a good environment can coexist.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
              Food carries identity, memory, and family history. The product
              direction here is to support that tradition while helping people
              make more climate-aware choices without shame or guesswork.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className={`card-surface min-h-[260px] rounded-[1.6rem] p-6 text-[var(--bg-navy)] ${card.tone}`}
              >
                <div className="mb-10 inline-flex rounded-full border border-black/10 bg-white/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em]">
                  Feature
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight">
                  {card.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[rgba(16,28,48,0.82)]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-shell grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="card-surface bg-white p-8 md:p-10">
            <span className="eyebrow">Workflow</span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-[-0.03em] md:text-5xl">
              A simple MVP flow with room to grow.
            </h2>
            <div className="mt-8 space-y-4">
              {workflow.map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-4 rounded-[1.25rem] border border-slate-200 px-5 py-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-navy)] font-[family-name:var(--font-display)] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-lg text-[var(--text-soft)]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="card-surface bg-[var(--bg-mint)] p-8 text-[var(--bg-navy)] md:p-10">
            <span className="eyebrow">MVP Reality Check</span>
            <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight md:text-4xl">
              We are intentionally building the honest version first.
            </h3>
            <ul className="mt-6 space-y-4 text-lg leading-8 text-[rgba(16,28,48,0.82)]">
              <li>Recipes come from Edamam.</li>
              <li>Stores are nearby recommendations, not inventory guarantees.</li>
              <li>Environmental impact is a hybrid estimate, not an exact truth.</li>
              <li>Saved progress lives in local storage for hackathon speed.</li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}


import { LocationFlow } from "@/components/location-flow";

type LocationPageProps = {
  searchParams: Promise<{ recipeId?: string }>;
};

export default async function LocationPage({ searchParams }: LocationPageProps) {
  const { recipeId } = await searchParams;

  return (
    <main className="section">
      <div className="page-shell">
        <span className="eyebrow">Location Setup</span>
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.04em] text-[var(--bg-navy)] md:text-6xl">
          Set where we should search for ingredients
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-soft)]">
          If you already saved a location, you can keep it or update it before
          moving back into the recipe workflow.
        </p>
        <div className="mt-10">
          <LocationFlow recipeId={recipeId} />
        </div>
      </div>
    </main>
  );
}

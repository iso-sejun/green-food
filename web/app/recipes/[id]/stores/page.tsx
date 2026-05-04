import { StoreMapFlow } from "@/components/store-map-flow";

type StoreMapPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoreMapPage({ params }: StoreMapPageProps) {
  const { id } = await params;
  const browserMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <main className="section">
      <div className="page-shell">
        <span className="eyebrow">Nearby Stores</span>
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.04em] text-[var(--bg-navy)] md:text-6xl">
          Nearby stores likely to carry missing ingredients
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-soft)]">
          We geocode your saved location, search nearby grocery-oriented places
          within about 10 miles, and map the recommendations alongside your
          remaining ingredient list.
        </p>
        <div className="mt-10">
          <StoreMapFlow recipeId={id} browserMapsApiKey={browserMapsApiKey} />
        </div>
      </div>
    </main>
  );
}

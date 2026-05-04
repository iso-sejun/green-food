import { ImpactReportFlow } from "@/components/impact-report-flow";

type EnvironmentalImpactPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EnvironmentalImpactPage({
  params
}: EnvironmentalImpactPageProps) {
  const { id } = await params;

  return (
    <main className="section">
      <div className="page-shell">
        <span className="eyebrow">Environmental Report</span>
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.04em] text-[var(--bg-navy)] md:text-6xl">
          Hybrid carbon estimate
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-soft)]">
          This page combines Edamam&apos;s recipe-side climate signal with a separate
          shopping-trip estimate powered by Climatiq.
        </p>
        <div className="mt-10">
          <ImpactReportFlow recipeId={id} />
        </div>
      </div>
    </main>
  );
}

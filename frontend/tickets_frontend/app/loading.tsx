export default function Loading() {
  return (
    <div className="bg-background min-h-screen" aria-busy="true" aria-label="Cargando">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="bg-muted h-8 w-44 animate-pulse rounded" />
        <div className="bg-muted/60 h-10 w-full animate-pulse rounded-lg" />
        <div className="bg-muted/60 h-64 w-full animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

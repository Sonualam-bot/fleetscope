interface ResolutionIndicatorProps {
  resolutionMetersPerPixel: number | null;
}

function formatResolution(metersPerPixel: number): string {
  if (metersPerPixel >= 1000) {
    return `${(metersPerPixel / 1000).toFixed(1)} km/px`;
  }
  return `${metersPerPixel.toFixed(0)} m/px`;
}

function ResolutionIndicator({ resolutionMetersPerPixel }: ResolutionIndicatorProps) {
  if (resolutionMetersPerPixel === null) return null;

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-black/60 px-3 py-1.5 font-mono text-sm tracking-wide text-white backdrop-blur-sm">
      {formatResolution(resolutionMetersPerPixel)}
    </div>
  );
}

export default ResolutionIndicator;

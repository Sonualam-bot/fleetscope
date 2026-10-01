import { useEffect, useState } from "react";
import type { LonLatCoordinate } from "./useMapPointerCoordinate";

interface CoordinateReadoutProps {
  coordinate: LonLatCoordinate | null;
}

function CoordinateReadout({ coordinate }: CoordinateReadoutProps) {
  // Remember the last known coordinate so the pill can fade out
  // gracefully instead of blanking out the instant the pointer leaves.
  const [lastKnownCoordinate, setLastKnownCoordinate] =
    useState<LonLatCoordinate | null>(null);

  useEffect(() => {
    if (coordinate) setLastKnownCoordinate(coordinate);
  }, [coordinate]);

  if (!lastKnownCoordinate) return null;

  const isVisible = coordinate !== null;

  return (
    <div
      className={`pointer-events-none absolute bottom-4 left-4 w-23 rounded-md bg-black/60 px-3 py-1.5 font-mono text-sm tracking-wide text-white backdrop-blur-sm transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {lastKnownCoordinate.latitude.toFixed(4)},{" "}
      {lastKnownCoordinate.longitude.toFixed(4)}
    </div>
  );
}

export default CoordinateReadout;

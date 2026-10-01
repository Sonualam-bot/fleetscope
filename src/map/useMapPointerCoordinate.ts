import { useEffect, useState } from "react";
import type Map from "ol/Map";
import type MapBrowserEvent from "ol/MapBrowserEvent";
import { toLonLat } from "ol/proj";

export interface LonLatCoordinate {
  longitude: number;
  latitude: number;
}

/**
 * Tracks the map pointer's geographic position as it moves.
 * Returns null whenever the pointer isn't over the map.
 */
export function useMapPointerCoordinate(map: Map | null): LonLatCoordinate | null {
  const [coordinate, setCoordinate] = useState<LonLatCoordinate | null>(null);

  useEffect(() => {
    if (!map) return;

    const handlePointerMove = (event: MapBrowserEvent) => {
      const [longitude, latitude] = toLonLat(event.coordinate);
      setCoordinate({ longitude, latitude });
    };

    const handlePointerLeave = () => setCoordinate(null);

    map.on("pointermove", handlePointerMove);
    map.getTargetElement()?.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      map.un("pointermove", handlePointerMove);
      map.getTargetElement()?.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [map]);

  return coordinate;
}

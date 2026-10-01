import { useEffect, useState } from "react";
import type Map from "ol/Map";

/**
 * Tracks the map view's current resolution (meters per pixel on screen) as
 * it changes. In this app's projection (Web Mercator, EPSG:3857), the
 * view's resolution units are already meters, so no conversion is needed.
 */
export function useMapResolution(map: Map | null): number | null {
  const [resolutionMetersPerPixel, setResolutionMetersPerPixel] = useState<number | null>(null);

  useEffect(() => {
    if (!map) return;

    const view = map.getView();

    function updateResolution() {
      setResolutionMetersPerPixel(view.getResolution() ?? null);
    }

    updateResolution();
    view.on("change:resolution", updateResolution);

    return () => {
      view.un("change:resolution", updateResolution);
    };
  }, [map]);

  return resolutionMetersPerPixel;
}

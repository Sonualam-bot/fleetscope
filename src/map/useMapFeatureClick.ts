import { useEffect, useState } from "react";
import type Map from "ol/Map";
import type BaseLayer from "ol/layer/Base";
import type Feature from "ol/Feature";
import type MapBrowserEvent from "ol/MapBrowserEvent";

export interface FeatureClickSelection {
  feature: Feature;
  coordinate: number[];
}

/**
 * Tracks which feature on a specific layer was last clicked, along with the
 * click's map coordinate. Resets to null whenever the most recent click
 * missed every feature on that layer (open water, or a different layer).
 */
export function useMapFeatureClick(
  map: Map | null,
  layer: BaseLayer | null,
): FeatureClickSelection | null {
  const [selection, setSelection] = useState<FeatureClickSelection | null>(null);

  useEffect(() => {
    if (!map || !layer) return;
    const currentMap = map;
    const currentLayer = layer;

    function handleClick(event: MapBrowserEvent) {
      const clickedFeature = currentMap.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature as Feature,
        { layerFilter: (candidateLayer) => candidateLayer === currentLayer },
      );

      setSelection(
        clickedFeature ? { feature: clickedFeature, coordinate: event.coordinate } : null,
      );
    }

    currentMap.on("click", handleClick);
    return () => {
      currentMap.un("click", handleClick);
    };
  }, [map, layer]);

  return selection;
}

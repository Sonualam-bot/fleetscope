import { useEffect, useState } from "react";
import type Map from "ol/Map";
import type BaseLayer from "ol/layer/Base";
import type Feature from "ol/Feature";
import type MapBrowserEvent from "ol/MapBrowserEvent";

export interface FeatureClickSelection {
  feature: Feature;
  coordinate: number[];
}

export interface FeatureClickState {
  selection: FeatureClickSelection | null;
  clearSelection: () => void;
}

/**
 * Tracks which feature on a specific layer was last clicked, along with the
 * click's map coordinate. Resets to null whenever the most recent click
 * missed every feature on that layer (open water, or a different layer).
 *
 * `enabled` lets a caller temporarily suppress click handling entirely --
 * e.g. while a different map tool (like route drawing) is actively
 * consuming clicks, so a click meant for that tool doesn't also reselect
 * a feature underneath it.
 */
export function useMapFeatureClick(
  map: Map | null,
  layer: BaseLayer | null,
  enabled = true,
): FeatureClickState {
  const [selection, setSelection] = useState<FeatureClickSelection | null>(null);

  useEffect(() => {
    if (!map || !layer || !enabled) return;
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
  }, [map, layer, enabled]);

  function clearSelection(): void {
    setSelection(null);
  }

  return { selection, clearSelection };
}

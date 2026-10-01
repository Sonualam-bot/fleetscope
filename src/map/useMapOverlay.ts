import { useEffect, useRef, useState } from "react";
import Overlay from "ol/Overlay";
import type Map from "ol/Map";

export type OverlayVerticalPlacement = "top" | "bottom";
export type OverlayHorizontalPlacement = "left" | "center" | "right";

export interface OverlayPlacement {
  vertical: OverlayVerticalPlacement;
  horizontal: OverlayHorizontalPlacement;
}

// Rough size of the content this overlay holds, used only to decide which
// side(s) of the anchor point there's enough room to render into.
const OVERLAY_CONTENT_WIDTH_PX = 200;
const OVERLAY_CONTENT_HEIGHT_PX = 90;
const EDGE_MARGIN_PX = 16;
const VERTICAL_OFFSET_PX = 16;

const DEFAULT_PLACEMENT: OverlayPlacement = { vertical: "bottom", horizontal: "center" };

/** Decides which corner of the viewport the anchor point is closest to. */
function choosePlacement(map: Map, position: number[]): OverlayPlacement {
  const anchorPixel = map.getPixelFromCoordinate(position);
  const mapSize = map.getSize();
  if (!anchorPixel || !mapSize) return DEFAULT_PLACEMENT;

  const [anchorX, anchorY] = anchorPixel;
  const [mapWidth] = mapSize;

  const vertical: OverlayVerticalPlacement =
    anchorY >= OVERLAY_CONTENT_HEIGHT_PX + EDGE_MARGIN_PX ? "bottom" : "top";

  const horizontal: OverlayHorizontalPlacement =
    anchorX < OVERLAY_CONTENT_WIDTH_PX / 2 + EDGE_MARGIN_PX
      ? "left"
      : anchorX > mapWidth - OVERLAY_CONTENT_WIDTH_PX / 2 - EDGE_MARGIN_PX
        ? "right"
        : "center";

  return { vertical, horizontal };
}

/**
 * Creates an ol/Overlay bound to a plain DOM element (not one React renders
 * directly) and keeps it positioned at `position`; undefined hides it
 * without removing it. Returns that element so callers can render into it
 * with ReactDOM's createPortal -- OL physically relocates this element into
 * its own overlay container, so React must never manage its place in the
 * tree directly, only its contents.
 *
 * Also returns the chosen placement (which corner of the content sits at
 * the anchor point), re-evaluated on every position update, so content
 * stays clear of all four viewport edges, not just the top.
 */
export function useMapOverlay(map: Map | null, position: number[] | undefined) {
  const overlayRef = useRef<Overlay | null>(null);
  const [overlayElement, setOverlayElement] = useState<HTMLDivElement | null>(null);
  const [placement, setPlacement] = useState<OverlayPlacement>(DEFAULT_PLACEMENT);

  useEffect(() => {
    if (!map) return;

    const element = document.createElement("div");
    const overlay = new Overlay({ element, stopEvent: true });

    map.addOverlay(overlay);
    overlayRef.current = overlay;
    setOverlayElement(element);

    return () => {
      map.removeOverlay(overlay);
      overlayRef.current = null;
      setOverlayElement(null);
    };
  }, [map]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (!map || !position) {
      overlay.setPosition(position);
      return;
    }

    const nextPlacement = choosePlacement(map, position);
    setPlacement(nextPlacement);

    overlay.setPositioning(`${nextPlacement.vertical}-${nextPlacement.horizontal}`);
    overlay.setOffset([
      0,
      nextPlacement.vertical === "bottom" ? -VERTICAL_OFFSET_PX : VERTICAL_OFFSET_PX,
    ]);
    overlay.setPosition(position);
  }, [map, position]);

  return { element: overlayElement, placement };
}

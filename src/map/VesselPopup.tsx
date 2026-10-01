import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type Map from "ol/Map";
import type VectorLayer from "ol/layer/Vector";
import type VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { useAppSelector } from "../store/store";
import { useMapFeatureClick } from "./useMapFeatureClick";
import { useMapOverlay, type OverlayPlacement } from "./useMapOverlay";

interface VesselPopupProps {
  map: Map | null;
  vesselLayer: VectorLayer<VectorSource> | null;
}

/**
 * Keeps the scale-in animation growing out of whichever corner is anchored
 * to the vessel. Written as explicit branches (not string interpolation)
 * since Tailwind's build-time scanner only recognizes complete, literal
 * class names in the source -- a constructed string like
 * `origin-${vertical}-${horizontal}` wouldn't be picked up.
 */
function getTransformOriginClass(placement: OverlayPlacement): string {
  if (placement.vertical === "bottom") {
    if (placement.horizontal === "left") return "origin-bottom-left";
    if (placement.horizontal === "right") return "origin-bottom-right";
    return "origin-bottom";
  }
  if (placement.horizontal === "left") return "origin-top-left";
  if (placement.horizontal === "right") return "origin-top-right";
  return "origin-top";
}

/** Positions the little arrow on whichever edge/corner faces the vessel. */
function getArrowPositionClasses(placement: OverlayPlacement): string {
  const verticalClass = placement.vertical === "bottom" ? "-bottom-[5px]" : "-top-[5px]";
  const horizontalClass =
    placement.horizontal === "center"
      ? "left-1/2 -translate-x-1/2"
      : placement.horizontal === "left"
        ? "left-4"
        : "right-4";

  return `${verticalClass} ${horizontalClass}`;
}

function VesselPopup({ map, vesselLayer }: VesselPopupProps) {
  const selection = useMapFeatureClick(map, vesselLayer);
  const vesselId = selection?.feature.get("vesselId") as string | undefined;
  const vessel = useAppSelector((state) =>
    vesselId ? (state.fleet.vesselsById[vesselId] ?? null) : null,
  );

  // Anchored to the vessel's live position (not the click point), so the
  // popup keeps following the vessel if it moves while the popup is open.
  const vesselCoordinate = vessel ? fromLonLat([vessel.longitude, vessel.latitude]) : undefined;
  const { element: overlayElement, placement } = useMapOverlay(map, vesselCoordinate);

  // Drives the open animation: render one frame closed, then transition
  // open, so the card visibly materializes instead of popping in instantly.
  // Only re-runs when the *selected vessel* changes, not on every telemetry
  // tick, so live heading/speed updates don't replay the animation.
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!vesselId) {
      setIsOpen(false);
      return;
    }
    const animationFrameId = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(animationFrameId);
  }, [vesselId]);

  if (!overlayElement || !vessel) return null;

  return createPortal(
    <div
      className={`relative min-w-40 rounded-lg border border-white/10 bg-black/70 px-4 py-3 text-white shadow-lg backdrop-blur-md motion-safe:transition-all motion-safe:duration-200 ${getTransformOriginClass(
        placement,
      )} ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
    >
      <p className="text-sm font-semibold">{vessel.name}</p>
      <dl className="mt-1 space-y-0.5 font-mono text-xs tracking-wide text-white/80">
        <div className="flex justify-between gap-4">
          <dt>Heading</dt>
          <dd>{vessel.headingDegrees.toFixed(0)}°</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Speed</dt>
          <dd>{vessel.speedKnots.toFixed(1)} kn</dd>
        </div>
      </dl>
      <div
        className={`absolute h-2.5 w-2.5 rotate-45 bg-black/70 ${getArrowPositionClasses(placement)}`}
      />
    </div>,
    overlayElement,
  );
}

export default VesselPopup;

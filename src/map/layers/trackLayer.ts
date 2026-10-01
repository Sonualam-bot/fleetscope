import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import { Style, Stroke } from "ol/style";
import { fromLonLat } from "ol/proj";
import { store } from "../../store/store";
import type { VesselState } from "../../store/fleetSlice";

const TRACK_STROKE_RGB = "37, 99, 235"; // #2563eb, same blue as the vessel icon
const TRACK_STROKE_WIDTH = 2;
const FADE_UPDATE_INTERVAL_MS = 100;
// How long a trail segment stays visible before it's fully faded and removed.
const TRAIL_FADE_DURATION_MS = 6000;

function vesselCoordinate(vessel: VesselState): number[] {
  return fromLonLat([vessel.longitude, vessel.latitude]);
}

function coordinatesAreEqual(a: number[], b: number[]): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function createSegmentStyle(opacity: number): Style {
  return new Style({
    stroke: new Stroke({
      color: `rgba(${TRACK_STROKE_RGB}, ${opacity})`,
      width: TRACK_STROKE_WIDTH,
    }),
  });
}

interface TrackSegment {
  feature: Feature<LineString>;
  createdAtMs: number;
}

export interface TrackLayer {
  layer: VectorLayer<VectorSource>;
  dispose: () => void;
}

/**
 * Builds the per-vessel track-trail layer and keeps it in sync with the
 * Redux store, independently of vesselLayer.ts -- this layer only ever
 * reads current position and draws history; it has no idea vessel icons
 * or headings even exist.
 *
 * Each tick's movement is drawn as its own short segment, tagged with a
 * creation time. A separate interval (not tied to the store, since fading
 * is a continuous visual effect, not new data) ages and fades those
 * segments out, removing them once fully transparent.
 */
export function createTrackLayer(): TrackLayer {
  const vectorSource = new VectorSource();
  const segmentsByVesselId = new Map<string, TrackSegment[]>();
  const lastCoordinateByVesselId = new Map<string, number[]>();

  function addSegment(vessel: VesselState): void {
    const coordinate = vesselCoordinate(vessel);
    const lastCoordinate = lastCoordinateByVesselId.get(vessel.id);
    lastCoordinateByVesselId.set(vessel.id, coordinate);

    // Nothing to draw yet, or the vessel hasn't moved since the last point.
    if (!lastCoordinate || coordinatesAreEqual(lastCoordinate, coordinate)) return;

    const feature = new Feature({ geometry: new LineString([lastCoordinate, coordinate]) });
    feature.setStyle(createSegmentStyle(1));
    vectorSource.addFeature(feature);

    const segments = segmentsByVesselId.get(vessel.id) ?? [];
    segments.push({ feature, createdAtMs: Date.now() });
    segmentsByVesselId.set(vessel.id, segments);
  }

  function syncTracksWithStore(): void {
    const vesselsById = store.getState().fleet.vesselsById;
    for (const vessel of Object.values(vesselsById)) {
      addSegment(vessel);
    }
  }

  function fadeAndExpireSegments(): void {
    const now = Date.now();

    for (const [vesselId, segments] of segmentsByVesselId) {
      const remainingSegments: TrackSegment[] = [];

      for (const segment of segments) {
        const ageMs = now - segment.createdAtMs;

        if (ageMs >= TRAIL_FADE_DURATION_MS) {
          vectorSource.removeFeature(segment.feature);
          continue;
        }

        segment.feature.setStyle(createSegmentStyle(1 - ageMs / TRAIL_FADE_DURATION_MS));
        remainingSegments.push(segment);
      }

      segmentsByVesselId.set(vesselId, remainingSegments);
    }
  }

  const unsubscribeFromStore = store.subscribe(syncTracksWithStore);
  const fadeIntervalId = setInterval(fadeAndExpireSegments, FADE_UPDATE_INTERVAL_MS);
  syncTracksWithStore();

  const layer = new VectorLayer({ source: vectorSource });

  return {
    layer,
    dispose: () => {
      unsubscribeFromStore();
      clearInterval(fadeIntervalId);
    },
  };
}

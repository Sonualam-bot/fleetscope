import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Icon } from "ol/style";
import { fromLonLat } from "ol/proj";
import { store } from "../../store/store";
import type { VesselState } from "../../store/fleetSlice";
import { createBoatIconDataUri } from "./boatIcon";

const VESSEL_FILL_COLOR = "#2563eb";
const VESSEL_STROKE_COLOR = "#ffffff";
const VESSEL_ICON_SRC = createBoatIconDataUri(VESSEL_FILL_COLOR, VESSEL_STROKE_COLOR);

function headingDegreesToRotationRadians(headingDegrees: number): number {
  return (headingDegrees * Math.PI) / 180;
}

function vesselCoordinate(vessel: VesselState): number[] {
  return fromLonLat([vessel.longitude, vessel.latitude]);
}

function createVesselFeature(vessel: VesselState): Feature<Point> {
  const feature = new Feature({ geometry: new Point(vesselCoordinate(vessel)) });
  feature.set("vesselId", vessel.id);

  feature.setStyle(
    new Style({
      image: new Icon({
        src: VESSEL_ICON_SRC,
        anchor: [0.5, 0.5],
        rotation: headingDegreesToRotationRadians(vessel.headingDegrees),
      }),
    }),
  );

  return feature;
}

/** Moves and re-rotates an existing feature in place, instead of recreating it. */
function updateVesselFeature(feature: Feature<Point>, vessel: VesselState): void {
  feature.getGeometry()?.setCoordinates(vesselCoordinate(vessel));

  const markerImage = feature.getStyle();
  if (markerImage instanceof Style && markerImage.getImage() instanceof Icon) {
    (markerImage.getImage() as Icon).setRotation(
      headingDegreesToRotationRadians(vessel.headingDegrees),
    );
  }
}

export interface VesselLayer {
  layer: VectorLayer<VectorSource>;
  dispose: () => void;
}

/**
 * Builds the vessel marker layer and keeps it in sync with the Redux store.
 * Subscribes directly to the store (outside React) so position/heading
 * updates mutate existing OL features in place on every tick, rather than
 * flowing through a React re-render.
 */
export function createVesselLayer(): VesselLayer {
  const vectorSource = new VectorSource();
  const featureByVesselId = new Map<string, Feature<Point>>();

  function syncFeaturesWithStore(): void {
    const vesselsById = store.getState().fleet.vesselsById;

    for (const vessel of Object.values(vesselsById)) {
      const existingFeature = featureByVesselId.get(vessel.id);

      if (existingFeature) {
        updateVesselFeature(existingFeature, vessel);
      } else {
        const newFeature = createVesselFeature(vessel);
        featureByVesselId.set(vessel.id, newFeature);
        vectorSource.addFeature(newFeature);
      }
    }
  }

  const unsubscribeFromStore = store.subscribe(syncFeaturesWithStore);
  syncFeaturesWithStore(); // paint whatever state already exists, don't wait for the next tick

  const layer = new VectorLayer({ source: vectorSource });

  return { layer, dispose: unsubscribeFromStore };
}

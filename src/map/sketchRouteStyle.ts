import { Style, Stroke, Fill, Circle as CircleStyle, RegularShape } from "ol/style";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import type { FeatureLike } from "ol/Feature";

// A refined indigo, distinct from but harmonious with the vessels' blue.
const SKETCH_COLOR = "#7c3aed";
const SKETCH_STROKE_WIDTH = 2.5;
// Dashed to read as "draft, not committed yet" -- the track trails (and a
// route once assigned) are solid, so the line style itself communicates state.
const SKETCH_STROKE_DASH = [8, 6];
const START_MARKER_RADIUS_PX = 5;
const END_ARROW_RADIUS_PX = 7;

const lineStyle = new Style({
  stroke: new Stroke({
    color: SKETCH_COLOR,
    width: SKETCH_STROKE_WIDTH,
    lineDash: SKETCH_STROKE_DASH,
    lineCap: "round",
    lineJoin: "round",
  }),
});

function createStartMarkerStyle(startCoordinate: number[]): Style {
  return new Style({
    geometry: new Point(startCoordinate),
    image: new CircleStyle({
      radius: START_MARKER_RADIUS_PX,
      fill: new Fill({ color: "#ffffff" }),
      stroke: new Stroke({ color: SKETCH_COLOR, width: 2 }),
    }),
  });
}

/** An arrowhead at the line's tip, rotated to face the direction of the final segment. */
function createDirectionArrowStyle(secondLastCoordinate: number[], endCoordinate: number[]): Style {
  const deltaX = endCoordinate[0] - secondLastCoordinate[0];
  const deltaY = endCoordinate[1] - secondLastCoordinate[1];
  // Same "0 = north/up, clockwise" convention used for vessel heading rotation.
  const rotationRadians = Math.atan2(deltaX, deltaY);

  return new Style({
    geometry: new Point(endCoordinate),
    image: new RegularShape({
      points: 3,
      radius: END_ARROW_RADIUS_PX,
      rotation: rotationRadians,
      fill: new Fill({ color: SKETCH_COLOR }),
      stroke: new Stroke({ color: "#ffffff", width: 1.5 }),
    }),
  });
}

/**
 * Styles the in-progress route sketch: a dashed line, a marker at the start
 * point (where the vessel heads first), and an arrowhead at the tip showing
 * the direction the vessel will be travelling -- so it's clear which end is
 * the head and which is the tail.
 */
export function createSketchRouteStyle(feature: FeatureLike): Style[] {
  const geometry = feature.getGeometry();
  if (!(geometry instanceof LineString)) return [lineStyle];

  const coordinates = geometry.getCoordinates();
  if (coordinates.length === 0) return [lineStyle];

  const styles = [lineStyle, createStartMarkerStyle(coordinates[0])];

  if (coordinates.length > 1) {
    const endCoordinate = coordinates[coordinates.length - 1];
    const secondLastCoordinate = coordinates[coordinates.length - 2];
    styles.push(createDirectionArrowStyle(secondLastCoordinate, endCoordinate));
  }

  return styles;
}

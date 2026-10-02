import { useEffect, useRef, useState } from "react";
import type Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import type LineString from "ol/geom/LineString";
import { toLonLat } from "ol/proj";
import { telemetrySource } from "../telemetry/simulatedTelemetrySource";
import type { LonLat } from "../telemetry/vesselMotion";
import { createSketchRouteStyle } from "./sketchRouteStyle";

export interface RouteDrawingTool {
  isDrawing: boolean;
  startDrawingRouteFor: (vesselId: string) => void;
  cancelDrawing: () => void;
}

/**
 * Owns the map's route-drawing interaction and its temporary sketch layer.
 * One-shot: calling startDrawingRouteFor arms the next drawn line for a
 * specific vessel; once that line is finished, its points are handed to the
 * telemetry source as a new route and the tool drops back out of draw mode.
 */
export function useRouteDrawingTool(map: Map | null): RouteDrawingTool {
  const drawInteractionRef = useRef<Draw | null>(null);
  const targetVesselIdRef = useRef<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!map) return;

    const sketchSource = new VectorSource();
    const sketchLayer = new VectorLayer({
      source: sketchSource,
      style: createSketchRouteStyle,
      zIndex: 0,
    });

    const drawInteraction = new Draw({ source: sketchSource, type: "LineString" });
    drawInteraction.setActive(false);

    drawInteraction.on("drawend", (event) => {
      const vesselId = targetVesselIdRef.current;
      const geometry = event.feature.getGeometry() as LineString | undefined;

      if (vesselId && geometry) {
        const waypoints: LonLat[] = geometry.getCoordinates().map((coordinate) => {
          const [longitude, latitude] = toLonLat(coordinate);
          return { longitude, latitude };
        });
        telemetrySource.assignRoute(vesselId, waypoints);
      }

      sketchSource.clear();
      drawInteraction.setActive(false);
      targetVesselIdRef.current = null;
      setIsDrawing(false);
    });

    map.addLayer(sketchLayer);
    map.addInteraction(drawInteraction);
    drawInteractionRef.current = drawInteraction;

    return () => {
      map.removeInteraction(drawInteraction);
      map.removeLayer(sketchLayer);
      drawInteractionRef.current = null;
    };
  }, [map]);

  function startDrawingRouteFor(vesselId: string): void {
    targetVesselIdRef.current = vesselId;
    drawInteractionRef.current?.setActive(true);
    setIsDrawing(true);
  }

  function cancelDrawing(): void {
    drawInteractionRef.current?.setActive(false);
    targetVesselIdRef.current = null;
    setIsDrawing(false);
  }

  return { isDrawing, startDrawingRouteFor, cancelDrawing };
}

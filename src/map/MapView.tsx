import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import type VectorLayer from "ol/layer/Vector";
import type VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import { useMapPointerCoordinate } from "./useMapPointerCoordinate";
import CoordinateReadout from "./CoordinateReadout";
import { useMapResolution } from "./useMapResolution";
import ResolutionIndicator from "./ResolutionIndicator";
import { createVesselLayer } from "./layers/vesselLayer";
import { createTrackLayer } from "./layers/trackLayer";
import VesselPopup from "./VesselPopup";

// Centered on the Singapore Strait, where the simulated fleet patrols.
const INITIAL_CENTER_LON_LAT: [number, number] = [103.85, 1.2];
const INITIAL_ZOOM_LEVEL = 11;

function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [vesselVectorLayer, setVesselVectorLayer] = useState<VectorLayer<VectorSource> | null>(
    null,
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const trackLayer = createTrackLayer();
    const vesselLayer = createVesselLayer();

    const mapInstance = new Map({
      target: mapContainerRef.current,
      layers: [new TileLayer({ source: new OSM() }), trackLayer.layer, vesselLayer.layer],
      view: new View({
        center: fromLonLat(INITIAL_CENTER_LON_LAT),
        zoom: INITIAL_ZOOM_LEVEL,
      }),
    });

    setMap(mapInstance);
    setVesselVectorLayer(vesselLayer.layer);

    return () => {
      mapInstance.setTarget(undefined);
      trackLayer.dispose();
      vesselLayer.dispose();
      setMap(null);
      setVesselVectorLayer(null);
    };
  }, []);

  const pointerCoordinate = useMapPointerCoordinate(map);
  const resolutionMetersPerPixel = useMapResolution(map);

  return (
    <div className="relative h-screen w-screen">
      <div ref={mapContainerRef} className="h-full w-full" />
      <CoordinateReadout coordinate={pointerCoordinate} />
      <ResolutionIndicator resolutionMetersPerPixel={resolutionMetersPerPixel} />
      <VesselPopup map={map} vesselLayer={vesselVectorLayer} />
    </div>
  );
}

export default MapView;

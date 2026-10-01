import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import { useMapPointerCoordinate } from "./useMapPointerCoordinate";
import CoordinateReadout from "./CoordinateReadout";

const INITIAL_CENTER_LON_LAT: [number, number] = [96.0997, 27.5451];
const INITIAL_ZOOM_LEVEL = 10;

function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapInstance = new Map({
      target: mapContainerRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: fromLonLat(INITIAL_CENTER_LON_LAT),
        zoom: INITIAL_ZOOM_LEVEL,
      }),
    });

    setMap(mapInstance);

    return () => {
      mapInstance.setTarget(undefined);
      setMap(null);
    };
  }, []);

  const pointerCoordinate = useMapPointerCoordinate(map);

  return (
    <div className="relative h-screen w-screen">
      <div ref={mapContainerRef} className="h-full w-full" />
      <CoordinateReadout coordinate={pointerCoordinate} />
    </div>
  );
}

export default MapView;

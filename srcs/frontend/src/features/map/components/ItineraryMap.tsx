import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(workerUrl);

export function ItineraryMap() {
  return (
    <div className="relative h-full min-h-64">
      <Map
        initialViewState={{
          longitude: 6.63,
          latitude: 46.52,
          zoom: 11,
        }}
        style={{position: "absolute", inset: 0 }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
      />
    </div>
  );
}

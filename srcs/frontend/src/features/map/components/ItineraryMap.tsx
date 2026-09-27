import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(workerUrl);

export function ItineraryMap() {
  return (
    <div className="flex-1 md:h-full overflow-hidden rounded-lg border border-surface">
      <Map
        initialViewState={{
          longitude: 6.63,
          latitude: 46.52,
          zoom: 11,
        }}
        style={{clipPath: "inset(0 round 20px)" }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"

      />
    </div>
  );
}

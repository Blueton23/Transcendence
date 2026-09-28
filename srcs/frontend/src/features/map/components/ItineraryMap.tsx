import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { Step } from "@/features/step/types";

setWorkerUrl(workerUrl);

export function ItineraryMap({ steps }: { steps: Step[] }) {
  return (
    <div className="flex-1 overflow-hidden rounded-lg border border-surface md:h-full">
      <Map
        initialViewState={{
          longitude: 6.63,
          latitude: 46.52,
          zoom: 11,
        }}
        style={{ clipPath: "inset(0 round 20px)" }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
      >
        {steps.map((step) => (
          <Marker
            key={step.id}
            longitude={Number(step.longitude)}
            latitude={Number(step.latitude)}
          />
        ))}
      </Map>
    </div>
  );
}

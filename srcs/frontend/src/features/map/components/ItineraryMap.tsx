import Map, { Marker, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import type { Step } from "@/features/step/types";
import { useMapResize } from "@/features/map/hooks/useMapResize";
import { useRef } from "react";
import { useMapFraming } from "@/features/map/hooks/useMapFraming";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export function ItineraryMap({
  steps,
  detailStep,
}: {
  steps: Step[];
  detailStep: Step | null;
}) {
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useMapResize(containerRef, mapRef);
  useMapFraming({ mapRef, steps, detailStep });

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden rounded-lg border border-surface md:h-full"
    >
      <Map
        language="fr"
        ref={mapRef}
        projection={"mercator"}
        initialViewState={{ longitude: 6.63, latitude: 46.52, zoom: 11 }}
        style={{ clipPath: "inset(0 round 20px)" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
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

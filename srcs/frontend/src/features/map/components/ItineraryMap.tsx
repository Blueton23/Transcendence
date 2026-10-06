import Map, { Layer, Marker, Source, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import type { Step } from "@/features/step/types";
import { useMapResize } from "@/features/map/hooks/useMapResize";
import { useRef } from "react";
import { useMapFraming } from "@/features/map/hooks/useMapFraming";
import { getStepsBounds } from "@/features/map/utils/getBounds";
import type { Route } from "@/features/map/types";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export function ItineraryMap({
  steps,
  detailStep,
  route,
}: {
  steps: Step[];
  detailStep: Step | null;
  route: Route | null;
}) {
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bounds = getStepsBounds(steps);

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
        initialViewState={
          bounds
            ? {
                bounds: [bounds.min, bounds.max],
                fitBoundsOptions: { padding: 100, maxZoom: 12 },
              }
            : { longitude: 6.63, latitude: 46.52, zoom: 11 }
        }
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
        {route && (
          <Source
            id="route"
            type="geojson"
            data={{ type: "Feature", properties: {}, geometry: route.geometry }}
          >
            <Layer
              id="route-outline"
              type="line"
              layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ "line-color": "#fff", "line-width": 7 }}
            />
            <Layer
              id="route-line"
              type="line"
              layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ "line-color": "#f2664a", "line-width": 4 }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}

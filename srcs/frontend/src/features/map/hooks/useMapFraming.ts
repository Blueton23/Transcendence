import { getStepsBounds } from "@/features/map/utils/getBounds";
import type { Step } from "@/features/step/types";
import { useEffect, type RefObject } from "react";
import type { MapRef } from "react-map-gl/mapbox";

interface useMapFramingProps {
  mapRef: RefObject<MapRef | null>;
  steps: Step[];
  detailStep: Step | null | undefined;
}

export function useMapFraming({
  mapRef,
  steps,
  detailStep,
}: useMapFramingProps) {
  useEffect(() => {
    if (
      !detailStep ||
      detailStep.latitude == null ||
      detailStep.longitude == null
    ) {
      const bounds = getStepsBounds(steps);
      if (bounds) {
        mapRef.current?.fitBounds([bounds.min, bounds.max], { padding: 100 });
      }
      return;
    }
    mapRef.current?.flyTo({
      center: [Number(detailStep.longitude), Number(detailStep.latitude)],
      zoom: 14,
    });
  }, [detailStep, steps, mapRef]);
}

import { useEffect, type RefObject } from "react";
import type { MapRef } from "react-map-gl/mapbox";

export function useMapResize(
  containerRef: RefObject<HTMLDivElement | null>,
  mapRef: RefObject<MapRef | null>,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, mapRef]);
}

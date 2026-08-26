export interface WithClassName {
  className?: string;
}

export interface TripNavBlockProps extends WithClassName {
  tripId: string;
}

export interface AppNavBlockProps extends WithClassName {}

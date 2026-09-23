import type { Travel } from "@/features/travel/types";
import Card from "@/shared/ui/Card";
import { Fragment } from "react/jsx-runtime";

interface TravelListProps {
  travels: Travel[];
}

export function TravelList({ travels }: TravelListProps) {
  return (
    <div className="flex">
      {travels.map((travel, index) => (
        <Fragment key={travel.id}>
          {index > 0 && <Card variant="accent">{travel.title}</Card>}
        </Fragment>
      ))}
    </div>
  );
}

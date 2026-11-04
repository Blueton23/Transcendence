import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useTravelSocket } from "./useTravelSocket";

// The server closes the trip socket as "forbidden" when the user is not (or
// no longer) a participant, e.g. after leaving the trip from another tab.
// The trip pages are then of no use: go back to the trip list.
export function TravelAccessGuard() {
  const { status } = useTravelSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "forbidden") navigate("/travel", { replace: true });
  }, [status, navigate]);

  return null;
}

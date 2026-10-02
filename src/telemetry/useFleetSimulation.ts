import { useEffect } from "react";
import { useAppDispatch } from "../store/store";
import { telemetryReceived } from "../store/fleetSlice";
import { telemetrySource } from "./simulatedTelemetrySource";

/**
 * Subscribes to the app's telemetry source and feeds its updates into the
 * Redux store. This is the only place that reads from it directly for
 * display purposes -- the route-drawing tool also talks to the same
 * singleton instance, but to command it (assignRoute), not to subscribe.
 */
export function useFleetSimulation(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = telemetrySource.subscribe((updates) => {
      dispatch(telemetryReceived(updates));
    });

    return unsubscribe;
  }, [dispatch]);
}

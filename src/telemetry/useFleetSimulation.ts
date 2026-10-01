import { useEffect } from "react";
import { useAppDispatch } from "../store/store";
import { telemetryReceived } from "../store/fleetSlice";
import { SimulatedTelemetrySource } from "./TelemetrySource";

/**
 * Starts the simulated telemetry source and feeds its updates into the
 * Redux store. This is the only place in the app that knows a
 * SimulatedTelemetrySource exists -- swapping in a real WebSocket source
 * later means changing this one file, not the store or the map.
 */
export function useFleetSimulation(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const telemetrySource = new SimulatedTelemetrySource();

    const unsubscribe = telemetrySource.subscribe((updates) => {
      dispatch(telemetryReceived(updates));
    });

    return unsubscribe;
  }, [dispatch]);
}

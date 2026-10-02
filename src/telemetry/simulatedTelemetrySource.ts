import { SimulatedTelemetrySource } from "./TelemetrySource";

/**
 * The app's single telemetry source instance. Consumers depend on the
 * TelemetrySource interface, not this concrete class, but there's only one
 * instance of it for the whole app -- same pattern as the Redux store.
 */
export const telemetrySource = new SimulatedTelemetrySource();

import { advanceVessel, type VesselMotionState } from "./vesselMotion";
import { SEED_FLEET } from "./seedFleet";

export interface VesselTelemetry {
  vesselId: string;
  name: string;
  longitude: number;
  latitude: number;
  headingDegrees: number;
  speedKnots: number;
  timestampMs: number;
}

/**
 * Anything that can feed the app a stream of vessel telemetry.
 * The rest of the app depends only on this interface, never on how the data
 * is actually produced -- so a simulated source can be swapped for a real
 * WebSocket source later without touching any other code.
 */
export interface TelemetrySource {
  subscribe(onTick: (updates: VesselTelemetry[]) => void): () => void;
}

const TICK_INTERVAL_MS = 500;

export class SimulatedTelemetrySource implements TelemetrySource {
  private vesselMotionById = new Map<string, { name: string; motion: VesselMotionState }>(
    SEED_FLEET.map((vessel) => [vessel.id, { name: vessel.name, motion: vessel.motion }]),
  );
  private listeners = new Set<(updates: VesselTelemetry[]) => void>();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  subscribe(onTick: (updates: VesselTelemetry[]) => void): () => void {
    this.listeners.add(onTick);
    this.ensureTicking();

    return () => {
      this.listeners.delete(onTick);
      if (this.listeners.size === 0) this.stopTicking();
    };
  }

  private ensureTicking(): void {
    if (this.intervalId !== null) return;
    this.intervalId = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  private stopTicking(): void {
    if (this.intervalId === null) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private tick(): void {
    const elapsedSeconds = TICK_INTERVAL_MS / 1000;
    const timestampMs = Date.now();
    const updates: VesselTelemetry[] = [];

    for (const [vesselId, entry] of this.vesselMotionById) {
      const nextMotion = advanceVessel(entry.motion, elapsedSeconds);
      entry.motion = nextMotion;

      updates.push({
        vesselId,
        name: entry.name,
        longitude: nextMotion.position.longitude,
        latitude: nextMotion.position.latitude,
        headingDegrees: nextMotion.headingDegrees,
        speedKnots: nextMotion.speedKnots,
        timestampMs,
      });
    }

    for (const listener of this.listeners) listener(updates);
  }
}

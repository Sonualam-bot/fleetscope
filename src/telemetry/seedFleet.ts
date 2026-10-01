import type { VesselMotionState } from "./vesselMotion";

export interface SeededVessel {
  id: string;
  name: string;
  motion: VesselMotionState;
}

/**
 * Fixed starting fleet for the simulation, patrolling the Singapore Strait
 * (a real, recognizable shipping lane) so vessels visibly sit on open water.
 */
export const SEED_FLEET: SeededVessel[] = [
  {
    id: "vessel-1",
    name: "MV Horizon",
    motion: {
      position: { longitude: 103.7, latitude: 1.15 },
      headingDegrees: 0,
      waypoints: [
        { longitude: 103.7, latitude: 1.15 },
        { longitude: 104.05, latitude: 1.2 },
      ],
      currentWaypointIndex: 1,
      waypointStepDirection: 1,
      speedKnots: 14,
    },
  },
  {
    id: "vessel-2",
    name: "MV Meridian",
    motion: {
      position: { longitude: 103.85, latitude: 1.05 },
      headingDegrees: 0,
      waypoints: [
        { longitude: 103.85, latitude: 1.05 },
        { longitude: 103.75, latitude: 1.28 },
      ],
      currentWaypointIndex: 1,
      waypointStepDirection: 1,
      speedKnots: 18,
    },
  },
  {
    id: "vessel-3",
    name: "MV Tradewind",
    motion: {
      position: { longitude: 103.6, latitude: 1.22 },
      headingDegrees: 0,
      waypoints: [
        { longitude: 103.6, latitude: 1.22 },
        { longitude: 104.1, latitude: 1.1 },
      ],
      currentWaypointIndex: 1,
      waypointStepDirection: 1,
      speedKnots: 11,
    },
  },
  {
    id: "vessel-4",
    name: "MV Comet",
    motion: {
      position: { longitude: 103.95, latitude: 1.3 },
      headingDegrees: 0,
      waypoints: [
        { longitude: 103.95, latitude: 1.3 },
        { longitude: 103.65, latitude: 1.08 },
      ],
      currentWaypointIndex: 1,
      waypointStepDirection: 1,
      speedKnots: 20,
    },
  },
  {
    id: "vessel-5",
    name: "MV Beacon",
    motion: {
      position: { longitude: 103.78, latitude: 1.18 },
      headingDegrees: 0,
      waypoints: [
        { longitude: 103.78, latitude: 1.18 },
        { longitude: 104.0, latitude: 1.32 },
      ],
      currentWaypointIndex: 1,
      waypointStepDirection: 1,
      speedKnots: 16,
    },
  },
];

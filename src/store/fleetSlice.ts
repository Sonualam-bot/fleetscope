import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { VesselTelemetry } from "../telemetry/TelemetrySource";

export interface VesselState {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  headingDegrees: number;
  speedKnots: number;
}

export interface FleetState {
  vesselsById: Record<string, VesselState>;
}

const initialState: FleetState = {
  vesselsById: {},
};

const fleetSlice = createSlice({
  name: "fleet",
  initialState,
  reducers: {
    telemetryReceived(state, action: PayloadAction<VesselTelemetry[]>) {
      for (const update of action.payload) {
        state.vesselsById[update.vesselId] = {
          id: update.vesselId,
          name: update.name,
          longitude: update.longitude,
          latitude: update.latitude,
          headingDegrees: update.headingDegrees,
          speedKnots: update.speedKnots,
        };
      }
    },
  },
});

export const { telemetryReceived } = fleetSlice.actions;
export default fleetSlice.reducer;

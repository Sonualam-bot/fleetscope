export interface LonLat {
  longitude: number;
  latitude: number;
}

const EARTH_RADIUS_METERS = 6371000;
const KNOTS_TO_METERS_PER_SECOND = 0.514444;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function knotsToMetersPerSecond(speedKnots: number): number {
  return speedKnots * KNOTS_TO_METERS_PER_SECOND;
}

/** Great-circle distance between two points, in meters. */
export function distanceMeters(from: LonLat, to: LonLat): number {
  const fromLatRad = toRadians(from.latitude);
  const toLatRad = toRadians(to.latitude);
  const deltaLatRad = toRadians(to.latitude - from.latitude);
  const deltaLonRad = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLatRad / 2) ** 2 +
    Math.cos(fromLatRad) * Math.cos(toLatRad) * Math.sin(deltaLonRad / 2) ** 2;
  // atan2(y, x) returns the angle of the point (x, y) measured from the
  // positive x-axis, in radians. It's like atan(y / x), but it looks at x
  // and y separately instead of just their ratio, so it can tell which
  // quadrant the angle is really in and never divides by zero when x is 0.
  // Here it converts the haversine value `a` into an angular distance in a
  // way that stays numerically accurate for both tiny and huge distances.
  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * centralAngle;
}

/** Initial compass bearing from one point to another, in degrees (0 = north, 90 = east). */
export function bearingDegrees(from: LonLat, to: LonLat): number {
  const fromLatRad = toRadians(from.latitude);
  const toLatRad = toRadians(to.latitude);
  const deltaLonRad = toRadians(to.longitude - from.longitude);

  const y = Math.sin(deltaLonRad) * Math.cos(toLatRad);
  const x =
    Math.cos(fromLatRad) * Math.sin(toLatRad) -
    Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(deltaLonRad);

  // Same atan2 idea as above: x and y here are the east/west and
  // "forward/backward" components of the direction to the target. atan2
  // turns that (x, y) pair into a single angle, correctly signed for all
  // four compass directions. Plain atan(y / x) can't do this -- it would
  // return the same angle for a target to the north-east and to the
  // south-west, since -1/-1 and 1/1 are the same ratio.
  const bearingRad = Math.atan2(y, x);
  // atan2 returns radians in (-180°, 180°]; bearings are conventionally
  // 0-360°, so negative angles get wrapped around with + 360 and % 360.
  return (toDegrees(bearingRad) + 360) % 360;
}

/** The point reached by travelling a given distance from a start point along a bearing. */
export function destinationPoint(
  start: LonLat,
  bearing: number,
  distance: number,
): LonLat {
  const angularDistance = distance / EARTH_RADIUS_METERS;
  const bearingRad = toRadians(bearing);
  const startLatRad = toRadians(start.latitude);
  const startLonRad = toRadians(start.longitude);

  // asin is the inverse of sin: given sin(angle), it returns the angle
  // itself (in radians, between -90° and 90°). The spherical-geometry
  // formula below computes sin(destination latitude) directly from the
  // start point, distance, and bearing -- asin "undoes" the sin so we get
  // the actual latitude back out, not just its sine.
  const destLatRad = Math.asin(
    Math.sin(startLatRad) * Math.cos(angularDistance) +
      Math.cos(startLatRad) * Math.sin(angularDistance) * Math.cos(bearingRad),
  );
  // atan2 again, for the same reason as in bearingDegrees: this recovers
  // the change in longitude as a properly-signed angle (so it knows
  // whether the destination is east or west) instead of just a ratio.
  const destLonRad =
    startLonRad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(startLatRad),
      Math.cos(angularDistance) - Math.sin(startLatRad) * Math.sin(destLatRad),
    );

  return {
    longitude: toDegrees(destLonRad),
    latitude: toDegrees(destLatRad),
  };
}

export interface VesselMotionState {
  position: LonLat;
  headingDegrees: number;
  waypoints: LonLat[];
  currentWaypointIndex: number;
  waypointStepDirection: 1 | -1;
  speedKnots: number;
}

/**
 * Advances a vessel along its route by `elapsedSeconds`.
 * Moves in a straight line toward the current target waypoint; on arrival,
 * steps to the next waypoint, reversing direction at either end of the
 * route (a back-and-forth "ping-pong" patrol rather than teleporting back
 * to the start).
 */
export function advanceVessel(
  vessel: VesselMotionState,
  elapsedSeconds: number,
): VesselMotionState {
  if (vessel.waypoints.length <= 1) return vessel;

  const targetWaypoint = vessel.waypoints[vessel.currentWaypointIndex];
  const distanceToTravel = knotsToMetersPerSecond(vessel.speedKnots) * elapsedSeconds;
  const distanceToTarget = distanceMeters(vessel.position, targetWaypoint);
  const heading = bearingDegrees(vessel.position, targetWaypoint);

  if (distanceToTravel < distanceToTarget) {
    return {
      ...vessel,
      position: destinationPoint(vessel.position, heading, distanceToTravel),
      headingDegrees: heading,
    };
  }

  // Reached (or passed) the waypoint this tick: snap to it and advance the route pointer.
  const isAtRouteEnd =
    vessel.currentWaypointIndex === vessel.waypoints.length - 1 ||
    vessel.currentWaypointIndex === 0;
  const nextDirection =
    vessel.waypoints.length > 1 && isAtRouteEnd
      ? (-vessel.waypointStepDirection as 1 | -1)
      : vessel.waypointStepDirection;

  return {
    ...vessel,
    position: targetWaypoint,
    headingDegrees: heading,
    currentWaypointIndex: vessel.currentWaypointIndex + nextDirection,
    waypointStepDirection: nextDirection,
  };
}

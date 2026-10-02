# Fleetscope — Task Checklist

Mirrors the phased plan. Check items off as they're completed.

## Phase 1 — Core MVP

- [x] Map renders (OSM base layer, full-screen)
- [x] Live pointer coordinate readout
- [x] Simulated fleet: vessel motion math, telemetry source, Redux store, vessel layer
- [x] Boat icon markers (rotated by heading)
- [x] Per-vessel track trails (fading, not fixed-length)
- [x] Click-to-popup (name/speed/heading, corner-aware placement)
- [x] Route drawing tool, assignable to a vessel
- [ ] Distance measuring tool
- [ ] Original visual identity pass (palette/branding beyond default blue)
- [ ] Deploy to Vercel
- [ ] README with demo GIF

## Phase 2 — Incremental additions (after Phase 1 ships)

- [ ] Geofencing (draw zone + enter/exit alert)
- [ ] Bathymetry/density heatmap
- [ ] Layer switcher panel
- [ ] Right-click context menu
- [ ] Telemetry side panel with mini charts
- [ ] Selection sync (sidebar list ↔ map)
- [ ] Clustering (if vessel count grows)
- [ ] Geocoder search (stretch)

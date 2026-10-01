const BOAT_ICON_SIZE_PX = 24;

/**
 * Builds a simple top-down boat silhouette as an inline SVG data URI, so the
 * marker stays crisp at any zoom level without needing an external image file.
 * The boat points "up" (north) at rotation 0, matching how vessel heading
 * rotation is applied to it.
 */
export function createBoatIconDataUri(fillColor: string, strokeColor: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${BOAT_ICON_SIZE_PX}" height="${BOAT_ICON_SIZE_PX}" viewBox="0 0 24 24">
      <polygon points="12,2 18,9 16,20 8,20 6,9" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" stroke-linejoin="round" />
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

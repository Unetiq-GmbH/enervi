import L from "leaflet";

// @ts-expect-error: Override default icon URLs by deleting _getIconUrl method, which is not exposed in Leaflet's TypeScript definitions
delete L.Icon.Default.prototype._getIconUrl;

// Merge custom icon options to set the correct paths for default icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `/images/marker-icon-2x.png`,
  iconUrl: `/images/marker-icon.png`,
  shadowUrl: `/images/marker-shadow.png`,
});

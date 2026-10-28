import { ImageSrc } from "../types";

export const getImageBase64FromSrc = (imageSrc: ImageSrc) => {
  const startOfBase64 = imageSrc.indexOf(",") + 1;
  return imageSrc.substring(startOfBase64);
};

export function calculateBounds(
  latitude: number,
  longitude: number,
  radiusInMeters: number
) {
  // Earth's radius in meters
  const earthRadius = 6371000;

  // Latitude and longitude in radians
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;

  // Angular distance covered by the radius
  const angularDistance = radiusInMeters / earthRadius;

  // Calculate bounds
  const minLat = latRad - angularDistance;
  const maxLat = latRad + angularDistance;

  // Calculate bounds considering longitude wrapping around 180°
  const minLon = lonRad - angularDistance / Math.cos(latRad);
  const maxLon = lonRad + angularDistance / Math.cos(latRad);

  // Convert back to degrees
  const minLatDeg = (minLat * 180) / Math.PI;
  const maxLatDeg = (maxLat * 180) / Math.PI;
  const minLonDeg = (minLon * 180) / Math.PI;
  const maxLonDeg = (maxLon * 180) / Math.PI;

  return [
    [minLatDeg, minLonDeg], // Southwest (bottom-left)
    [maxLatDeg, maxLonDeg], // Northeast (top-right)
  ];
}

export const appendQueryParamsToUrl = (
  url: string,
  params: Record<string, string | number | undefined>
): string => {
  let shouldAppendAmpersand = false;
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "null" &&
      value !== "undefined"
    ) {
      url += !shouldAppendAmpersand ? `?${key}=${value}` : `&${key}=${value}`;
      shouldAppendAmpersand = true;
    }
  });

  return url;
};

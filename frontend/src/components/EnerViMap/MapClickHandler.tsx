import { LeafletMouseEvent } from "leaflet";
import { useMapEvents } from "react-leaflet";

function MapClickHandler({
  handleMapClick,
}: {
  handleMapClick: (event: LeafletMouseEvent) => void;
}) {
  useMapEvents({
    click: handleMapClick,
  });

  return null;
}

export default MapClickHandler;

import { Icon, LatLngExpression, LeafletMouseEvent } from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import City from "@/enums/City";
import { getByIconType, MarkerIconType } from "@/enums/MarkerIconType";

import { usePins } from "@/hooks/api/pins";
import useMediaQuery from "@/hooks/useMediaQuery";

import { getPinFromOpenStreetMapByCoordinates } from "@/service/pin.service";
import { Pin, PinLocation } from "@/types";
import CitySwitcher from "@components/CitySwitcher";

import "leaflet-geosearch/dist/geosearch.css";
import "leaflet/dist/leaflet.css";

import PinModal from "../PinModal/PinModal";
import PinPortal from "../PinModal/PinPortal";
import styles from "./index.module.scss";
import MapClickHandler from "./MapClickHandler";
import "./utils/LeafletDefaultIcon";
import "./zoomControls.scss";

const defaultLatLng: LatLngExpression = City.Berlin.latLng;

const cityZoomLevels: Record<string, number> = {
  Berlin: 10.5,
  Neuerkirch: 14.5,
};

const getCustomMarkerIcon = (iconType: string) => {
  return new Icon({
    iconUrl: getByIconType(iconType)?.iconUrl,
    iconSize: [30, 30],
  });
};

interface Props {
  onSelectLocation?: (pinData: PinLocation) => void;
  showSwitcher?: boolean;
}

const MapCenterUpdater = ({
  center,
  zoom,
  showModal,
}: {
  center: LatLngExpression;
  zoom: number;
  showModal: boolean;
}) => {
  const map = useMap();
  map.setView(center, zoom);

  useEffect(() => {
    if (showModal) {
      map.scrollWheelZoom.disable();
    } else {
      map.scrollWheelZoom.enable();
    }
  }, [showModal, map]);

  return null;
};

function EVMap({ onSelectLocation, showSwitcher }: Props) {
  const [pinLocation, setPinLocation] = useState<PinLocation | null>(null);
  const [pin, setPin] = useState<Pin | null>(null);
  const [pins] = usePins();
  const [center, setCenter] = useState<LatLngExpression>(defaultLatLng);
  const [zoom, setZoom] = useState<number>(cityZoomLevels.Berlin);
  const [showModal, setShowModal] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleMapClick = async (event: LeafletMouseEvent) => {
    if (!onSelectLocation) return;

    const { latlng } = event;

    const pinData = await getPinFromOpenStreetMapByCoordinates(latlng);

    if (pinData) {
      setPinLocation(pinData);
      onSelectLocation?.(pinData);
    }
  };

  const handleCityChange = (city: string) => {
    setCenter(City[city].latLng);
    setZoom(cityZoomLevels[city]);
  };

  const handleMarkerClick = (pin: Pin) => {
    setPin(pin);
    setShowModal(true);
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomSnap={0.25}
      className={styles.leafletMap}
    >
      <MapCenterUpdater center={center} zoom={zoom} showModal={showModal} />

      <MapClickHandler handleMapClick={handleMapClick} />

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {showSwitcher && <CitySwitcher onChange={handleCityChange} />}

      {pinLocation && (
        <Marker
          position={[pinLocation.latlng.lat, pinLocation.latlng.lng]}
          icon={getCustomMarkerIcon(MarkerIconType.Default.iconType)}
        />
      )}

      {pins.map((pin) => (
        <Marker
          key={pin._id}
          position={[pin.latlng.lat, pin.latlng.lng]}
          icon={getCustomMarkerIcon(pin.markerIconType)}
          eventHandlers={{
            click: () => handleMarkerClick(pin),
          }}
        />
      ))}

      {showModal && !isMobile && (
        <PinModal pin={pin} onClose={() => setShowModal(false)} />
      )}

      {showModal && isMobile && (
        <PinPortal pin={pin} onClose={() => setShowModal(false)} />
      )}
    </MapContainer>
  );
}

export default EVMap;

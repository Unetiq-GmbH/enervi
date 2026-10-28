import { AxiosError } from "axios";
import { OutputData } from "@editorjs/editorjs";
import { LatLngExpression } from "leaflet";
import { FunctionComponent, SVGProps } from "react";

export interface HttpResponse {
  success?: true;
  error?: AxiosError;
}

export type ImageSrc = string;

export interface ImageSrcProp {
  imageSrc: ImageSrc;
}

export interface BasicDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export interface Address {
  _id?: string;
  street: string;
  postCode: string;
  city: string;
}

export interface User {
  _id: string;
  email: string;
  nickname: string;
  role: Role;
}

export type MarkerIconType = "default" | "wind power" | "heat" | "solar";

export interface Pin {
  _id?: string;
  latlng: Coordinates;
  markerIconType: MarkerIconType;
  name: string;
  address: Address;
  creator: User;
  description: OutputData;
  shorts: Short[];
}

export type Coordinates = {
  lat: number;
  lng: number;
};

export interface Role {
  name: string;
}

export type ReactChildren = {
  children: React.ReactNode;
};

export interface Classes {
  [key: string]: string;
}

export interface CityType {
  name: string;
  urlParam: string;
  latLng: LatLngExpression;
}

export type AzureImage = {
  name: string;
  blobUrl: string;
  blobName: string;
};

export type ManipulatedImage = {
  uuid: string;
  originalImage?: AzureImage;
  manipulatedImageVariants?: AzureImage[];
  visualizationType?: string;
  inProcess?: boolean;
  sentToServer?: boolean;
  error?: boolean;
};

export type Short = {
  _id?: string;
  image: AzureImage;
  title: string;
  message: string;
  hyperlink?: string;
  postCode: string;
  housingCondition: string;
  pin?: Pin;
};

export type PinFormValues = {
  _id: string | null;
  name: string;
  latlng: {
    lat: number | string;
    lng: number | string;
  };
  address: {
    _id: string | null;
    street: string;
    postCode: string;
    city: string;
  };
  creator: User | null;
  description: OutputData | null;
  markerIconType: string;
};

export type HousingConditionType =
  | "own-home"
  | "rented-home"
  | "own-flat"
  | "other"
  | "";

export interface OSMResponse {
  osm_id: string;
  lat: number;
  lon: number;
  display_name: string;
}

export interface MarkerIconOption {
  label: string;
  value: string;
  iconUrl: string;
  icon: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
}

export type EditorProps = {
  data?: OutputData;
  onChange(val: OutputData): void;
  holder: string;
  readOnly: boolean;
};

export interface PinLocation
  extends Omit<
    Pin,
    "_id" | "markerIconType" | "name" | "creator" | "description" | "shorts"
  > {
  latlng: Coordinates;
  address: Address;
}

export interface Scenario {
  value: string;
  label: string;
  image: string;
  smallImage?: string;
  isSelected?: boolean;
  disclaimer?: string;
}

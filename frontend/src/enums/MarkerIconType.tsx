/// <reference types="vite-plugin-svgr/client" />
import WindPowerIconUrl from "../assets/MapIcons/wind-power.svg";
import HeatIconUrl from "../assets/MapIcons/fire.svg";
import SolarIconUrl from "../assets/MapIcons/solar-panel.svg";
import WindPowerIcon from "../assets/MapIcons/wind-power.svg?react";
import HeatIcon from "../assets/MapIcons/fire.svg?react";
import SolarIcon from "../assets/MapIcons/solar-panel.svg?react";
import PinIcon from "../assets/MapIcons/pin.svg?react";
import PinIconUrl from "../assets/MapIcons/pin.svg";

export function WindPowerIconComponent() {
  return <WindPowerIcon width={25} height={25}></WindPowerIcon>;
}

export function HeatIconComponent() {
  return <HeatIcon width={25} height={25}></HeatIcon>;
}

export function SolarIconComponent() {
  return <SolarIcon width={25} height={25}></SolarIcon>;
}

export function PinIconComponent() {
  return <PinIcon width={25} height={25}></PinIcon>;
}

import { ReactNode } from "react";

export const MarkerIconType = {
  Default: {
    iconType: "default",
    iconUrl: PinIconUrl,
    icon: PinIcon,
  },
  WindPower: {
    iconType: "wind power",
    iconUrl: WindPowerIconUrl,
    icon: WindPowerIcon,
  },
  Heat: {
    iconType: "heat",
    iconUrl: HeatIconUrl,
    icon: HeatIcon,
  },
  Solar: {
    iconType: "solar",
    iconUrl: SolarIconUrl,
    icon: SolarIcon,
  },
};

export const getByIconType = (iconType: string) => {
  switch (iconType) {
    case MarkerIconType.WindPower.iconType:
      return MarkerIconType.WindPower;
    case MarkerIconType.Heat.iconType:
      return MarkerIconType.Heat;
    case MarkerIconType.Solar.iconType:
      return MarkerIconType.Solar;
    default:
      return MarkerIconType.Default;
  }
};

export const markerIcons: Record<string, ReactNode> = {
  default: PinIconComponent(),
  "wind power": WindPowerIconComponent(),
  heat: HeatIconComponent(),
  solar: SolarIconComponent(),
};

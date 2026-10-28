import { MarkerIconType } from "../../../enums/MarkerIconType";

const markerIconOptions = [
  {
    label: "Default",
    value: MarkerIconType.Default.iconType,
    iconUrl: MarkerIconType.Default.iconUrl,
    icon: MarkerIconType.Default.icon,
  },
  {
    label: "Wind Power Icon",
    icon: MarkerIconType.WindPower.icon,
    value: MarkerIconType.WindPower.iconType,
    iconUrl: MarkerIconType.WindPower.iconUrl,
  },
  {
    label: "Heat Icon",
    icon: MarkerIconType.Heat.icon,
    value: MarkerIconType.Heat.iconType,
    iconUrl: MarkerIconType.Heat.iconUrl,
  },
  {
    label: "Solar Icon",
    icon: MarkerIconType.Solar.icon,
    value: MarkerIconType.Solar.iconType,
    iconUrl: MarkerIconType.Solar.iconUrl,
  },
];

export default markerIconOptions;

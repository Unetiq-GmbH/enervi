import { CityType } from "../types";

const City: { [key: string]: CityType } = {
  Berlin: {
    name: "Berlin",
    urlParam: "berlin",
    latLng: [52.520008, 13.404954],
  },
  Neuerkirch: {
    name: "Neuerkirch/Külz",
    urlParam: "neuerkirch",
    latLng: [50.013532, 7.491134],
  },
};

export default City;

import { Pin, PinFormValues } from "@/types";

export const getPinFormInitialValues = (pin: Pin | null): PinFormValues => {
  return {
    _id: pin?._id ?? null,
    name: pin?.name ?? "",
    latlng: {
      lat: pin?.latlng?.lat ?? "",
      lng: pin?.latlng?.lng ?? "",
    },
    address: {
      _id: pin?.address?._id ?? null,
      street: pin?.address?.street ?? "",
      postCode: pin?.address?.postCode ?? "",
      city: pin?.address?.city ?? "",
    },
    creator: pin?.creator ?? null,
    description: pin?.description ?? null,
    markerIconType: pin?.markerIconType ?? "default",
  };
};

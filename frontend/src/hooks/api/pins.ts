import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "../../enums/QueryKey";
import {
  getPins,
  getPinFromOpenStreetMapByCoordinates,
} from "../../service/pin.service";
import { Coordinates, Pin } from "../../types";

export function usePins(): [Pin[], boolean] {
  const { data, isLoading: isLoadingPins } = useQuery({
    queryKey: [QueryKey.Pins],
    queryFn: () => getPins(),
    initialData: [],
  });

  return [data, isLoadingPins];
}

export function usePinFromOpenStreetMapByCoordinates(coordinates: Coordinates) {
  const { lat, lng } = coordinates;

  const {
    data,
    refetch,
    isLoading: isLoadingPin,
  } = useQuery({
    queryKey: [QueryKey.PinFromOpenStreetMapByCoordinates],
    queryFn: () => getPinFromOpenStreetMapByCoordinates(coordinates),
    enabled: !!lat && !!lng,
  });

  return { data, refetch, isLoadingPin };
}

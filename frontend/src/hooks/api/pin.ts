import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "../../enums/QueryKey";
import { getPin } from "../../service/pin.service";
import { Coordinates } from "../../types";

export function usePin(coordinates: Coordinates) {
  const { lat, lng } = coordinates;

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [QueryKey.Pin, lat, lng],
    queryFn: () => getPin(coordinates),
    enabled: !!lat && !!lng,
  });

  return { data, error, isLoading, refetch };
}

import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "../../enums/QueryKey";
import { Short } from "@/types";
import { getShort } from "@/service/short.service";

export const getShortByIdQueryKey = (id: string) => [QueryKey.Shorts, id];

export function useShortById(id: string): [Short | undefined, boolean] {
  const { data, isLoading } = useQuery({
    queryKey: getShortByIdQueryKey(id),
    queryFn: () => getShort(id),
    enabled: !!id,
  });

  return [data, isLoading];
}

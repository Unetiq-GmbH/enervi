import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "../../enums/QueryKey";
import { getShorts } from "../../service/short.service";
import { Short } from "../../types";

const getShortsQueryKey = ({ housingCondition, postCode }: Partial<Short>) => {
  if (housingCondition || postCode) {
    return [
      QueryKey.Shorts,
      {
        ...(housingCondition && { housingCondition }),
        ...(postCode && { postCode }),
      },
    ];
  }

  return [QueryKey.Shorts];
};

export function useShorts(
  params: Record<string, never> | Partial<Short> = {}
): [Short[], boolean] {
  const { housingCondition, postCode } = params;
  const { data, isLoading: isLoadingShort } = useQuery({
    queryKey: getShortsQueryKey({ housingCondition, postCode }),
    queryFn: () => getShorts({ housingCondition, postCode }),
    initialData: [],
  });

  return [data, isLoadingShort];
}

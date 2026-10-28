import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "../../enums/QueryKey";
import {
  getManipulatedImage,
  checkServerStatus,
} from "../../service/image.service";

export function useManipulatedImage(imageManipulationUUID: string) {
  const { data } = useQuery({
    queryKey: [QueryKey.ManipulatedImage, { imageManipulationUUID }],
    queryFn: () => getManipulatedImage(imageManipulationUUID),
    enabled: !!imageManipulationUUID,
  });

  return data;
}

export function useServerStatusCheck(imageManipulationUUID: string) {
  const { data, isError } = useQuery({
    queryKey: [QueryKey.CheckServerStatus],
    queryFn: checkServerStatus,
    enabled: !!imageManipulationUUID,
  });

  return { data, isError };
}

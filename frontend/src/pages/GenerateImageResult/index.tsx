import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import FourImagesPreviewContainer from "@/components/FourImagesPreviewContainer";

import SocketEvents from "@/enums/SocketEvents";
import { useServerStatusCheck } from "@/hooks/api/manipulatedImages";
import { useShorts } from "@/hooks/api/shorts";
import { getManipulatedImage } from "@/service/image.service";
import { socket } from "@/socket/socket";
import { HousingConditionType } from "@/types";

import Header from "@ui/Header";
import ShortCards from "@ui/ShortCards";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import SuccessIcon from "../../assets/icons/success.svg";
import styles from "./index.module.scss";
import { getStorage, setStorage } from "@/utils/storage";
import { StorageKey } from "@/enums/StorageKey";

const GenerateImageResult = () => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const housingCondition = (searchParams.get("housingCondition") ??
    "") as HousingConditionType;
  const postCode = searchParams.get("postCode") ?? "";
  const imageManipulationUUID = useParams().imageManipulationUUID as string;

  const [shorts, isLoading] = useShorts({ housingCondition, postCode });
  const [imageSources, setImageSources] = useState<(string | undefined)[]>([]);

  const [error, setError] = useState<boolean>(false);

  const { isError: serverStatusCheckFailed } = useServerStatusCheck(
    imageManipulationUUID
  );

  const handleSetPreviosResults = () => {
    const results = getStorage(StorageKey.MANIPULATION_RESULTS);

    if (!results || results?.uuid !== imageManipulationUUID) return;

    const isResultsFailed = !results?.manipulatedImageVariants;
    if (isResultsFailed) {
      setError(true);
      return;
    }

    setImageSources(
      results.manipulatedImageVariants.map(
        (b: { blobUrl: string }) => b?.blobUrl
      )
    );
  };

  const handleImageManipulationFailed = () => {
    setStorage(StorageKey.MANIPULATION_RESULTS, {
      uuid: imageManipulationUUID,
    });
    setError(true);
  };

  const handleImageManipulationFinished = async () => {
    try {
      const data = await getManipulatedImage(imageManipulationUUID);

      setStorage(StorageKey.MANIPULATION_RESULTS, data);

      if (data?.manipulatedImageVariants?.[0]?.blobUrl) {
        const sources = data.manipulatedImageVariants.map((b) => b?.blobUrl);
        setImageSources(sources);
        setError(false);
      } else {
        handleImageManipulationFailed();
      }
    } catch {
      handleImageManipulationFailed();
    }
  };

  useEffect(() => {
    socket.emit(
      SocketEvents.createGroupForImageManipulation,
      imageManipulationUUID
    );
    socket.on(
      SocketEvents.imageManipulationFinished,
      handleImageManipulationFinished
    );
    socket.on(
      SocketEvents.imageManipulationFailed,
      handleImageManipulationFailed
    );

    return () => {
      socket.off(
        SocketEvents.imageManipulationFinished,
        handleImageManipulationFinished
      );
      socket.off(
        SocketEvents.imageManipulationFailed,
        handleImageManipulationFailed
      );
    };
  }, [imageManipulationUUID]);

  useEffect(() => {
    window.scrollTo(0, 0);

    handleSetPreviosResults();
  }, []);

  const sortedShorts = [...shorts].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <Wrapper>
      <Header doubleBtnType="secondary" />
      <div className={styles.container}>
        <div className={styles.success}>
          {!imageSources.length ? (
            <Typography as="h6" className={styles.title}>
              {error || serverStatusCheckFailed
                ? t("an-error-occurred-during-generation")
                : t("generating")}
            </Typography>
          ) : (
            <>
              <Typography
                as="h6"
                className={styles.titleSuccess}
                sx={{ width: "fit-content" }}
              >
                {t("completed")}{" "}
              </Typography>
              <img src={SuccessIcon} alt="Success" />
            </>
          )}
        </div>

        <FourImagesPreviewContainer
          imageSources={imageSources}
          error={serverStatusCheckFailed || error}
          onError={handleImageManipulationFailed}
        />
        <Typography as="h6" className={styles.titleWorry}>
          {t("learn-everything-about-energy-transitions")}{" "}
        </Typography>
        <Typography
          className={`${styles.description} ${styles.descriptionWorry}`}
        >
          {t("dont-worry-you-can-read-while-your-image-is-being-generated")}{" "}
        </Typography>
      </div>
      {!isLoading && <ShortCards shorts={sortedShorts} openInModal />}
    </Wrapper>
  );
};

export default GenerateImageResult;

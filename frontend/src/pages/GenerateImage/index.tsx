import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import Drop from "@/components/Drop";
import ScenarioCards from "@/components/ScenarioCards";
import { appendQueryParamsToUrl } from "@/utils";

import Button from "@ui/Button";
import Checkbox from "@ui/Checkbox";
import Header from "@ui/Header";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import SocketEvents from "@/enums/SocketEvents";
import { manipulateImage } from "@/service/image.service";
import { socket } from "../../socket/socket";

import GenerateImageSelect from "./GenerateImageSelect";
import styles from "./index.module.scss";
import { HousingConditionType } from "@/types";
import { base64ToFile } from "@/utils/file";
import { StorageKey } from "@/enums/StorageKey";

const GenerateImage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [image, setImage] = useState<File>();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [housingCondition, setHousingCondition] =
    useState<HousingConditionType>("");
  const [selectedCardValue, setSelectedCardValue] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCardClick = (value: string) => {
    setSelectedCardValue(value === selectedCardValue ? "" : value);
  };

  const isGenerateEnabled = !!imageSrc && isChecked && selectedCardValue !== "";

  const { mutate: handleManipulateImage } = useMutation({
    mutationFn: manipulateImage,

    onSuccess: (_, variables) => {
      const imageManipulationUUID = variables.get(StorageKey.IMG_UUID);
      const url = appendQueryParamsToUrl(
        "/generate-image-result/" + imageManipulationUUID,
        { housingCondition }
      );

      localStorage.removeItem(StorageKey.MANIPULATION_RESULTS);
      localStorage.setItem(StorageKey.ORIGINAL_IMAGE, imageSrc);

      navigate(url);
    },
    onError: (err) => {
      setErrorMessage(err.message);
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSubmit = () => {
    setLoading(true);
    setErrorMessage("");

    const imageManipulationUUID = uuidv4();
    localStorage.setItem(StorageKey.IMG_UUID, imageManipulationUUID);

    socket.emit(
      SocketEvents.createGroupForImageManipulation,
      imageManipulationUUID
    );

    if (image) {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("imageManipulationUUID", imageManipulationUUID);
      formData.append("visualizationType", selectedCardValue);
      formData.append("lang", i18n.language);
      if (housingCondition) {
        formData.append("housingCondition", housingCondition);
      }

      handleManipulateImage(formData);
    }
  };

  const livingConditions = [
    { value: "own-home", label: t("own-home") },
    { value: "own-flat", label: t("own-flat") },
    { value: "rented-flat", label: t("rented-flat") },
    { value: "other", label: t("other") },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const originalImage = localStorage.getItem(StorageKey.ORIGINAL_IMAGE);

    if (originalImage) {
      const file = base64ToFile(originalImage);
      setImage(file);
      setImageSrc(originalImage);
    }
  }, []);

  return (
    <Wrapper>
      <Header doubleBtnType="secondary" />
      <div className={styles.container}>
        <div className={styles.containerDrop}>
          {!imageSrc && (
            <>
              <Typography className={styles.start}>
                {t("get-started")}
              </Typography>
              <Typography as={"h3"} className={styles.title}>
                {t("upload-an-image")}
              </Typography>
              <Typography className={styles.description}>
                {t("upload-an-image-of-choice-to-start-ai-generation")}
              </Typography>
            </>
          )}
          <div className={styles.wrapperDrop}>
            <Drop
              imageSrc={imageSrc}
              setImage={setImage}
              setImageSrc={setImageSrc}
            />
          </div>
        </div>

        <div className={styles.containerScenario}>
          <div>
            <Typography as={"h6"}>{t("select-a-scenario")}</Typography>
            <Typography className={styles.descriptionScenario}>
              {t("choose-and-apply-a-scenario-of-choice")}
            </Typography>
          </div>
          <ScenarioCards
            selectedCardValue={selectedCardValue}
            onCardClick={handleCardClick}
          />
          <div className={styles.containerOptional}>
            <Typography as={"h6"} mb="16px">
              {t("optional-information")}
            </Typography>
            <div className={styles.inputs}>
              <GenerateImageSelect
                label={t("where-do-you-currently-live")}
                options={livingConditions}
                onSelect={(value) => {
                  setHousingCondition(value as HousingConditionType);
                }}
              />
            </div>
          </div>

          <Checkbox
            label={t(
              "ich-bin-mit-den-nutzungsbedingungen-von-enervi-einverstanden"
            )}
            isChecked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <Button disabled={!isGenerateEnabled} onClick={handleSubmit}>
            {loading ? t("generating") : t("generate")}
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default GenerateImage;

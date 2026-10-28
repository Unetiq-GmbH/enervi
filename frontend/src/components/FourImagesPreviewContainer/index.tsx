import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import SpinnerIcon from "@/assets/icons/arrows_reload.svg";
import { removeManipulatedImage } from "@/service/image.service";

import Button from "@ui/Button";
import Typography from "@ui/Typography";

import styles from "./index.module.scss";
import { StorageKey } from "@/enums/StorageKey";

interface Props {
  imageSources?: (string | undefined)[];
  error: boolean;
  onError?: () => void;
}

const FourImagePreviewContainer = ({ imageSources, error, onError }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isImagesLoaded, setIsImagesLoaded] = useState<boolean>(false);

  const handleDownload = (src?: string) => {
    if (!src) return;
    const link = document.createElement("a");
    link.href = src;
    link.download = "image";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadAnother = () => {
    navigate("/generate-image");
    localStorage.removeItem(StorageKey.ORIGINAL_IMAGE);
    localStorage.removeItem(StorageKey.MANIPULATION_RESULTS);
  };

  const handleChooseAnotherScenario = () => {
    navigate("/generate-image");
    localStorage.removeItem(StorageKey.MANIPULATION_RESULTS);
  };

  const handleClick = () => {
    const imageManipulationUUID = localStorage.getItem(StorageKey.IMG_UUID);

    if (imageManipulationUUID) {
      removeManipulatedImage(imageManipulationUUID).then(() => {
        localStorage.removeItem(StorageKey.IMG_UUID);
        navigate("/generate-image");
      });
    } else {
      navigate("/generate-image");
    }
    localStorage.removeItem(StorageKey.MANIPULATION_RESULTS);
  };

  const handleImagesLoad = () => {
    setIsImagesLoaded(true);
  };

  const isImages = !!imageSources && !!imageSources.length;
  const imageClassNames = [
    styles.generatedImage,
    isImages ? styles.images : "",
  ].join(" ");

  return (
    <div className={styles.container}>
      <div className={imageClassNames}>
        {error ? (
          <>
            <Typography className={styles.errorText}>
              {t("something-went-wrong-please-try-again")}{" "}
            </Typography>
            <Button typeButton="primary" onClick={handleClick}>
              {t("go-back-to-generate-image")}{" "}
            </Button>
          </>
        ) : isImages ? (
          <>
            {!isImagesLoaded && (
              <div className={styles.loaderContainer}>
                <img
                  src={SpinnerIcon}
                  alt={t("loading")}
                  className={styles.spinner}
                />
                <Typography className={styles.title} textAlign="center">
                  {t("image_are_being_calculated")}
                </Typography>

                <Typography className={styles.description} textAlign="center">
                  {t(
                    "your-request-will-be-processed-soon-please-dont-close-this-tab"
                  )}
                </Typography>
              </div>
            )}
            <div className={styles.fourImagesContainer}>
              {imageSources.map((src, i) => (
                <div className={styles.imagePlaceholder} key={i}>
                  <img
                    src={src}
                    alt={t("generated")}
                    style={{
                      display: isImagesLoaded ? "block" : "none",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onLoad={handleImagesLoad}
                    onError={onError}
                  />
                  <div className={styles.downloadButton}>
                    <Button
                      typeButton="primary"
                      onClick={() => handleDownload(src)}
                    >
                      {t("download")}{" "}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.loaderContainer}>
            <img
              src={SpinnerIcon}
              alt={t("loading")}
              className={styles.spinner}
            />
            <Typography className={styles.title}>
              {t("image_are_being_calculated")}
            </Typography>
            <Typography className={styles.description}>
              {t(
                "your-request-will-be-processed-soon-please-dont-close-this-tab"
              )}
            </Typography>
          </div>
        )}
      </div>

      {isImages && !error && isImagesLoaded && (
        <div className={styles.buttonContainer}>
          <Button typeButton="secondary" onClick={handleChooseAnotherScenario}>
            {t("choose-another-scenario")}{" "}
          </Button>
          <Button typeButton="secondary" onClick={handleUploadAnother}>
            {t("upload-another-image")}{" "}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FourImagePreviewContainer;

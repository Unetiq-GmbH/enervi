import { Dispatch, DragEvent, SetStateAction, useState } from "react";
import Button from "@ui/Button";
import icon from "@/assets/icons/img.svg";

import styles from "./index.module.scss";
import { useTranslation } from "react-i18next";
import { compressFile } from "./utils";

const MIN_IMAGE_SIZE = 1024;

interface Props {
  imageSrc: string;
  setImageSrc: Dispatch<SetStateAction<string>>;
  setImage?: Dispatch<SetStateAction<File | undefined>>;
  centerButton?: boolean;
}

const Drop = ({ imageSrc, setImageSrc, setImage, centerButton }: Props) => {
  const { t } = useTranslation();

  const [imageSizeError, setImageSizeError] = useState<boolean>(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const compressedFile = await compressFile(file);

      if (compressedFile === null) {
        alert(t("Something went wrong while processing the image"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageSrc(result);
        setImage?.(compressedFile);
        checkImageSize(result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error(err);
      alert(t("image-processing-failed"));
    }
  };

  const checkImageSize = (imageSrc: string) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImageSizeError(img.width + img.height < MIN_IMAGE_SIZE);
    };
  };

  const onUploadImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  };

  return (
    <>
      <div
        className={styles.dropZone}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {imageSrc ? (
          <div className={styles.imageContainer}>
            <img src={imageSrc} alt={t("preview")} className={styles.preview} />
            {centerButton && (
              <div className={styles.centerButtonContainer}>
                <Button
                  type="button"
                  onClick={onUploadImage}
                  typeButton="tertiary"
                >
                  {t("upload-image")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <img src={icon} alt={t("icon")} className={styles.icon} />
            <p className={styles.text}>{t("drag-image-here-or")}</p>
            <div className={styles.buttons}>
              <Button type="button" onClick={onUploadImage}>
                {t("upload-image")}
              </Button>
            </div>
            {imageSizeError && (
              <p className={styles.error}>{t("image-is-too-small")}</p>
            )}
          </>
        )}
      </div>
      {imageSrc && !centerButton && (
        <div className={styles.button}>
          <Button onClick={onUploadImage} typeButton="secondary">
            {t("upload-new-image")}
          </Button>
        </div>
      )}
    </>
  );
};

export default Drop;

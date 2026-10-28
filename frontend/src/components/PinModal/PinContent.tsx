import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import CloseIcon from "@/assets/icons/close.svg";
import { Pin, Short } from "@/types";

import Button from "@ui/Button";
import FormattedText from "@ui/FormattedText";
import Typography from "@ui/Typography";

import styles from "./index.module.scss";

interface Props {
  pin: Pin;
  onClose: () => void;
}

const PinContent = ({ pin, onClose }: Props) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const short: Short | null = pin?.shorts?.length ? pin.shorts[0] : null;

  const title = short ? short.title : (pin?.name ?? "");
  const images =
    pin?.description?.blocks.filter((block) => block.type === "image") ?? [];
  const imageSrc = short
    ? short.image?.blobUrl
    : (images[selectedImageIndex]?.data.file.url ?? "");
  const descriptionText = short
    ? short.message
    : (pin?.description?.blocks
        .filter((block) => block.type === "paragraph")
        .map((block) => block.data.text)
        .join("\n") ?? "");

  const subtitle = short ? "Article" : "Visualization";

  return (
    <>
      <button className={styles.closeButton} onClick={onClose}>
        <img src={CloseIcon} alt="Close" />
      </button>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <Typography className={styles.title}>{title}</Typography>
            <Typography className={styles.subtitle}>{subtitle}</Typography>
          </div>
        </header>

        {imageSrc && (
          <img src={imageSrc} alt={title} className={styles.image} />
        )}

        {!short && images.length > 0 && (
          <div className={styles.imageCaptions}>
            {images.map((image, index) => {
              const caption = image.data.caption;
              if (!caption) return null;

              return (
                <Button
                  key={image.id}
                  typeButton={
                    index === selectedImageIndex ? "primary" : "cancel"
                  }
                  onClick={() => setSelectedImageIndex(index)}
                >
                  {caption}
                </Button>
              );
            })}
          </div>
        )}

        <div className={styles.description}>
          <FormattedText text={descriptionText} />
        </div>

        <div className={styles.footerBlock}>
          <div className={styles.textBlock}>
            <Typography className={styles.footerTitle}>
              {t("try-it-yourself")}
            </Typography>
            <Typography className={styles.footerText}>
              {t(
                "upload-an-image-and-see-the-energy-transition-in-your-environment"
              )}
            </Typography>
          </div>
          <Button
            typeButton="primary"
            sx={{
              whiteSpace: "nowrap",
              borderRadius: "8px",
              fontSize: "14px",
            }}
            onClick={() => navigate("/generate-image")}
          >
            {t("upload-image")}
          </Button>
        </div>
      </div>
    </>
  );
};

export default PinContent;

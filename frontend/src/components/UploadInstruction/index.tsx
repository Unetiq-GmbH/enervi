import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Button from "@ui/Button";
import Typography from "@ui/Typography";

import styles from "./index.module.scss";

const UploadInstruction = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/generate-image");
  };

  return (
    <div className={styles.container}>
      <div>
        <Typography as="h4" bold className={styles.title}>
          {t("try-it-yourself")}
        </Typography>
        <Typography as="p" className={styles.description}>
          {t(
            "upload-an-image-and-watch-our-ai-powered-visualization-tool-display-the-generated-result"
          )}
        </Typography>
      </div>
      <Button typeButton="primary" onClick={handleButtonClick}>
        {t("upload-an-image")}
      </Button>
    </div>
  );
};

export default UploadInstruction;

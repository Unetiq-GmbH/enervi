import { useNavigate } from "react-router-dom";

import Button from "@ui/Button";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import styles from "./index.module.scss";
import { useTranslation } from "react-i18next";

interface Props {
  pageType: "articles" | "singleArticle";
}

const BlockUpload = ({ pageType }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const content = {
    articles: {
      title: t("try-it-yourself"),
      description: t(
        "upload-an-image-and-watch-our-ai-powered-visualization-tool-displays-the-generated-result"
      ),
    },
    singleArticle: {
      title: t("visualizing-the-future-of-energy"),
      description: t(
        "upload-an-image-and-watch-our-ai-powered-visualization-tool-displays-the-generated-result"
      ),
    },
  };
  const handleButtonClick = () => {
    navigate("/generate-image");
  };

  let isColumn = false;
  if (pageType === "singleArticle") {
    isColumn = true;
  }

  return (
    <Wrapper>
      <div className={styles.container + " " + (isColumn ? styles.column : "")}>
        <div>
          <Typography as="h4" bold className={styles.title}>
            {content[pageType].title}
          </Typography>
          <Typography as="p" className={styles.description}>
            {content[pageType].description}
          </Typography>
        </div>
        <Button typeButton="primary" onClick={handleButtonClick}>
          {t("upload-an-image")}
        </Button>
      </div>
    </Wrapper>
  );
};

export default BlockUpload;

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import useMediaQuery from "@/hooks/useMediaQuery";

import Button from "@ui/Button";
import Header from "@ui/Header";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import EVMap from "./EVMap";
import styles from "./index.module.scss";

const EnerViMap = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const matchesMobile = useMediaQuery("(max-width: 768px)");

  const marginBottomButton = matchesMobile ? "199px" : "458px";
  const textAlign = matchesMobile ? "center" : "left";

  const handleButtonClick = () => {
    navigate("/generate-image");
  };

  return (
    <div className={styles.container}>
      <Wrapper>
        <Header showUpload />
        <div className={styles.main}>
          <Typography as={"h1"} bold mb={"8px"} textAlign={"center"}>
            {t("visualizing-the-future-of-energy")}{" "}
          </Typography>
          <Typography textAlign={textAlign} className={styles.description}>
            {t("discover-energy-transition-measures-around-germany-with-ai")}{" "}
          </Typography>
          <Button
            sx={{ marginBottom: marginBottomButton }}
            onClick={handleButtonClick}
          >
            {t("try-it-yourself")}{" "}
          </Button>
        </div>
        <div className={styles.mapContainer}>
          <EVMap showSwitcher />
        </div>
      </Wrapper>
    </div>
  );
};

export default EnerViMap;

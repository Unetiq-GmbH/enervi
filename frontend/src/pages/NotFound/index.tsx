import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import { useTranslation } from "react-i18next";

import Button from "@ui/Button";
import Header from "@ui/Header";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import notFoundImage from "../../assets/404.png";
import arrow_left from "../../assets/icons/arrow-left.svg";

const NotFound = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Wrapper>
      <Header doubleBtnType="secondary" />
      <div className={styles.notFound}>
        <img
          src={notFoundImage}
          alt={t("404-not-found")}
          className={styles.notFoundImage}
        />
        <div className={styles.textOverlay}>
          <Typography className={styles.errorCode}>{t("404-error")}</Typography>
          <Typography className={styles.pageNotFound}>
            {t("page-not-found")}
          </Typography>
          <Typography className={styles.message}>
            {t("sorry-the-page-you-are-looking-for-doesnt-exist")}
            <br /> {t("here-are-some-helpful-links")}
          </Typography>
          <Typography className={styles.message}></Typography>
          <div className={styles.buttonContainer}>
            <Button
              typeButton="cancel"
              onClick={handleGoBack}
              sx={{
                background: "#EBEBEB",
              }}
              icon={arrow_left}
            >
              {t("go-back")}
            </Button>
            <Button typeButton="primary" onClick={handleGoHome}>
              {t("go-home")}
            </Button>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default NotFound;

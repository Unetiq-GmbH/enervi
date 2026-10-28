import { useTranslation } from "react-i18next";

import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

import styles from "./index.module.scss";

const Partnerships = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <div className={styles.partnershipContainer}>
        <div className={styles.block}>
          <Typography className={styles.title}>
            {t("funding-notice").toUpperCase()}
          </Typography>
          <Typography className={styles.notice}>{t("funding-body")}</Typography>
        </div>
        <div className={styles.block}>
          <Typography className={styles.title}>
            {t("project-partners").toUpperCase()}
          </Typography>
          <Typography className={styles.notice}>
            {t("project-partner-names")}
          </Typography>
        </div>
      </div>
    </Wrapper>
  );
};

export default Partnerships;

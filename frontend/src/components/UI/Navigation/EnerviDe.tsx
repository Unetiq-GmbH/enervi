import NewWindow from "@/assets/icons/new-window.svg";

import styles from "./index.module.scss";
import { useTranslation } from "react-i18next";

const EnerviDe = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.research}>
      <a
        href={"https://enervi.de/"}
        className={styles.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("research-project-website")}
      </a>
      <img src={NewWindow} alt="new-window" />
    </div>
  );
};

export default EnerviDe;

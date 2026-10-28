import { Link, useLocation } from "react-router-dom";

import useMediaQuery from "@/hooks/useMediaQuery";
import { useTranslation } from "react-i18next";

import styles from "./index.module.scss";
import EnerviDe from "./EnerviDe";

interface Props {
  typeButton?: "primary" | "secondary";
}

const Navigation = ({ typeButton = "primary" }: Props) => {
  const { t } = useTranslation();

  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isOnFirstButtonPage = location.pathname === "/";
  const isOnSecondButtonPage = location.pathname === "/articles";

  return (
    <>
      <div className={`${styles.buttonContainer} ${styles[typeButton]}`}>
        <Link
          to={"/"}
          className={styles.link}
          style={{ color: isOnFirstButtonPage ? "#66A811" : "#000000" }}
        >
          {t("home")}
        </Link>
        <Link
          to={"/articles"}
          className={styles.link}
          style={{ color: isOnSecondButtonPage ? "#66A811" : "#000000" }}
        >
          {t("articles")}
        </Link>
        {isDesktop && <EnerviDe />}
      </div>
      {!isDesktop && (
        <div className={`${styles.buttonContainer} ${styles[typeButton]}`}>
          <EnerviDe />
        </div>
      )}
    </>
  );
};

export default Navigation;

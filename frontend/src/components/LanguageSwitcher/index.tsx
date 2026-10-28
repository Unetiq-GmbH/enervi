import useLanguage from "@/hooks/useLanguage";
import styles from "./index.module.scss";

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className={styles.switcherContainer}>
      <button
        className={`${styles.languageButton} ${language === "en" ? styles.active : ""}`}
        onClick={() => changeLanguage("en")}
      >
        EN
      </button>
      <span className={styles.separator}>|</span>
      <button
        className={`${styles.languageButton} ${language === "de" ? styles.active : ""}`}
        onClick={() => changeLanguage("de")}
      >
        DE
      </button>
    </div>
  );
};

export default LanguageSwitcher;

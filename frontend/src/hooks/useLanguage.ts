import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const useLanguage = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem("language") ?? "de";
  });

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  return {
    language,
    changeLanguage,
  };
};

export default useLanguage;

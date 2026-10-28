import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import { useTranslation } from "react-i18next";

import Button from "@ui/Button";
import Typography from "@ui/Typography";
import cookie from "@/assets/cookie.png";

import classes from "./index.module.scss";

const COOKIE_NAME = "cookieAccepted";
const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
const cookies = new Cookies();

export default function CookieBanner() {
  const { t } = useTranslation();

  const [cookieAccepted, setCookieAccepted] = useState<boolean>(true);

  useEffect(() => {
    const currentStatus = cookies.get(COOKIE_NAME);
    setCookieAccepted(!!currentStatus);
  }, []);

  useEffect(() => {
    if (!cookieAccepted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [cookieAccepted]);

  function handleAcceptCookie() {
    cookies.set(COOKIE_NAME, "true", {
      path: "/",
      maxAge: ONE_YEAR_IN_SECONDS,
    });
    setCookieAccepted(true);
  }

  function handleClose() {
    setCookieAccepted(true);
  }

  if (cookieAccepted) return null;

  return ReactDOM.createPortal(
    <div className={classes.overlay}>
      <div className={classes.cookieModal}>
        <img src={cookie} alt="Cookie icon" />
        <Typography className={classes.cookieTitle}>{t("cookies")}!</Typography>
        <Typography className={classes.cookieText}>
          {t("we-use-cookies-to-make-your-experience-better")}
        </Typography>
        <div className={classes.buttonContainer}>
          <Button typeButton="cancel" onClick={handleClose}>
            {t("decline")}
          </Button>
          <Button typeButton="primary" onClick={handleAcceptCookie}>
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

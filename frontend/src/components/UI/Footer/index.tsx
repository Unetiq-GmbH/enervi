import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

import Button from "@ui/Button";
import Wrapper from "@ui/Wrapper";

import Partnerships from "@/components/Partnerships";
import { removeStorage } from "@utils/storage";

import styles from "./index.module.scss";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { loginWithRedirect, user, logout } = useAuth0();

  const handleLogout = () => {
    removeStorage("user");
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <Wrapper>
      <Partnerships />
      <footer className={styles.footer}>
        {!user ? (
          <Button
            typeButton="tertiary"
            onClick={() => loginWithRedirect()}
            sx={{ padding: "0px" }}
          >
            {t("admin-login")}
          </Button>
        ) : (
          <>
            <Button
              typeButton="tertiary"
              onClick={() => handleLogout()}
              sx={{ padding: "18px" }}
            >
              {t("logout")}
            </Button>

            <Button
              typeButton="tertiary"
              onClick={() => navigate("/pins")}
              sx={{ padding: "18px" }}
            >
              {t("manage-pins")}
            </Button>
          </>
        )}
      </footer>
    </Wrapper>
  );
};

export default Footer;

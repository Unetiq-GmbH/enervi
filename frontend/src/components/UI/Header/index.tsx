import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Button from "@ui/Button";
import Navigation from "@/components/UI/Navigation";
import Logo from "@ui/Logo";

import styles from "./index.module.scss";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface Props {
  btnType?: "primary" | "secondary";
  doubleBtnType?: "primary" | "secondary";
  showUpload?: boolean;
}

const Header = ({
  btnType = "secondary",
  showUpload = false,
  doubleBtnType,
}: Props) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/generate-image");
  };

  return (
    <header className={styles.header}>
      <Link to="/">
        <Logo />
      </Link>
      <div className={styles.divider}>
        <Navigation typeButton={doubleBtnType} />
        {showUpload && (
          <Button typeButton={btnType} onClick={handleButtonClick}>
            {t("upload-image")}
          </Button>
        )}
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;

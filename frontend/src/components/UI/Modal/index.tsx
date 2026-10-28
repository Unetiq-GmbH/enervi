import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";

import CloseIcon from "@/assets/icons/close.svg";
import Button from "@ui/Button";
import Typography from "@ui/Typography";

import BinIcon from "../Icons/BinIcon";
import styles from "./index.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  errorButtonText: string;
  message: string;
}

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  errorButtonText,
  message,
}: Props) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <img src={CloseIcon} alt="Close" />
        </button>
        <div className={styles.iconContainer}>
          <BinIcon backgroundColor="#FEE4E2" />
        </div>
        <Typography className={styles.message}>{message}</Typography>
        <div className={styles.buttonContainer}>
          <Button typeButton="cancel" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button typeButton="error" onClick={onConfirm}>
            {errorButtonText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

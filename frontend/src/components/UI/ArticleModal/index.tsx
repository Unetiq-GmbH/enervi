import { useEffect } from "react";
import ReactDOM from "react-dom";

import CloseIcon from "@/assets/icons/close.svg";
import { Short } from "@/types";

import FormattedText from "@ui/FormattedText";
import Typography from "@ui/Typography";

import styles from "./index.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  short: Short;
}

const ArticleModal = ({ isOpen, onClose, short }: Props) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add(styles.noScroll);
    } else {
      document.body.classList.remove(styles.noScroll);
    }

    return () => {
      document.body.classList.remove(styles.noScroll);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <img
          src={CloseIcon}
          alt="Close"
          className={styles.closeButton}
          onClick={onClose}
        />
        <div className={styles.container}>
          <header className={styles.header}>
            <Typography className={styles.title}>{short.title}</Typography>
          </header>
          <img
            src={short.image.blobUrl}
            alt={short.image.name}
            className={styles.image}
          />
          <div className={styles.description}>
            <FormattedText text={short.message} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ArticleModal;

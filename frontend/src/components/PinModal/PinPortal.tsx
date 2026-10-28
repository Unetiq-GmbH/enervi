import { useEffect } from "react";
import { createPortal } from "react-dom";

import { Pin } from "@/types";

import styles from "./index.module.scss";
import PinContent from "./PinContent";

interface Props {
  pin: Pin | null;
  onClose: () => void;
}

const PinPortal = ({ pin, onClose }: Props) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!pin) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.portal} onClick={(e) => e.stopPropagation()}>
        <PinContent pin={pin} onClose={onClose} />
      </div>
    </div>,
    document.body
  );
};

export default PinPortal;

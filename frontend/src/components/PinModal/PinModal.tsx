import { Pin } from "@/types";

import styles from "./index.module.scss";
import PinContent from "./PinContent";

interface Props {
  pin: Pin | null;
  onClose: () => void;
}

const PinModal = ({ pin, onClose }: Props) => {
  if (!pin) return null;

  return (
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      <PinContent pin={pin} onClose={onClose} />
    </div>
  );
};

export default PinModal;

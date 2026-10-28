import ShortCard from "@ui/ShortCard";
import { Short } from "@/types";

import styles from "./index.module.scss";

interface Props {
  shorts: Short[];
  openInModal?: boolean;
}

const ShortCards = ({ shorts, openInModal }: Props) => {
  return (
    <div className={styles.cards}>
      {shorts.map((short) => (
        <ShortCard key={short._id} short={short} openInModal={openInModal} />
      ))}
    </div>
  );
};

export default ShortCards;

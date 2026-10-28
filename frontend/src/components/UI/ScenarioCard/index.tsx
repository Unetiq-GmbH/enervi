import styles from "./index.module.scss";
import Typography from "../Typography";
import { Scenario } from "@/types";

interface Props {
  card: Scenario;
  isDimmed: boolean;
  onClick: () => void;
}

const ScenarioCard = ({ isDimmed, onClick, card }: Props) => {
  return (
    <div
      className={`${styles.card}  ${isDimmed ? styles.dimmed : ""}`}
      onClick={onClick}
    >
      <div className={styles.imageWrapper}>
        <img src={card.smallImage ?? card.image} alt={card.label} className={styles.image} />
        <Typography className={styles.title}>{card.label}</Typography>
      </div>
    </div>
  );
};

export default ScenarioCard;

import Typography from "@ui/Typography";

import styles from "./index.module.scss";

interface Props {
  number: number;
  title: string;
  description: string;
}

const ItemInstruction = ({ number, title, description }: Props) => {
  return (
    <div className={styles.item}>
      <div className={styles.numberBox}>
        <Typography as="span" bold color="#FFFFFF" textAlign="center">
          {number}
        </Typography>
      </div>
      <div className={styles.textBlock}>
        <Typography as="h5" fontWeight={600} fontSize="20px" color="#101828">
          {title}
        </Typography>
        <Typography as="p" color="#475467" sx={{ letterSpacing: "0px" }}>
          {description}
        </Typography>
      </div>
    </div>
  );
};

export default ItemInstruction;
